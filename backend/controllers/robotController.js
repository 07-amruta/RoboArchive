import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads/robots');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const getAllRobots = async (req, res) => {
  try {
    const rows = await query(`SELECT * FROM robots ORDER BY robot_id DESC`);
    // ✅ Handle both array and object responses
    const robotList = Array.isArray(rows) ? rows : (rows && rows.rows ? rows.rows : []);
    res.json(robotList);
  } catch (error) {
    console.error('getAllRobots error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRobotById = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(`SELECT * FROM robots WHERE robot_id = ?`, [id]);
    const robotList = Array.isArray(rows) ? rows : (rows && rows.rows ? rows.rows : []);
    
    if (robotList.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }
    
    res.json(robotList[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createRobot = async (req, res) => {
  try {
    const { name, specifications } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Robot name is required' });
    }
    
    let file_path = null;
    
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      file_path = `/uploads/robots/${fileName}`;
    }
    
    const result = await query(
      `INSERT INTO robots (name, specifications, file_path) VALUES (?, ?, ?)`,
      [name.trim(), specifications && specifications.trim() ? specifications.trim() : null, file_path]
    );
    
    res.status(201).json({
      message: 'Robot created successfully',
      robot_id: result.insertId || result.lastID,
      name: name.trim()
    });
  } catch (error) {
    console.error('createRobot error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateRobot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specifications } = req.body;
    
    const updateFields = {};
    
    if (name !== undefined && name.trim()) {
      updateFields.name = name.trim();
    }
    if (specifications !== undefined) {
      updateFields.specifications = specifications && specifications.trim() ? specifications.trim() : null;
    }
    
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      updateFields.file_path = `/uploads/robots/${fileName}`;
    }
    
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateFields), id];
    
    await query(`UPDATE robots SET ${setClause} WHERE robot_id = ?`, values);
    
    const rows = await query('SELECT * FROM robots WHERE robot_id = ?', [id]);
    const robotList = Array.isArray(rows) ? rows : (rows && rows.rows ? rows.rows : []);
    
    if (robotList.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }
    
    res.json(robotList[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRobot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rows = await query('SELECT file_path FROM robots WHERE robot_id = ?', [id]);
    const robotList = Array.isArray(rows) ? rows : (rows && rows.rows ? rows.rows : []);
    
    if (robotList.length > 0 && robotList[0].file_path) {
      const filePath = path.join(__dirname, '../', robotList[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await query('DELETE FROM robots WHERE robot_id = ?', [id]);
    
    res.json({ message: 'Robot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default getAllRobots;
