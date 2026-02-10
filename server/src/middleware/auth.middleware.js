import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from '../utils/jwt.js';
import { unauthorizedResponse } from '../utils/response.js';

// used set this can be changed to redis for production
const blacklistedTokens = new Set();

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse(res, 'Access token required');
        }

        const accessToken = authHeader.split(' ')[1];
        
        if (blacklistedTokens.has(accessToken)) {
            return unauthorizedResponse(res, 'Token revoked');
        }

        const decoded = verifyAccessToken(accessToken);
        
        if (decoded) {
            req.user = decoded;
            req.accessToken = accessToken;
            return next();
        }
        
        // If verifyAccessToken returns null (expired or invalid)
        // Try to refresh using refresh token
        return await handleTokenRefresh(req, res, next);
        
    } catch (error) {
        console.error('Auth error:', error);
        return unauthorizedResponse(res, 'Authentication failed');
    }
};

const handleTokenRefresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        
        if (!refreshToken) {
            return unauthorizedResponse(res, 'Session expired. Please login.');
        }

        const decodedRefresh = verifyRefreshToken(refreshToken);
        
        if (!decodedRefresh) {
            clearRefreshTokenCookie(res);
            return unauthorizedResponse(res, 'Invalid session');
        }

        const newAccessToken = generateAccessToken({
            userId: decodedRefresh.userId,
            roleId: decodedRefresh.roleId
        });

        res.set('New-Access-Token', newAccessToken);
        req.user = decodedRefresh;
        req.accessToken = newAccessToken;
        
        return next();
        
    } catch (error) {
        clearRefreshTokenCookie(res);
        return unauthorizedResponse(res, 'Refresh failed');
    }
};

const clearRefreshTokenCookie = (res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false, // false for development
        sameSite: 'strict'
    });
};

export const logoutMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const accessToken = authHeader.split(' ')[1];
            blacklistedTokens.add(accessToken);
            
            setTimeout(() => {
                blacklistedTokens.delete(accessToken);
            }, 15 * 60 * 1000);
        }
        
        clearRefreshTokenCookie(res);
        next();
    } catch (error) {
        next();
    }
};

export const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const accessToken = authHeader.split(' ')[1];
            
            if (!blacklistedTokens.has(accessToken)) {
                const decoded = verifyAccessToken(accessToken);
                if (decoded) {
                    req.user = decoded;
                    req.accessToken = accessToken;
                }
            }
        }
        next();
    } catch (error) {
        next();
    }
};

export const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    // expiry 7d
};