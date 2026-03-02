import { forbiddenResponse } from '../utils/response.js';

export const requireRole = (requiredRoleId) => {
    return (req, res, next) => {        
        
        if (!req.user.role_id) {
            return forbiddenResponse(res, 'User role not found');
        }
        if (Number(req.user.role_id) !== Number(requiredRoleId)) {
            return forbiddenResponse(res, 'Insufficient permissions');
        }
        
        next();
    };
};
