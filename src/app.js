import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { verifyFirebaseToken } from './middleware/verifyFirebaseToken.js';

// Route imports
import userRoutes from './routes/user.routes.js';
// Add other routes as we create them

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Adjust for production
  credentials: true,
}));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});
app.use('/api', limiter);

// Base Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// APIs
app.use('/api/users', userRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/professionals', professionalRoutes);

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
