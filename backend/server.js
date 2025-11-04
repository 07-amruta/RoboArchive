import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import memberRoutes from './routes/members.js';
import taskRoutes from './routes/tasks.js';
import articleRoutes from './routes/articles.js';
import robotRoutes from './routes/robots.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/robots', robotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
