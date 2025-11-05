import { query } from '../config/db.js';

export const getAllArticles = async (req, res) => {
  try {
    const { type, category, year, search } = req.query;
    
    let queryText = `
      SELECT a.*, m.name as author_name
      FROM articles a
      LEFT JOIN members m ON a.author_id = m.member_id
      WHERE 1=1
    `;
    const params = [];
    
    if (type) {
      queryText += ` AND a.type = ?`;
      params.push(type);
    }
    
    if (category) {
      queryText += ` AND a.category = ?`;
      params.push(category);
    }
    
    if (year) {
      queryText += ` AND a.competition_year = ?`;
      params.push(year);
    }
    
    if (search) {
      queryText += ` AND (a.title LIKE ? OR a.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    queryText += ' ORDER BY a.created_at DESC';
    
    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    await query(
      'UPDATE articles SET view_count = view_count + 1 WHERE article_id = ?',
      [id]
    );
    
    const result = await query(
      `SELECT a.*, m.name as author_name
       FROM articles a
       LEFT JOIN members m ON a.author_id = m.member_id
       WHERE a.article_id = ?`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createArticle = async (req, res) => {
  try {
    const { title, content, type, category, competition_year } = req.body;
    const author_id = req.user.member_id;
    
    await query(
      `INSERT INTO articles (title, content, author_id, type, category, competition_year)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, content, author_id, type, category, competition_year]
    );
    
    const result = await query(
      `SELECT * FROM articles WHERE author_id = ? ORDER BY article_id DESC LIMIT 1`,
      [author_id]
    );
    
    if (result.rows[0]) {
      await query(
        `INSERT INTO contributions (member_id, contribution_type, reference_id)
         VALUES (?, ?, ?)`,
        [author_id, 'article', result.rows[0].article_id]
      );
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, category, competition_year } = req.body;
    
    await query(
      `UPDATE articles 
       SET title = IFNULL(?, title),
           content = IFNULL(?, content),
           type = IFNULL(?, type),
           category = IFNULL(?, category),
           competition_year = IFNULL(?, competition_year),
           updated_at = CURRENT_TIMESTAMP
       WHERE article_id = ?`,
      [title, content, type, category, competition_year, id]
    );
    
    const result = await query(
      'SELECT * FROM articles WHERE article_id = ?',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkResult = await query(
      'SELECT article_id FROM articles WHERE article_id = ?',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    await query(
      'DELETE FROM articles WHERE article_id = ?',
      [id]
    );
    
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
