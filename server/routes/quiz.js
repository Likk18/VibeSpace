import express from 'express';
import { getQuestions, submitQuiz, getQuizStatus, retakeQuiz, guestSubmit } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';
import { quizSubmitValidation, validate } from '../middleware/validators.js';

const router = express.Router();

router.get('/questions', getQuestions);
router.post('/guest-submit', guestSubmit);

router.use(protect);

router.post('/submit', quizSubmitValidation, validate, submitQuiz);
router.get('/status', getQuizStatus);
router.post('/retake', retakeQuiz);

export default router;
