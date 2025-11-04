import { query } from '../config/db.js';

export const getAllTasks = async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, m.name as assigned_to_name, c.name as created_by_name
       FROM tasks t
       LEFT JOIN members m ON t.assigned_to = m.member_id
       LEFT JOIN members c ON t.created_by = c.member_id
       ORDER BY t.deadline ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, deadline, priority } = req.body;
    const created_by = req.user.member_id;
    
    const result = await query(
      `INSERT INTO tasks (title, description, assigned_to, created_by, deadline, priority)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, assigned_to, created_by, deadline, priority]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assigned_to, deadline, priority } = req.body;
    
    let completedAt = null;
    if (status === 'completed') {
      completedAt = new Date();
    }
    
    const result = await query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           assigned_to = COALESCE($4, assigned_to),
           deadline = COALESCE($5, deadline),
           priority = COALESCE($6, priority),
           completed_at = COALESCE($7, completed_at)
       WHERE task_id = $8 RETURNING *`,
      [title, description, status, assigned_to, deadline, priority, completedAt, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Log contribution if task completed
    if (status === 'completed' && assigned_to) {
      await query(
        `INSERT INTO contributions (member_id, contribution_type, reference_id)
         VALUES ($1, 'task_completed', $2)`,
        [assigned_to, id]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM tasks WHERE task_id = $1 RETURNING task_id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
