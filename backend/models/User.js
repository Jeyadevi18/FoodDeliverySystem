const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
        type: String, required: [true, 'Email is required'],
        unique: true, lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: { type: String, minlength: 6, select: false }, // optional for Google OAuth users
    role: { type: String, enum: ['customer', 'delivery', 'admin'], default: 'customer' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' },
    googleId: { type: String, default: '' },   // Google OAuth user ID
    isGoogle: { type: Boolean, default: false }, // true if registered via Google
    isActive: { type: Boolean, default: true },
    location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    // Skip hashing if no password (Google users) or password not modified
    if (!this.password || !this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
