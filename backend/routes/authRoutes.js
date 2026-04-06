const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');

// ── Validation Rules ──────────────────────────

const registerValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),

    body('year')
        .notEmpty().withMessage('Year is required')
        .isInt({ min: 1, max: 5 }).withMessage('Year must be an integer between 1 and 5')
        .toInt(),

    body('department')
        .trim()
        .notEmpty().withMessage('Department is required')
        .isLength({ min: 2, max: 50 }).withMessage('Department must be 2–50 characters'),

    body('age')
        .notEmpty().withMessage('Age is required')
        .isInt({ min: 16, max: 100 }).withMessage('Age must be an integer between 16 and 100')
        .toInt(),
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

module.exports = router;
