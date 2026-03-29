const express = require('express');
const router = express.Router();
const { getAvailableOrders, getMyDeliveries, getAssignedOrders, acceptOrder, updateDeliveryStatus, updateLocation } = require('../controllers/deliveryController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('delivery'));
router.get('/orders/available', getAvailableOrders);
router.get('/orders/assigned', getAssignedOrders);
router.get('/orders/mine', getMyDeliveries);
router.put('/orders/:id/accept', acceptOrder);
router.put('/orders/:id/status', updateDeliveryStatus);
router.put('/location', updateLocation);

module.exports = router;
