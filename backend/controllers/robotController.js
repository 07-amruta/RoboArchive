import { query } from '../config/db.js';

export const getAllRobots = async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, m.name as team_lead_name
       FROM robots r
       LEFT JOIN members m ON r.team_lead_id = m.member_id
       ORDER BY r.competition_year DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRobotById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const robotResult = await query(
      `SELECT r.*, m.name as team_lead_name
       FROM robots r
       LEFT JOIN members m ON r.team_lead_id = m.member_id
       WHERE r.robot_id = ?`,
      [id]
    );
    
    if (robotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }
    
    const mediaResult = await query(
      `SELECT * FROM media WHERE robot_id = ?`,
      [id]
    );
    
    const robot = robotResult.rows[0];
    robot.media = mediaResult.rows;
    
    res.json(robot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createRobot = async (req, res) => {
  try {
    const { name, competition_year, team_lead_id, specifications, performance_notes, final_rank } = req.body;
    
    await query(
      `INSERT INTO robots (name, competition_year, team_lead_id, specifications, performance_notes, final_rank)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, competition_year, team_lead_id, specifications, performance_notes, final_rank]
    );
    
    const result = await query(
      `SELECT * FROM robots ORDER BY robot_id DESC LIMIT 1`
    );
    
    if (result.rows[0] && team_lead_id) {
      await query(
        `INSERT INTO contributions (member_id, contribution_type, reference_id)
         VALUES (?, ?, ?)`,
        [team_lead_id, 'robot_project', result.rows[0].robot_id]
      );
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRobot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specifications, performance_notes, final_rank } = req.body;
    
    await query(
      `UPDATE robots 
       SET name = IFNULL(?, name),
           specifications = IFNULL(?, specifications),
           performance_notes = IFNULL(?, performance_notes),
           final_rank = IFNULL(?, final_rank)
       WHERE robot_id = ?`,
      [name, specifications, performance_notes, final_rank, id]
    );
    
    const result = await query(
      'SELECT * FROM robots WHERE robot_id = ?',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRobot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkResult = await query(
      'SELECT robot_id FROM robots WHERE robot_id = ?',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }
    
    await query(
      'DELETE FROM robots WHERE robot_id = ?',
      [id]
    );
    
    res.json({ message: 'Robot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
