const { admin } = require('./firebase');

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        if (!admin) throw new Error("Firebase Admin not initialized on server.");

        const decodedToken = await admin.auth().verifyIdToken(token);
        // Map uid back to userId so storageController.js keeps working seamlessly
        req.user = {
            userId: decodedToken.uid,
            email: decodedToken.email
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired Firebase ID token' });
    }
};

module.exports = { requireAuth };
