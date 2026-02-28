const File = require('../models/File');
const Folder = require('../models/Folder');

// Get the user's root directory or a specific folder's contents
exports.getDirectory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const folderId = req.params.folderId || null;

        // Fetch subfolders in this directory
        const folders = await Folder.find({ owner: userId, parentFolder: folderId }).sort({ createdAt: -1 });

        // Fetch files in this directory
        const files = await File.find({ owner: userId, folder: folderId }).sort({ createdAt: -1 });

        res.json({ folders, files });
    } catch (error) {
        console.error('Fetch Directory Error:', error);
        res.status(500).json({ error: 'Failed to retrieve vault directory' });
    }
};

// Create a new folder
exports.createFolder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, parentFolderId, colorTheme } = req.body;

        if (!name) return res.status(400).json({ error: 'Folder name is required' });

        const newFolder = new Folder({
            name,
            owner: userId,
            parentFolder: parentFolderId || null,
            colorTheme: colorTheme || 'gold'
        });

        await newFolder.save();
        res.status(201).json(newFolder);
    } catch (error) {
        console.error('Create Folder Error:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
};

// Simple Dashboard Analytics Route
exports.getStorageStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Aggregate total file sizes based on logic storage tiers
        const stats = await File.aggregate([
            { $match: { owner: userId } },
            { $group: { _id: "$storageLevel", totalSize: { $sum: "$size" }, count: { $sum: 1 } } }
        ]);

        const formattedStats = {
            hot: { size: 0, count: 0 },
            warm: { size: 0, count: 0 },
            cold: { size: 0, count: 0 }
        };

        stats.forEach(tier => {
            if (formattedStats[tier._id]) {
                formattedStats[tier._id] = { size: tier.totalSize, count: tier.count };
            }
        });

        res.json(formattedStats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch storage statistics' });
    }
};

// Share a file with a recipient
exports.shareFile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fileId } = req.params;
        const { recipientTagline, wrappedKey } = req.body;

        const file = await File.findOne({ _id: fileId, owner: userId });
        if (!file) return res.status(404).json({ error: 'File not found or not owned by you' });

        const User = require('../models/User');
        const recipient = await User.findOne({ tagline: recipientTagline });
        if (!recipient) return res.status(404).json({ error: 'Recipient tagline not found' });

        // Add to sharedWith array
        file.sharedWith.push({
            tagline: recipientTagline,
            encryptedKey: wrappedKey
        });

        await file.save();
        res.json({ message: 'File shared securely', file });
    } catch (error) {
        console.error('File Share Error:', error);
        res.status(500).json({ error: 'Failed to share file' });
    }
};

// Get files shared with the user
exports.getSharedFiles = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findOne({ uid: req.user.userId });
        if (!user || !user.tagline) return res.status(400).json({ error: 'User tagline not defined' });

        const sharedFiles = await File.find({ 'sharedWith.tagline': user.tagline }).sort({ createdAt: -1 });

        // Format for response
        const formatted = sharedFiles.map(f => {
            const shareData = f.sharedWith.find(s => s.tagline === user.tagline);
            return {
                _id: f._id,
                filename: f.filename,
                owner: f.owner,
                size: f.size,
                encryptedKey: shareData.encryptedKey,
                sharedAt: shareData.sharedAt
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error('Fetch Shared Files Error:', error);
        res.status(500).json({ error: 'Failed to fetch shared files' });
    }
};

// Upload a new file
exports.uploadFile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { encryptedKey, storageLevel, folderId, originalName } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const newFile = new File({
            filename: originalName,
            owner: userId,
            folder: folderId || null,
            mimeType: req.file.mimetype || 'application/octet-stream',
            encryptedKey: encryptedKey,
            size: req.file.size,
            storageLevel: storageLevel || 'hot',
            blobReference: req.file.filename // multer generates this
        });

        await newFile.save();
        res.status(201).json({ message: 'File uploaded successfully', file: newFile });
    } catch (error) {
        console.error('File Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};
