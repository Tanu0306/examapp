import { Router } from 'express';
import { createExam, deleteExam, getExam, listExams, updateExam } from '../controllers/examController.js';

const router = Router();

router.get('/', listExams);
router.post('/', createExam);
router.get('/:examId', getExam);
router.patch('/:examId', updateExam);
router.delete('/:examId', deleteExam);

export default router;
