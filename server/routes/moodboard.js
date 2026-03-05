import express from 'express';
import { generateMoodBoard, regenerateMoodBoard } from '../controllers/moodboardController.js';
import { protect, requireQuizComplete } from '../middleware/auth.js';

const router = express.Router();

// All moodboard routes require authentication and completed quiz
router.use(protect, requireQuizComplete);

router.get('/generate', generateMoodBoard);
router.post('/regenerate', regenerateMoodBoard);

export default router;
