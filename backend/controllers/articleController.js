import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads/articles');

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
    
    let file_path = null;
    
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      file_path = `/uploads/articles/${fileName}`;
    }
    
    await query(
      `INSERT INTO articles (title, content, author_id, type, category, competition_year, file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, content, author_id, type, category, competition_year, file_path]
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
    
    let file_path = null;
    
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      file_path = `/uploads/articles/${fileName}`;
    }
    
    if (file_path) {
      await query(
        `UPDATE articles 
         SET title = IFNULL(?, title),
             content = IFNULL(?, content),
             type = IFNULL(?, type),
             category = IFNULL(?, category),
             competition_year = IFNULL(?, competition_year),
             file_path = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE article_id = ?`,
        [title, content, type, category, competition_year, file_path, id]
      );
    } else {
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
    }
    
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
    
    const article = await query(
      'SELECT file_path FROM articles WHERE article_id = ?',
      [id]
    );
    
    if (article.rows.length > 0 && article.rows[0].file_path) {
      const filePath = path.join(__dirname, '../', article.rows[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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

export default getAllArticles;
