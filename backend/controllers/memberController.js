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
       FROM members WHERE member_id = $1`,
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
    
    const result = await query(
      `UPDATE members 
       SET name = COALESCE($1, name), 
           role = COALESCE($2, role),
           graduation_year = COALESCE($3, graduation_year),
           is_active = COALESCE($4, is_active),
           privilege_level = COALESCE($5, privilege_level),
           updated_at = CURRENT_TIMESTAMP
       WHERE member_id = $6 
       RETURNING member_id, name, email, role, privilege_level`,
      [name, role, graduation_year, is_active, privilege_level, id]
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
    const result = await query(
      'DELETE FROM members WHERE member_id = $1 RETURNING member_id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
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
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM articles WHERE author_id = $1) as articles_written,
        (SELECT COUNT(*) FROM robots WHERE team_lead_id = $1) as robots_led
       FROM members WHERE member_id = $1`,
      [id]
    );
    
    res.json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
