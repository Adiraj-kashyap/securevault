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
            { $match: { owner: mongoose.Types.ObjectId(userId) } },
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
