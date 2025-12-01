const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { apiLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const blacklistRoutes = require('./routes/blacklist');
const reviewRoutes = require('./routes/reviews');
const voteRoutes = require('./routes/votes');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:4200',
        'https://blacklist-jixgodev.vercel.app',
        'https://blacklist-5d5a11npq-ayumguring093-gmailcoms-projects.vercel.app',
        'https://blacklist-iota.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Temporary route to trigger database migration
app.get('/api/migrate-db', async (req, res) => {
    try {
        await sequelize.sync({ alter: true });
        res.json({ status: 'OK', message: 'Database synchronized successfully' });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ error: 'Migration failed: ' + error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Database sync and server start
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database (create tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📁 Upload path: ${process.env.UPLOAD_PATH || './uploads'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
    startServer();
}

module.exports = app;
