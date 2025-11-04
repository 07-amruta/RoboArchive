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
    let paramCount = 1;
    
    if (type) {
      queryText += ` AND a.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    
    if (category) {
      queryText += ` AND a.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    if (year) {
      queryText += ` AND a.competition_year = $${paramCount}`;
      params.push(year);
      paramCount++;
    }
    
    if (search) {
      queryText += ` AND (a.title ILIKE $${paramCount} OR a.content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
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
    
    // Increment view count
    await query(
      'UPDATE articles SET view_count = view_count + 1 WHERE article_id = $1',
      [id]
    );
    
    const result = await query(
      `SELECT a.*, m.name as author_name
       FROM articles a
       LEFT JOIN members m ON a.author_id = m.member_id
       WHERE a.article_id = $1`,
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
    
    const result = await query(
      `INSERT INTO articles (title, content, author_id, type, category, competition_year)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, content, author_id, type, category, competition_year]
    );
    
    // Log contribution
    await query(
      `INSERT INTO contributions (member_id, contribution_type, reference_id)
       VALUES ($1, 'article', $2)`,
      [author_id, result.rows[0].article_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, category, competition_year } = req.body;
    
    const result = await query(
      `UPDATE articles 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           type = COALESCE($3, type),
           category = COALESCE($4, category),
           competition_year = COALESCE($5, competition_year),
           updated_at = CURRENT_TIMESTAMP
       WHERE article_id = $6 RETURNING *`,
      [title, content, type, category, competition_year, id]
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
    const result = await query(
      'DELETE FROM articles WHERE article_id = $1 RETURNING article_id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
