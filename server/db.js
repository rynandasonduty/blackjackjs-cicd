// file: server/db.js
const mysql = require('mysql2');

// Heroku akan menyediakan variabel JAWSDB_URL secara otomatis.
// Jika variabel itu tidak ada (artinya kita di lokal), gunakan koneksi cadangan.
const connectionUrl =
  process.env.JAWSDB_URL || 'mysql://user:password@localhost:3306/blackjack_db';

const pool = mysql.createPool(connectionUrl);

// Ekspor promise-based pool untuk async/await
module.exports = pool.promise();
