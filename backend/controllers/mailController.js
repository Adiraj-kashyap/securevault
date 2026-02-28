const Mail = require('../models/Mail');
const User = require('../models/User');

exports.sendMail = async (req, res) => {
    try {
        const { userId: senderId } = req.user;
        const { receiverTagline, encryptedSubject, encryptedBody, attachments } = req.body;

        // Lookup receiver by tagline
        const receiver = await User.findOne({ tagline: receiverTagline });
        if (!receiver) {
            return res.status(404).json({ error: 'Receiver not found' });
        }

        // Get sender's tagline
        const sender = await User.findOne({ uid: senderId });

        const newMail = new Mail({
            senderId,
            receiverId: receiver.uid,
            senderTagline: sender ? sender.tagline : 'Unknown',
            receiverTagline,
            encryptedSubject,
            encryptedBody,
            attachments: attachments || []
        });

        await newMail.save();
        res.status(201).json({ message: 'Secure mail sent successfully', mailId: newMail._id });
    } catch (error) {
        console.error('Send mail error:', error);
        res.status(500).json({ error: 'Server error sending mail' });
    }
};

exports.getInbox = async (req, res) => {
    try {
        const { userId } = req.user;
        const inbox = await Mail.find({ receiverId: userId }).sort({ createdAt: -1 });
        res.json(inbox);
    } catch (error) {
        console.error('Get inbox error:', error);
        res.status(500).json({ error: 'Server error fetching inbox' });
    }
};

exports.getSent = async (req, res) => {
    try {
        const { userId } = req.user;
        const sent = await Mail.find({ senderId: userId }).sort({ createdAt: -1 });
        res.json(sent);
    } catch (error) {
        console.error('Get sent mail error:', error);
        res.status(500).json({ error: 'Server error fetching sent mail' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { mailId } = req.params;
        const { userId } = req.user;

        const mail = await Mail.findOne({ _id: mailId, receiverId: userId });
        if (!mail) return res.status(404).json({ error: 'Mail not found' });

        mail.read = true;
        await mail.save();
        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Server error updating mail' });
    }
};
