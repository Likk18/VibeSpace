import express from 'express';
import { createGroup, joinGroup, getGroupStatus, joinByCode, updateWeights } from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, createGroup);
router.post('/join-by-code', joinByCode);
router.post('/:id/join', protect, joinGroup);
router.get('/:id/status', protect, getGroupStatus);
router.put('/:id/weights', protect, updateWeights);

export default router;
