import express from 'express';
import { 
  getAllRobots, 
  getRobotById, 
  createRobot, 
  updateRobot, 
  deleteRobot 
} from '../controllers/robotController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllRobots);
router.get('/:id', getRobotById);
router.post('/', authenticateToken, createRobot);
router.put('/:id', authenticateToken, updateRobot);
router.delete('/:id', authenticateToken, deleteRobot);

export default router;
