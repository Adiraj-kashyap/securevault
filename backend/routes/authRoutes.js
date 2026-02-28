const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../config/authMiddleware');

// The sync endpoint is protected by the Firebase ID Token
router.post('/sync', requireAuth, authController.syncFirebaseUserToMongo);
router.get('/public-key/:email', requireAuth, authController.getPublicKey);
router.get('/lookup/:tagline', requireAuth, authController.lookupByTagline);

module.exports = router;
