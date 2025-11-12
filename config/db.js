import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'futbot',
  password: 'futbot123456',
  database: 'futbot_db',
  waitForConnections: true,
  connectionLimit: 10,
});
