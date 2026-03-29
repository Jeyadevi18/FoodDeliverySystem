const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['veg', 'non-veg', 'beverages', 'desserts'], required: true },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    available: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    preparationTime: { type: Number, default: 30 }, // in minutes
    tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('FoodItem', foodItemSchema);
