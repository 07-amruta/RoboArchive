import { query } from '../config/db.js';

export const getAllMembers = async (req, res) => {
  try {
    const result = await query(
      `SELECT member_id, name, email, role, join_year, graduation_year, 
              is_active, privilege_level, created_at 
       FROM members ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT member_id, name, email, role, join_year, graduation_year, 
              is_active, privilege_level, created_at 
       FROM members WHERE member_id = ?`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, graduation_year, is_active, privilege_level } = req.body;
    
    await query(
      `UPDATE members 
       SET name = IFNULL(?, name), 
           role = IFNULL(?, role),
           graduation_year = IFNULL(?, graduation_year),
           is_active = IFNULL(?, is_active),
           privilege_level = IFNULL(?, privilege_level),
           updated_at = CURRENT_TIMESTAMP
       WHERE member_id = ?`,
      [name, role, graduation_year, is_active, privilege_level, id]
    );
    
    const result = await query(
      `SELECT member_id, name, email, role, privilege_level FROM members WHERE member_id = ?`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkResult = await query(
      'SELECT member_id FROM members WHERE member_id = ?',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    await query(
      'DELETE FROM members WHERE member_id = ?',
      [id]
    );
    
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMemberStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stats = await query(
      `SELECT 
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM articles WHERE author_id = ?) as articles_written,
        (SELECT COUNT(*) FROM robots WHERE team_lead_id = ?) as robots_led`,
      [id, id, id]
    );
    
    res.json(stats.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
