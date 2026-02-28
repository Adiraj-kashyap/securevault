const User = require('../models/User');

// Helper to generate a unique tagline from email (e.g. "shadow#4921")
async function generateUniqueTagline(email) {
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let tagline;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 100) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        tagline = `${base}#${randomNum}`;
        const existing = await User.findOne({ tagline });
        if (!existing) isUnique = true;
        attempts++;
    }

    // Fallback if somehow namespace is saturated
    if (!isUnique) {
        return `${base}#${Date.now().toString().slice(-4)}`;
    }
    return tagline;
}

exports.syncFirebaseUserToMongo = async (req, res) => {
    try {
        // The user is already authenticated via Firebase ID Token (`req.user` mapped in authMiddleware)
        const { email, userId: firebaseUid } = req.user;
        const { passwordHash, publicKey, encryptedPrivateKey, salt } = req.body;

        // Check if user backup already exists
        let user = await User.findOne({ uid: firebaseUid });

        if (user) {
            // Retroactively add tagline if missing
            if (!user.tagline) {
                user.tagline = await generateUniqueTagline(email);
            }
            // Update existing user's keys in case they were rotated or it's a login sync
            if (passwordHash) user.masterPasswordHash = passwordHash;
            if (publicKey) user.publicKey = publicKey;
            if (encryptedPrivateKey) user.encryptedPrivateKey = encryptedPrivateKey;
            if (salt) user.salt = salt;
            await user.save();
            return res.status(200).json({
                message: 'User backup synced to MongoDB',
                tagline: user.tagline
            });
        }

        const tagline = await generateUniqueTagline(email);

        // Create new user backup
        user = new User({
            uid: firebaseUid,
            email,
            tagline,
            masterPasswordHash: passwordHash, // Not a true hash, just a PBKDF2 derivative from the frontend
            publicKey,
            encryptedPrivateKey,
            salt
        });

        await user.save();
        res.status(201).json({
            message: 'User backup created in MongoDB',
            tagline: user.tagline
        });
    } catch (error) {
        console.error('Mongo sync error:', error);
        res.status(500).json({ error: 'Server error during Mongo backup initialization' });
    }
};

exports.getPublicKey = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ publicKey: user.publicKey });
    } catch (error) {
        console.error('Fetch PK error:', error);
        res.status(500).json({ error: 'Server error fetching public key' });
    }
};

exports.lookupByTagline = async (req, res) => {
    try {
        // Supports both /lookup/:tagline (param) and /user-by-tagline?tagline=... (query)
        const tagline = req.params.tagline || req.query.tagline;
        if (!tagline) return res.status(400).json({ error: 'tagline is required' });
        const user = await User.findOne({ tagline });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return public info needed for sharing/messaging without exposing email
        res.json({
            userId: user.uid,
            tagline: user.tagline,
            publicKey: user.publicKey,
        });
    } catch (error) {
        console.error('Lookup tagline error:', error);
        res.status(500).json({ error: 'Server error looking up user' });
    }
};
exports.getPreferences = async (req, res) => {
    try {
        const { userId: firebaseUid } = req.user;
        const user = await User.findOne({ uid: firebaseUid });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
        const prefs = user.preferences || {};
        const storedDay = prefs.premiumDayDate || '';

        // Auto-reset premium daily counter if it's a new calendar day
        const premiumUsedTodayMs = storedDay === todayStr ? (prefs.premiumUsedTodayMs || 0) : 0;

        res.json({
            appearance: prefs.appearance || {},
            premiumUsedTodayMs,
            premiumDayDate: todayStr,
        });
    } catch (err) {
        console.error('getPreferences error:', err);
        res.status(500).json({ error: 'Server error fetching preferences' });
    }
};

exports.savePreferences = async (req, res) => {
    try {
        const { userId: firebaseUid } = req.user;
        const { appearance, premiumUsedTodayMs } = req.body;
        const todayStr = new Date().toISOString().slice(0, 10);

        const user = await User.findOne({ uid: firebaseUid });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.preferences = {
            appearance: appearance ?? user.preferences?.appearance ?? {},
            premiumUsedTodayMs: typeof premiumUsedTodayMs === 'number'
                ? premiumUsedTodayMs
                : (user.preferences?.premiumUsedTodayMs ?? 0),
            premiumDayDate: todayStr,
        };

        await user.save();
        res.json({ ok: true, saved: user.preferences });
    } catch (err) {
        console.error('savePreferences error:', err);
        res.status(500).json({ error: 'Server error saving preferences' });
    }
};
