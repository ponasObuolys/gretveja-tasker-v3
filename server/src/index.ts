import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db';

// Routes
import authRoutes from './routes/auth';
import boardRoutes from './routes/boards';
import listRoutes from './routes/lists';
import cardRoutes from './routes/cards';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Task Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      boards: '/api/boards',
      lists: '/api/lists',
      cards: '/api/cards'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Local: http://localhost:${port}`);
      console.log(`Network: http://${getLocalIpAddress()}:${port}`);
      console.log('\nAPI Documentation:');
      console.log('- POST /api/auth/register - Register a new user');
      console.log('- POST /api/auth/login - Login user');
      console.log('- GET /api/boards - Get all boards (requires auth)');
      console.log('- POST /api/boards - Create a board (requires auth)');
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// Helper function to get local IP address
function getLocalIpAddress() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
} 