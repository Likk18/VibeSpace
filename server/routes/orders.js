import express from 'express';
import { createOrder, getUserOrders, checkQrStatus, handleQrScan } from '../controllers/orderController.js';
import { protect, requireQuizComplete } from '../middleware/auth.js';

const router = express.Router();

// Public route — QR scan endpoint (no auth needed, hit from phone)
router.get('/scan/:orderId', handleQrScan);

// Protected routes
router.use(protect);

router.post('/', requireQuizComplete, createOrder);
router.get('/', requireQuizComplete, getUserOrders);
router.get('/:orderId/qr-status', requireQuizComplete, checkQrStatus);

export default router;
