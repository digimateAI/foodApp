import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'FoodVision Backend is running' });
});

// Routes will be mounted here
import userRoutes from './routes/user.routes';
import mealRoutes from './routes/meal.routes';
import authRoutes from './routes/auth.routes';

app.use('/auth', authRoutes);
app.use('/me', userRoutes);
app.use('/meals', mealRoutes);

export default app;
