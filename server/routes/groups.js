import express from 'express';
import { createGroup, joinGroup, getGroupStatus } from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All group routes require authentication
router.use(protect);

router.post('/create', createGroup);
router.post('/:id/join', joinGroup);
router.get('/:id/status', getGroupStatus);

export default router;
