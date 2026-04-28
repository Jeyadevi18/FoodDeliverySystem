require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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
const server = http.createServer(app);

// ─── Socket.io (Real-time GPS Tracking) ──────────────────────────────────────
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
    console.log('📡 Socket connected:', socket.id);

    // Both delivery agent and customer join the same order room
    socket.on('join_order_room', (orderId) => {
        socket.join(`order-${orderId}`);
        console.log(`Socket ${socket.id} joined room: order-${orderId}`);
    });

    // Delivery agent broadcasts their GPS location every 5 minutes (from frontend timer)
    socket.on('location_update', async ({ orderId, lat, lng }) => {
        console.log(`📍 Location update for order ${orderId}: ${lat}, ${lng}`);
        // Broadcast to customer in the order room
        socket.to(`order-${orderId}`).emit('location_update', { lat, lng, timestamp: new Date() });

        // Persist location to MongoDB so REST API also has fresh data
        try {
            const Order = require('./models/Order');
            const User = require('./models/User');
            const order = await Order.findById(orderId).select('deliveryAgent');
            if (order?.deliveryAgent) {
                await User.findByIdAndUpdate(order.deliveryAgent, { location: { lat, lng } });
            }
        } catch (e) {
            console.error('Failed to persist location:', e.message);
        }
    });

    // Delivery agent signals they have arrived
    socket.on('delivery_arrived', ({ orderId }) => {
        console.log(`🎉 Delivery arrived for order ${orderId}`);
        socket.to(`order-${orderId}`).emit('delivery_arrived', { orderId });
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// Attach io to app so routes can access it
app.set('io', io);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
const ALLOWED_ORIGINS = [
    /^http:\/\/localhost(:\d+)?$/,
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
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
app.use(mongoSanitize());
app.use(xssSanitize);

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
server.listen(PORT, () => console.log(`🚀 Server + Socket.io running on http://localhost:${PORT}`));
