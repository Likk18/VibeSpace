import express from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController.js';
import { protect, requireQuizComplete } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', requireQuizComplete, createOrder);
router.get('/', requireQuizComplete, getUserOrders);

export default router;
