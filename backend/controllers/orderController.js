const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');

// @desc    Place order (Customer)
// @route   POST /api/orders
exports.placeOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMethod, notes } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items in order' });

        // Enrich items with current prices
        let totalAmount = 0;
        const enrichedItems = [];
        for (const item of items) {
            const food = await FoodItem.findById(item.foodItem);
            if (!food) return res.status(404).json({ success: false, message: `Food item ${item.foodItem} not found` });
            const lineTotal = food.price * item.quantity;
            totalAmount += lineTotal;
            enrichedItems.push({ foodItem: food._id, name: food.name, price: food.price, quantity: item.quantity, imageUrl: food.imageUrl });
        }

        const order = await Order.create({
            customer: req.user._id,
            items: enrichedItems,
            totalAmount,
            deliveryAddress,
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
            notes
        });

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get customer's own orders
// @route   GET /api/orders/mine
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .populate('items.foodItem', 'name imageUrl')
            .populate('deliveryAgent', 'name phone')
            .sort('-createdAt');
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('deliveryAgent', 'name phone location')
            .populate('items.foodItem', 'name imageUrl price');

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Access control: customer can only see their own order
        if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('customer', 'name email phone')
            .populate('deliveryAgent', 'name phone')
            .sort('-createdAt');
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Assign delivery agent OR update status (Admin)
// @route   PUT /api/orders/:id/assign
exports.assignDeliveryAgent = async (req, res) => {
    try {
        const { deliveryAgentId, status } = req.body;
        const updateData = {};
        if (deliveryAgentId) {
            updateData.deliveryAgent = deliveryAgentId;
            updateData.status = 'confirmed'; // auto-confirm on assignment
        }
        if (status) {
            updateData.status = status; // allow explicit status override
        }
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('deliveryAgent', 'name phone');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel order (Customer/Admin)
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (['delivered', 'picked', 'on_the_way'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Cannot cancel order at this stage' });
        }
        order.status = 'cancelled';
        await order.save();
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/orders/stats
exports.getStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const revenueAgg = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        const User = require('../models/User');
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalDeliveryAgents = await User.countDocuments({ role: 'delivery' });

        const recentOrders = await Order.find().sort('-createdAt').limit(5)
            .populate('customer', 'name')
            .populate('deliveryAgent', 'name');

        res.json({ success: true, stats: { totalOrders, pendingOrders, deliveredOrders, totalRevenue, totalCustomers, totalDeliveryAgents }, recentOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
