const mongoose = require('mongoose');

const MailSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
        index: true
    },
    receiverId: {
        type: String,
        required: true,
        index: true
    },
    encryptedSubject: {
        type: String,
        required: true
    },
    encryptedBody: {
        type: String,
        required: true
    },
    // Useful for showing who sent it without looking up UIDs
    senderTagline: String,
    receiverTagline: String,

    // Support for attachments (references to /storage/directory items)
    attachments: [{
        id: String,
        name: String,
        encryptedKey: String // The AES key of the file, encrypted with the receiver's RSA public key
    }],

    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Mail', MailSchema);
