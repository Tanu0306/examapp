import { Router } from 'express';
import {
  createFolder,
  createQuestion,
  listFolderQuestions,
  listFolders,
  listQuestions,
} from '../controllers/questionBankController.js';

const router = Router();
router.get('/folders', listFolders);
router.post('/folders', createFolder);
router.get('/folders/:folderId/questions', listFolderQuestions);
router.get('/questions', listQuestions);
router.post('/questions', createQuestion);

export default router;
