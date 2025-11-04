import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, join_year, graduation_year } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      `INSERT INTO members (name, email, password, role, join_year, graduation_year) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING member_id, name, email, role`,
      [name, email, hashedPassword, role, join_year, graduation_year]
    );
    
    res.status(201).json({ 
      message: 'Member registered successfully', 
      member: result.rows[0] 
    });
  } catch (error) {
    if (error.constraint === 'members_email_key') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await query(
      'SELECT * FROM members WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const member = result.rows[0];
    const validPassword = await bcrypt.compare(password, member.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { 
        member_id: member.member_id, 
        email: member.email,
        privilege_level: member.privilege_level 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      member: {
        member_id: member.member_id,
        name: member.name,
        email: member.email,
        role: member.role,
        privilege_level: member.privilege_level
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
