const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mailController');
const { requireAuth } = require('../config/authMiddleware');

router.post('/send', requireAuth, mailController.sendMail);
router.get('/inbox', requireAuth, mailController.getInbox);
router.get('/sent', requireAuth, mailController.getSent);
router.put('/:mailId/read', requireAuth, mailController.markAsRead);

module.exports = router;
