const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Store the Firebase UID here to link the MongoDB backup to the active Firebase session
    uid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // Unique identifier for the user (e.g. Shadow#4921) to replace email for privacy
    tagline: {
        type: String,
        unique: true,
        sparse: true,
    },
    // The server only stores a hash of the master password for authentication.
    // It NEVER sees the actual master password, which is used client-side to derive the AES key that protects the Private RSA Key.
    masterPasswordHash: {
        type: String
    },
    // The user's Public RSA Key, used by others to encrypt AES keys meant for this user.
    publicKey: {
        type: String
    },
    // The user's Private RSA Key, encrypted with an AES key derived from their Master Password.
    encryptedPrivateKey: {
        type: String
    },
    // Password derivation salt
    salt: {
        type: String
    },
    // User preferences — appearance settings, premium daily usage
    preferences: {
        appearance: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        premiumUsedTodayMs: {
            type: Number,
            default: 0
        },
        premiumDayDate: {
            // ISO date string 'YYYY-MM-DD' — when this changes, premiumUsedTodayMs resets
            type: String,
            default: ''
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
