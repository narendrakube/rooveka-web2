import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'rooveka_admin',
  password: process.env.DB_PASS || 'Rooveka@SecurePass123',
  database: process.env.DB_NAME || 'rooveka_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test Database Connection Function
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected successfully to MySQL Database: ' + (process.env.DB_NAME || 'rooveka_db'));
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Database Connection Error:', error.message);
  }
}
