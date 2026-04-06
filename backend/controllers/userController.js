const User = require('../models/User');
const { validationResult } = require('express-validator');

// Helper: format user for response
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
// @desc    Get current logged-in user profile
// @route   GET /api/user/getuser
// @access  Private
// ─────────────────────────────────────────────
const getUser = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({
            success: true,
            data: formatUser(user),
        });
    } catch (error) {
        console.error('[getUser]', error.message);
        res.status(500).json({ success: false, message: 'Server error while fetching user.' });
    }
};

// ─────────────────────────────────────────────
// @desc    Update current logged-in user profile
// @route   PATCH /api/user/updateuser
// @access  Private
// ─────────────────────────────────────────────
const updateUser = async (req, res) => {
    try {
        // 1. Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
            });
        }

        // 2. Whitelist allowed fields — email & password cannot be changed here
        const ALLOWED_UPDATES = ['username', 'year', 'department', 'age'];
        const updates = {};

        ALLOWED_UPDATES.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: `No valid fields provided. You can update: ${ALLOWED_UPDATES.join(', ')}.`,
            });
        }

        // 3. Check username conflict (if username is being updated)
        if (updates.username) {
            const conflict = await User.findOne({ username: updates.username });
            if (conflict && conflict._id.toString() !== req.user._id.toString()) {
                return res.status(409).json({ success: false, message: 'Username is already taken.' });
            }
        }

        // 4. Apply update
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: formatUser(user),
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({ success: false, message: `${field} already exists.` });
        }
        console.error('[updateUser]', error.message);
        res.status(500).json({ success: false, message: 'Server error while updating user.' });
    }
};

module.exports = { getUser, updateUser };
