require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const userAPI = require('./api/user');
const acaraAPI = require('./api/acara');
const acaraIkutiAPI = require('./api/acara_ikuti');
const acaraPostAPI = require('./api/acara_post');
const dashboardAPI = require('./api/dashboard');
const absensiAPI = require('./api/absensi');
const exportAPI = require('./api/export');

const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(cookieParser());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Serve absensi attendance form
app.get('/absensi/isi', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/dashboard/absensi/isi.html'));
});

// Production mode: serve homepage at root
// Dev mode: return status message
if (process.env.NODE_ENV === 'production') {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/homepage/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    return res.json({ message: 'Hallo traveller! ' });
  });
}


app.use('/api/user', userAPI);
app.use('/api/acara', acaraAPI);
app.use('/api/acara-ikuti', acaraIkutiAPI);
app.use('/api/acara-post', acaraPostAPI);
app.use('/api/dashboard', dashboardAPI);
app.use('/api/absensi', absensiAPI);
app.use('/api', exportAPI);


app.use((err, req, res, next) => {
  console.error('ERROR: ', err.message || err);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal Server Error' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server sudah online pada  http://localhost:${PORT}/`);
});

process.on('SIGTERM', async () => {
  console.log('Mematikan server...');
  await require('./database/db').end();
  process.exit(0);
});