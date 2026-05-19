require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const userAPI = require('./api/user');

const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/', (req, res) => {
  return res.json({ message: 'Hallo traveller! ' });
});

app.use('/api/user', userAPI);


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