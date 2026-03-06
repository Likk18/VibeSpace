import express from 'express';
import { getQuestions, submitQuiz, getQuizStatus, retakeQuiz } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';
import { quizSubmitValidation, validate } from '../middleware/validators.js';

const router = express.Router();

// All quiz routes require authentication
router.use(protect);

router.get('/questions', getQuestions);
router.post('/submit', quizSubmitValidation, validate, submitQuiz);
router.get('/status', getQuizStatus);
router.post('/retake', retakeQuiz);

export default router;
