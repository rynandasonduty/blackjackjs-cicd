// file: server/db.js

// --- PERBAIKAN DIMULAI DI SINI ---
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
// --- PERBAIKAN SELESAI ---

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
