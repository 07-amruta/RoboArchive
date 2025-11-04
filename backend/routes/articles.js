import express from 'express';
import { 
  getAllArticles, 
  getArticleById, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} from '../controllers/articleController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/', authenticateToken, createArticle);
router.put('/:id', authenticateToken, updateArticle);
router.delete('/:id', authenticateToken, deleteArticle);

export default router;
