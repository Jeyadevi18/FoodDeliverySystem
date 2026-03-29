const express = require('express');
const router = express.Router();
const { getFoods, getFood, createFood, updateFood, deleteFood } = require('../controllers/foodController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', getFoods);
router.get('/:id', getFood);
router.post('/', protect, requireRole('admin'), createFood);
router.put('/:id', protect, requireRole('admin'), updateFood);
router.delete('/:id', protect, requireRole('admin'), deleteFood);

module.exports = router;
