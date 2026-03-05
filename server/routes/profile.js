import express from 'express';
import { mergeProfiles, getMyProfile, togglePersonalization, addToCart, removeFromCart, addToWishlist, removeFromWishlist } from '../controllers/profileController.js';
import { protect, requireQuizComplete } from '../middleware/auth.js';

const router = express.Router();

// All profile routes require authentication
router.use(protect);

router.get('/me', requireQuizComplete, getMyProfile);
router.post('/merge', requireQuizComplete, mergeProfiles);
router.put('/toggle', togglePersonalization);

// Cart Routes
router.post('/cart', requireQuizComplete, addToCart);
router.delete('/cart/:productId', requireQuizComplete, removeFromCart);

// Wishlist Routes
router.post('/wishlist', requireQuizComplete, addToWishlist);
router.delete('/wishlist/:productId', requireQuizComplete, removeFromWishlist);

export default router;
