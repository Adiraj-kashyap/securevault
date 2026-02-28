const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin SDK
require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'https://securevault-ten.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/securevault')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/storage', require('./routes/storageRoutes'));
app.use('/api/mail', require('./routes/mailRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

app.get('/', (req, res) => {
    res.send('SecureVault API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
