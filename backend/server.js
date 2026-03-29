require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');

// Simple XSS sanitizer (replaces deprecated xss-clean package)
const xssSanitize = (req, res, next) => {
    const sanitize = (str) => typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str;
    const deep = (obj) => { if (obj && typeof obj === 'object') Object.keys(obj).forEach(k => { obj[k] = typeof obj[k] === 'string' ? sanitize(obj[k]) : deep(obj[k]); }); return obj; };
    if (req.body) deep(req.body);
    if (req.query) deep(req.query);
    next();
};

// Connect to MongoDB
connectDB().catch(err => console.error('MongoDB connection error:', err.message));

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
// Allowed origins: localhost (dev) + production frontend URL from env
const ALLOWED_ORIGINS = [
    /^http:\/\/localhost(:\d+)?$/,
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow no-origin requests (Postman/curl/mobile)
        if (!origin) return callback(null, true);
        const allowed = ALLOWED_ORIGINS.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        );
        if (allowed) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(generalLimiter);
app.use(mongoSanitize());   // Prevent NoSQL injection
app.use(xssSanitize);       // Sanitize XSS

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/admin', require('./routes/admin'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ success: true, message: '🍕 FoodDeliver API is running!' }));

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
