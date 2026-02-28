const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["login", "upload", "download", "delete", "share", "key_access", "failed_login"],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        default: 'Unknown'
    },
    userAgent: {
        type: String,
        default: 'Unknown'
    },
    signature: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ["info", "warn", "danger"],
        default: "info"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

auditLogSchema.index({ owner: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
