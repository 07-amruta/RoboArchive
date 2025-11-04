import express from 'express';
import { 
  getAllMembers, 
  getMemberById, 
  updateMember, 
  deleteMember,
  getMemberStats 
} from '../controllers/memberController.js';
import { register, login } from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Member routes
router.get('/', authenticateToken, getAllMembers);
router.get('/:id', authenticateToken, getMemberById);
router.get('/:id/stats', authenticateToken, getMemberStats);
router.put('/:id', authenticateToken, requireAdmin, updateMember);
router.delete('/:id', authenticateToken, requireAdmin, deleteMember);

export default router;
