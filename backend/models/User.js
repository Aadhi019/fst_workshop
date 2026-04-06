const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // never returned in queries by default
        },
        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: [1, 'Year must be between 1 and 5'],
            max: [5, 'Year must be between 1 and 5'],
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        age: {
            type: Number,
            required: [true, 'Age is required'],
            min: [16, 'Age must be at least 16'],
            max: [100, 'Age cannot exceed 100'],
        },
    },
    {
        timestamps: true, // auto-manages createdAt & updatedAt
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
