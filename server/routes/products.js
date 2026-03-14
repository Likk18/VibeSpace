import express from 'express';
import { getProductFeed, getProduct, searchProducts, getCategories, getFilterOptions } from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/filters', getFilterOptions);
router.get('/:id', getProduct);

// Protected routes
router.get('/', protect, getProductFeed);
router.post('/:id/view', protect, trackProductView);

export default router;
