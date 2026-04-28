const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user (email/password)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone, address } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

        const user = await User.create({ name, email, password, role: role || 'customer', phone, address });
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true, token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user (email/password)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
        if (user.isGoogle) return res.status(400).json({ success: false, message: 'This account uses Google Sign-In. Please use the Google button.' });
        if (!(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const token = generateToken(user._id, user.role);
        res.json({
            success: true, token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, avatar: user.avatar }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Google OAuth Login / Auto-Register
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
    try {
        const { credential, role } = req.body;
        if (!credential) return res.status(400).json({ success: false, message: 'Google credential token required' });

        // Verify the Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, name, email, picture } = payload;

        console.log('✅ Google user verified:', { name, email });

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // Update Google info if logging in via Google for first time
            if (!user.googleId) {
                user.googleId = googleId;
                user.isGoogle = true;
                if (picture && !user.avatar) user.avatar = picture;
                await user.save();
            }
        } else {
            // Create new user from Google data — always customer unless pre-seeded
            user = await User.create({
                name,
                email,
                googleId,
                avatar: picture || '',
                isGoogle: true,
                role: 'customer', // always customer for brand-new signups
                phone: '',
                address: '',
            });
            console.log('🆕 New customer created from Google:', email);
        }

        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            message: user.isNew ? 'Account created with Google!' : 'Logged in with Google!',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                address: user.address,
                isGoogle: user.isGoogle,
            }
        });
    } catch (error) {
        console.error('Google auth error:', error.message);
        if (error.message.includes('Token used too late') || error.message.includes('Invalid token')) {
            return res.status(401).json({ success: false, message: 'Google token expired or invalid. Please try again.' });
        }
        res.status(500).json({ success: false, message: 'Google authentication failed: ' + error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    res.json({ success: true, user: req.user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
