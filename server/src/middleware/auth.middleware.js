import { verifyAccessToken } from '../utils/jwt.js';
import { unauthorizedResponse } from '../utils/response.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse(res, 'Access token required');
        }
        const accessToken = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(accessToken);
        
        if (!decoded) {
            return unauthorizedResponse(res, 'Invalid or expired token');
        }
        
        req.user = decoded;
        req.accessToken = accessToken;
        return next();
        
    } catch (error) {
        console.error('Auth error:', error);
        return unauthorizedResponse(res, 'Authentication failed');
    }
};
export const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const accessToken = authHeader.split(' ')[1];
            
            const decoded = verifyAccessToken(accessToken);
            if (decoded) {
                req.user = decoded;
                req.accessToken = accessToken;
            }
        }
        next();
    } catch (error) {
        next();
    }
};

export const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // FIXED TYPO: was hhtpOnly
        secure: true, // Required for sameSite: 'none'
        sameSite: 'none', // Required for cross-site (dev tunnels)
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};