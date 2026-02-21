import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './auth/auth.routes.js';
import settingsRoutes from './features/common/settings/settings.routes.js';
import quizRoutes from './features/engagement/quiz/quiz.routes.js';
import idCardRoutes from './features/common/IdCard/IdCard.routes.js';

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173' , 'https://5dnv4qb3-5173.inc1.devtunnels.ms'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-New-Access-Token']
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});


app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/idcard', idCardRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

export default app;