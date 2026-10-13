require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');

const app = express();

app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(compression());

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001' ||'http://192.168.1.32:30000' ).split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests.' },
});
app.use(limiter);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const routes = require('./src/routes');
app.use('/api/v1', routes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

const globalErrorHandler = require('./src/middlewares/errorHandler');
app.use(globalErrorHandler);

const db = require('./src/models');

const syncDatabase = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await db.sequelize.authenticate();
      console.log('Database connected');
      await db.sequelize.sync();
      console.log('Database synced');
      return;
    } catch (err) {
      console.error(`DB attempt ${i + 1}/${retries}: ${err.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
    }
  }
};

syncDatabase();

process.on('SIGINT', async () => { await db.sequelize.close(); process.exit(0); });
process.on('SIGTERM', async () => { await db.sequelize.close(); process.exit(0); });

module.exports = app;
