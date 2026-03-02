import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './auth/auth.routes.js';
import settingsRoutes from './features/common/settings/settings.routes.js';
import quizRoutes from './features/engagement/quiz/quiz.routes.js';
import idCardRoutes from './features/common/IdCard/IdCard.routes.js';
import adminRoutes from './features/admin/admin.routes.js';

//loggers import
import {startWorkers} from "./logs/worker.js"
import { apiLogger } from './middleware/apiLogger.middleware.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = YAML.load(join(__dirname, '../docs/api/openapi.yaml'));

const app = express();

const corsOptions = {
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://5dnv4qb3-5173.inc1.devtunnels.ms'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-New-Access-Token']
};

app.options('/{*path}', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// api logger
app.use(apiLogger);


app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Trash Management API Documentation',
    customfavIcon: '/favicon.ico'
}));

app.get('/docs', (req, res) => {
    res.redirect('/api-docs');
});

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/idcard', idCardRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
    console.error('Global error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

startWorkers();
export default app;