const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect - Verifies Bearer JWT token from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
    try {
        let token;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user still exists in DB
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is valid but user no longer exists. Please log in again.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
        }
        res.status(500).json({ success: false, message: 'Server error during authentication.' });
    }
};

module.exports = { protect };
