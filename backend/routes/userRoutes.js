const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getUser, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// ── Update Validation Rules ───────────────────

const updateValidation = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

    body('year')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Year must be an integer between 1 and 5')
        .toInt(),

    body('department')
        .optional()
        .trim()
        .notEmpty().withMessage('Department cannot be empty')
        .isLength({ min: 2, max: 50 }).withMessage('Department must be 2–50 characters'),

    body('age')
        .optional()
        .isInt({ min: 16, max: 100 }).withMessage('Age must be an integer between 16 and 100')
        .toInt(),

    // Block email/password changes through this route
    body('email').not().exists().withMessage('Email cannot be updated through this route.'),
    body('password').not().exists().withMessage('Password cannot be updated through this route.'),
];

// ── Routes ────────────────────────────────────

// GET /api/user/getuser  (protected)
router.get('/getuser', protect, getUser);

// PATCH /api/user/updateuser  (protected)
router.patch('/updateuser', protect, updateValidation, updateUser);

module.exports = router;
