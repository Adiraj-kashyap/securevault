const express = require('express');
const auditController = require('../controllers/auditController');
const { requireAuth } = require('../config/authMiddleware');

const router = express.Router();

// Apply JWT Authentication Middleware
router.use(requireAuth);

router.get('/', auditController.getLogs);
router.post('/', auditController.createLog);

module.exports = router;
