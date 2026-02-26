const User = require('../models/User');
const crypto = require('crypto');

// Utility to hash the master password for authentication ONLY
// The actual master password is used client-side to derive the AES key protecting the Private Key
const hashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
};

exports.register = async (req, res) => {
    try {
        const { email, password, publicKey, encryptedPrivateKey, salt } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password for basic auth matching
        const masterPasswordHash = hashPassword(password, salt);

        const newUser = new User({
            email,
            masterPasswordHash,
            publicKey,
            encryptedPrivateKey,
            salt
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const hash = hashPassword(password, user.salt);
        if (hash !== user.masterPasswordHash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // In a real app, generate a JWT here. For simplicity in phase 1, we just return success.
        res.json({
            message: 'Login successful',
            userId: user._id,
            publicKey: user.publicKey,
            encryptedPrivateKey: user.encryptedPrivateKey,
            salt: user.salt
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Endpoint to fetch another user's public key (needed to send them messages/files)
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
