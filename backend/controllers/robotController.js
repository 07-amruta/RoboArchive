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
       WHERE r.robot_id = $1`,
      [id]
    );
    
    if (robotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }
    
    // Get associated media
    const mediaResult = await query(
      `SELECT * FROM media WHERE robot_id = $1`,
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
    
    const result = await query(
      `INSERT INTO robots (name, competition_year, team_lead_id, specifications, performance_notes, final_rank)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, competition_year, team_lead_id, specifications, performance_notes, final_rank]
    );
    
    // Log contribution
    if (team_lead_id) {
      await query(
        `INSERT INTO contributions (member_id, contribution_type, reference_id)
         VALUES ($1, 'robot_project', $2)`,
        [team_lead_id, result.rows[0].robot_id]
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
    
    const result = await query(
      `UPDATE robots 
       SET name = COALESCE($1, name),
           specifications = COALESCE($2, specifications),
           performance_notes = COALESCE($3, performance_notes),
           final_rank = COALESCE($4, final_rank)
       WHERE robot_id = $5 RETURNING *`,
      [name, specifications, performance_notes, final_rank, id]
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
    const result = await query(
      'DELETE FROM robots WHERE robot_id = $1 RETURNING robot_id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Robot not found' });
    }
    
    res.json({ message: 'Robot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
