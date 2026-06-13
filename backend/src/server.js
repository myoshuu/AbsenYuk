require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const userAPI = require('./api/user');
const acaraAPI = require('./api/acara');
const acaraIkutiAPI = require('./api/acara_ikuti');
const acaraPostAPI = require('./api/acara_post');
const dashboardAPI = require('./api/dashboard');
const absensiAPI = require('./api/absensi');
const exportAPI = require('./api/export');
const { ErrorCodes, withErrorCode } = require('./utils/errors');

const app = express();
const PORT = process.env.APP_PORT || 3000;
app.enable('trust proxy');

// ─── Request ID Middleware ───────────────────────────────────────
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ─── Rate Limiting ───────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: withErrorCode('Terlalu banyak percobaan. Coba lagi dalam 15 menit.', 429, ErrorCodes.RATE_LIMIT_EXCEEDED),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip; // Rate limit by IP
  }
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: withErrorCode('Terlalu banyak permintaan. Coba lagi nanti.', 429, ErrorCodes.RATE_LIMIT_EXCEEDED),
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limit to all API routes
app.use('/api', generalLimiter);

// ─── Body Parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── CORS Configuration ───────────────────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    // Allowed origins from environment variable
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [];

    // Allow requests with no origin (mobile apps, curl, etc.)
    // Also allow localhost for development
    if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
};

app.use(cors(corsOptions));

// ─── Security Headers ────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms [:date[iso]] :req[x-request-id]'));
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


// ─── Global Error Handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  const requestId = req.id || 'unknown';
  console.error(`[${requestId}] ERROR:`, err.message || err);

  const statusCode = err.status || 500;
  const errorCode = err.errorCode || ErrorCodes.INTERNAL_ERROR;

  // Don't expose internal error details in production
  const message = statusCode === 500
    ? 'Internal Server Error'
    : err.message;

  res.status(statusCode).json({
    message,
    statusCode,
    errorCode,
    requestId
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan.`,
    statusCode: 404,
    errorCode: ErrorCodes.ENDPOINT_NOT_FOUND,
    requestId: req.id
  });
});

app.listen(PORT, () => {
  console.log(`Server sudah online pada  http://localhost:${PORT}/ \n Buka frontend di http://localhost:${PORT}/pages/homepage/index.html`);
});

process.on('SIGTERM', async () => {
  console.log('Mematikan server...');
  await require('./database/db').end();
  process.exit(0);
});