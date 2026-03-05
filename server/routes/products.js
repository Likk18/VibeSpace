import express from 'express';
import { getProductFeed, getProduct, searchProducts, getCategories } from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Protected routes
router.get('/', protect, getProductFeed);

export default router;
