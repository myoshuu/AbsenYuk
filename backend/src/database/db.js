const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  enableKeepAlive: true,
  connectionLimit: 10,
  queueLimit: 0,
  idleTimeout: 60000,
  timezone: '+07:00'
});

db.getConnection()
  .then(connect => {
    console.log(`Berhasil connect di database: ${process.env.DB_NAME}`);
    connect.release();
  })
  .catch(err => console.error('Koneksi failed.', err.message));

module.exports = db;