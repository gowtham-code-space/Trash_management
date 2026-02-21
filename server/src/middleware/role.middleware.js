import { forbiddenResponse } from '../utils/response.js';

export const requireRole = (requiredRoleId) => {
    return (req, res, next) => {        
        
        if (!req.user.roleId) {
            return forbiddenResponse(res, 'User role not found');
        }
        if (req.user.roleId !== Number(requiredRoleId)) {
            return forbiddenResponse(res, 'Insufficient permissions');
        }
        
        next();
    };
};
