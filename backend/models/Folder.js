const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    parentFolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null // Null means it's in the root directory
    },
    colorTheme: {
        type: String,
        enum: ['gold', 'emerald', 'sapphire', 'amethyst', 'ruby'],
        default: 'gold' // Users can color-code their SecureVault folders
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexing for faster spatial queries by the owner
folderSchema.index({ owner: 1, parentFolder: 1 });

module.exports = mongoose.model('Folder', folderSchema);
