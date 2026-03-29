const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get orders assigned to me by admin (any non-delivered/cancelled status)
// @route   GET /api/delivery/orders/assigned
exports.getAssignedOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            deliveryAgent: req.user._id,
            status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
        })
            .populate('customer', 'name phone address')
            .sort('-createdAt');
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get available orders (unassigned, status=ready)
// @route   GET /api/delivery/orders/available
exports.getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'ready', deliveryAgent: null })
            .populate('customer', 'name phone address')
            .sort('-createdAt');
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my accepted/active orders (picked / on_the_way)
// @route   GET /api/delivery/orders/mine
exports.getMyDeliveries = async (req, res) => {
    try {
        const orders = await Order.find({
            deliveryAgent: req.user._id,
            status: { $in: ['picked', 'on_the_way'] }
        })
            .populate('customer', 'name phone address')
            .sort('-createdAt');
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Accept an available (unassigned) order
// @route   PUT /api/delivery/orders/:id/accept
exports.acceptOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.deliveryAgent && order.deliveryAgent.toString() !== req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Order already taken by another agent' });
        }
        order.deliveryAgent = req.user._id;
        order.status = 'picked';
        await order.save();
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order delivery status (delivery agent)
// @route   PUT /api/delivery/orders/:id/status
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Allow transitioning from assigned → pickup → out → delivered
        const allowed = ['picked', 'on_the_way', 'delivered'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
        }

        // Delivery agent can only update their own assigned order
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, deliveryAgent: req.user._id },
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update delivery person live location
// @route   PUT /api/delivery/location
exports.updateLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        await User.findByIdAndUpdate(req.user._id, { location: { lat, lng } });
        res.json({ success: true, message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
