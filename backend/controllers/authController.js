const User = require('../models/User');

exports.syncFirebaseUserToMongo = async (req, res) => {
    try {
        // The user is already authenticated via Firebase ID Token (`req.user` mapped in authMiddleware)
        const { email, userId: firebaseUid } = req.user;
        const { passwordHash, publicKey, encryptedPrivateKey, salt } = req.body;

        // Check if user backup already exists
        let user = await User.findOne({ uid: firebaseUid });

        if (user) {
            // Update existing user's keys in case they were rotated or it's a login sync
            if (passwordHash) user.masterPasswordHash = passwordHash;
            if (publicKey) user.publicKey = publicKey;
            if (encryptedPrivateKey) user.encryptedPrivateKey = encryptedPrivateKey;
            if (salt) user.salt = salt;
            await user.save();
            return res.status(200).json({ message: 'User backup synced to MongoDB' });
        }

        // Create new user backup
        user = new User({
            uid: firebaseUid,
            email,
            masterPasswordHash: passwordHash, // Not a true hash, just a PBKDF2 derivative from the frontend
            publicKey,
            encryptedPrivateKey,
            salt
        });

        await user.save();
        res.status(201).json({ message: 'User backup created in MongoDB' });
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
