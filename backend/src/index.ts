import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import { config } from './config/config';
import { initializeDatabase } from './data-source';
import { startWarrantyReminderCronJob } from './services/cron.service';
import { errorHandler, notFound } from './middleware/error.middleware';
import logger from './utils/logger';

// Route imports
import userRoutes from './routes/user.routes';
import billRoutes from './routes/bill.routes';
import { fileRouter } from './routes/file.routes';
import ocrRoutes from './routes/ocr.routes';
import sharedBillRoutes from './routes/shared-bill.routes';
import dashboardRoutes from './routes/dashboard.routes';

// Create Express app
const app = express();

// Trust proxy for rate limiting (required for express-rate-limit)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins for easier testing
    if (config.server.env !== 'production') {
      return callback(null, true);
    }
    
    // In production, only allow specific domains
    const allowedOrigins = ['https://yourdomain.com']; // Replace with your production domain
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.server.env === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
  setHeaders: (res, filePath) => {
    // Set appropriate headers for different file types
    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      res.setHeader('Content-Type', `image/${ext === '.jpg' ? 'jpeg' : ext.substring(1)}`);
    } else if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'eWallet API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.server.env
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/files', fileRouter);
app.use('/api/ocr', ocrRoutes);
app.use('/api/shared-bills', sharedBillRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve uploaded files (with proper security)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  etag: true
}));

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Ensure logs directory exists
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }

    // Initialize database
    await initializeDatabase();
    
    // Start cron jobs
    startWarrantyReminderCronJob();
    
    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      logger.info(`🚀 eWallet API server is running`, {
        port: config.server.port,
        environment: config.server.env,
        url: `http://localhost:${config.server.port}`
      });
      
      logger.info('📋 Available endpoints:', {
        health: `http://localhost:${config.server.port}/health`,
        users: `http://localhost:${config.server.port}/api/users`,
        bills: `http://localhost:${config.server.port}/api/bills`
      });
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.server.port} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
        throw error;
      }
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

