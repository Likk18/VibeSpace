import express from 'express';
import { mergeProfiles, getMyProfile, togglePersonalization, addToCart, removeFromCart, addToWishlist, removeFromWishlist, addAddress, deleteAddress, saveCard, saveUpi, addMoney, getGroupReport } from '../controllers/profileController.js';
import { protect, requireQuizComplete } from '../middleware/auth.js';

const router = express.Router();

// All profile routes require authentication
router.use(protect);

router.get('/me', getMyProfile);
router.get('/group-report', requireQuizComplete, getGroupReport);
router.post('/merge', requireQuizComplete, mergeProfiles);
router.put('/toggle', togglePersonalization);

// Cart Routes
router.post('/cart', addToCart);
router.delete('/cart/:productId', removeFromCart);

// Wishlist Routes
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);
// Address Routes
router.post('/address', addAddress);
router.delete('/address/:addressId', deleteAddress);

// Saved Payment Methods
router.post('/saved-card', saveCard);
router.post('/saved-upi', saveUpi);

// Wallet
router.post('/wallet/add', addMoney);

export default router;
