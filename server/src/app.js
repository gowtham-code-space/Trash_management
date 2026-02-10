import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration - FIX THIS TOO!
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Add default
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

// Import routes (you'll create these later)
// import authRoutes from './auth/auth.routes.js';
// import userRoutes from './features/users/user.routes.js';
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

// ✅ FIXED: 404 handler - use regex wildcard
// app.use('(.*)', (req, res) => {
//     res.status(404).json({
//         success: false,
//         message: `Route ${req.originalUrl} not found`
//     });
// });

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