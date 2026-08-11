import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';

// Basic Routes
app.get('/', (req, res) => {
  res.status(200).send('Codos-ERP Backend API is running. Try /api/health');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Error Handling Middleware (Basic)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
