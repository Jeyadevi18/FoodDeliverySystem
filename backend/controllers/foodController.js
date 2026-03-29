const FoodItem = require('../models/FoodItem');

// @desc    Get all food items (with filter/search)
// @route   GET /api/foods
exports.getFoods = async (req, res) => {
    try {
        const { category, search, available } = req.query;
        let query = {};
        if (category) query.category = category;
        if (available !== undefined) query.available = available === 'true';
        if (search) query.name = { $regex: search, $options: 'i' };

        const foods = await FoodItem.find(query).sort('-createdAt');
        res.json({ success: true, count: foods.length, foods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single food item
// @route   GET /api/foods/:id
exports.getFood = async (req, res) => {
    try {
        const food = await FoodItem.findById(req.params.id);
        if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });
        res.json({ success: true, food });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create food item (Admin)
// @route   POST /api/foods
exports.createFood = async (req, res) => {
    try {
        const { name, description, price, category, available, tags, preparationTime } = req.body;
        let imageUrl = req.body.imageUrl || '';
        if (req.file) imageUrl = req.file.path;

        const food = await FoodItem.create({ name, description, price, category, imageUrl, available, tags, preparationTime });
        res.status(201).json({ success: true, food });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update food item (Admin)
// @route   PUT /api/foods/:id
exports.updateFood = async (req, res) => {
    try {
        let updateData = { ...req.body };
        if (req.file) updateData.imageUrl = req.file.path;

        const food = await FoodItem.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });
        res.json({ success: true, food });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete food item (Admin)
// @route   DELETE /api/foods/:id
exports.deleteFood = async (req, res) => {
    try {
        const food = await FoodItem.findByIdAndDelete(req.params.id);
        if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });
        res.json({ success: true, message: 'Food item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
