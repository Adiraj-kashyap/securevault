const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true // The stored name (encrypted in practice, but readable metadata for now)
    },
    owner: {
        type: String,
        required: true
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null // Null means it's in the root Vault directory
    },
    mimeType: {
        type: String,
        required: true // original mime type, helpful for frontend rendering post-decryption
    },
    size: {
        type: Number,
        required: true // size in bytes
    },
    storageLevel: {
        type: String,
        enum: ['hot', 'warm', 'cold'],
        required: true,
        default: 'hot'
    },
    blobReference: {
        type: String,
        required: true // The ID pointing to the actual encrypted/compressed blob in GridFS or Object Storage
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

fileSchema.index({ owner: 1, folder: 1 });

module.exports = mongoose.model('File', fileSchema);
