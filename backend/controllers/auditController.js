const AuditLog = require('../models/AuditLog');

// Get all audit logs for the current user
exports.getLogs = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch logs sorted by newest first
        const logs = await AuditLog.find({ owner: userId }).sort({ timestamp: -1 }).limit(100);

        // Format for frontend
        const formattedLogs = logs.map(log => ({
            id: log._id,
            type: log.type,
            description: log.description,
            timestamp: log.timestamp,
            ip: log.ip,
            userAgent: log.userAgent,
            signature: log.signature,
            severity: log.severity
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error('Fetch Audit Logs Error:', error);
        res.status(500).json({ error: 'Failed to retrieve audit logs' });
    }
};

// Create a new audit log
exports.createLog = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, description, signature, severity } = req.body;

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const newLog = new AuditLog({
            owner: userId,
            type,
            description,
            ip,
            userAgent,
            signature: signature || 'SYSTEM_LOG',
            severity: severity || 'info'
        });

        await newLog.save();
        res.status(201).json({ message: 'Log created successfully' });
    } catch (error) {
        console.error('Create Audit Log Error:', error);
        res.status(500).json({ error: 'Failed to create audit log' });
    }
};
