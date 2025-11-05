import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err);
    process.exit(-1);
  });

export const query = async (text, params) => {
  // Convert PostgreSQL $1, $2 placeholders to MySQL ? placeholders
  const mysqlQuery = text.replace(/\$(\d+)/g, '?');
  const [rows] = await pool.execute(mysqlQuery, params);
  return { rows };
};

export default pool;
