const express = require('express');
const storageController = require('../controllers/storageController');
const { requireAuth } = require('../config/authMiddleware');

const router = express.Router();

// Apply JWT Authentication Middleware to all storage routes
router.use(requireAuth);

// Dashboard Routes
router.get('/stats', storageController.getStorageStats);
router.get('/directory', storageController.getDirectory); // Root directory
router.get('/directory/:folderId', storageController.getDirectory); // Specific subfolder

// Vault Management
router.post('/folder', storageController.createFolder);

module.exports = router;
