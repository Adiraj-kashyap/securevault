const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../config/authMiddleware');

// The sync endpoint is protected by the Firebase ID Token
router.post('/sync', requireAuth, authController.syncFirebaseUserToMongo);
router.get('/public-key/:email', requireAuth, authController.getPublicKey);
router.get('/lookup/:tagline', requireAuth, authController.lookupByTagline);
router.get('/user-by-tagline', requireAuth, authController.lookupByTagline);

// User preferences (appearance settings + premium daily tracking)
router.get('/preferences', requireAuth, authController.getPreferences);
router.put('/preferences', requireAuth, authController.savePreferences);

module.exports = router;
