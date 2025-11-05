import express from 'express';
import multer from 'multer';
import { 
  getAllRobots, 
  getRobotById, 
  createRobot, 
  updateRobot, 
  deleteRobot 
} from '../controllers/robotController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

router.get('/', getAllRobots);
router.get('/:id', getRobotById);
router.post('/', authenticateToken, upload.single('file'), createRobot);
router.put('/:id', authenticateToken, upload.single('file'), updateRobot);
router.delete('/:id', authenticateToken, deleteRobot);

export default router;
