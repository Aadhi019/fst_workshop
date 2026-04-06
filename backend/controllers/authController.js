const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Helper: generate signed JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// Helper: format user for response (never expose password)
const formatUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    year: user.year,
    department: user.department,
    age: user.age,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// ─────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
const register = async (req, res) => {
    try {
        // 1. Input validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
            });
        }

        const { username, password, year, department, email, age } = req.body;

        // 2. Check for duplicate email or username
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
            return res.status(409).json({
                success: false,
                message: `A user with this ${field} already exists.`,
            });
        }

        // 3. Create user (password hashing handled in model pre-save hook)
        const user = await User.create({ username, password, year, department, email, age });

        // 4. Issue token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: { token, user: formatUser(user) },
        });
    } catch (error) {
        // Mongoose duplicate key error fallback
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
            });
        }
        console.error('[register]', error.message);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

// ─────────────────────────────────────────────
// @desc    Login user & return JWT
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res) => {
    try {
        // 1. Input validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
            });
        }

        const { email, password } = req.body;

        // 2. Find user — explicitly include password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            // Generic message to prevent email enumeration
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // 3. Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // 4. Issue token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: { token, user: formatUser(user) },
        });
    } catch (error) {
        console.error('[login]', error.message);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

module.exports = { register, login };
