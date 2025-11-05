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
    
    await query(
      `INSERT INTO tasks (title, description, assigned_to, created_by, deadline, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, assigned_to, created_by, deadline, priority]
    );
    
    const result = await query(
      `SELECT * FROM tasks WHERE created_by = ? ORDER BY task_id DESC LIMIT 1`,
      [created_by]
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
    
    // Build dynamic update query
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
    }
    if (deadline !== undefined) {
      updates.push('deadline = ?');
      params.push(deadline);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    
    if (status === 'completed') {
      updates.push('completed_at = NOW()');
    }
    
    if (updates.length > 0) {
      params.push(id);
      await query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE task_id = ?`,
        params
      );
    }
    
    const result = await query(
      'SELECT * FROM tasks WHERE task_id = ?',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (status === 'completed' && assigned_to) {
      await query(
        `INSERT INTO contributions (member_id, contribution_type, reference_id)
         VALUES (?, ?, ?)`,
        [assigned_to, 'task_completed', id]
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
    
    const checkResult = await query(
      'SELECT task_id FROM tasks WHERE task_id = ?',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await query(
      'DELETE FROM tasks WHERE task_id = ?',
      [id]
    );
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
