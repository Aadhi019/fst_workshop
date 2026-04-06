require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ── Connect to MongoDB ────────────────────────
connectDB();

// ── Middleware ────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Server status route
app.get('/api/status', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        version: '1.0.0',
    });
});

// ── 404 Handler ───────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route '${req.method} ${req.originalUrl}' not found.`,
    });
});

// ── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
    console.error('💥 Unhandled Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// ── Start Server ──────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📍 Environment  : ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Status check : http://localhost:${PORT}/api/status`);
});
