require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mysql = require('mysql2/promise');

if (!process.env.DB_HOST) {
  console.warn('[db] DB_HOST não definido — o pool vai usar defaults (localhost:3306). Verifique backend/.env');
}

const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  port:               process.env.DB_PORT || 3306,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
});

module.exports = pool;
