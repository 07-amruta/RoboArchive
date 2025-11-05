import express from 'express';
import multer from 'multer';
import { 
  getAllArticles, 
  getArticleById, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} from '../controllers/articleController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/', authenticateToken, upload.single('file'), createArticle);
router.put('/:id', authenticateToken, upload.single('file'), updateArticle);
router.delete('/:id', authenticateToken, deleteArticle);

export default router;
