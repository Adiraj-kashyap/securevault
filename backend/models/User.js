const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // The server only stores a hash of the master password for authentication.
    // It NEVER sees the actual master password, which is used client-side to derive the AES key that protects the Private RSA Key.
    masterPasswordHash: {
        type: String,
        required: true,
    },
    // The user's Public RSA Key, used by others to encrypt AES keys meant for this user.
    publicKey: {
        type: String,
        required: true,
    },
    // The user's Private RSA Key, encrypted with an AES key derived from their Master Password.
    encryptedPrivateKey: {
        type: String,
        required: true,
    },
    // Password derivation salt
    salt: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
