const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
        name: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1 },
        imageUrl: String
    }],
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked', 'on_the_way', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentMethod: { type: String, enum: ['card', 'upi', 'cod'], default: 'cod' },
    paymentId: { type: String, default: '' },
    estimatedDeliveryTime: { type: Number, default: 45 },
    notes: { type: String, default: '' },
    deliveryLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
