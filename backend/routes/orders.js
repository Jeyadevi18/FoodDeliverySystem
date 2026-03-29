const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrder, getAllOrders, assignDeliveryAgent, cancelOrder, getStats } = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/stats', protect, requireRole('admin'), getStats);
router.get('/mine', protect, requireRole('customer'), getMyOrders);
router.get('/', protect, requireRole('admin'), getAllOrders);
router.post('/', protect, requireRole('customer'), placeOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/assign', protect, requireRole('admin'), assignDeliveryAgent);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
