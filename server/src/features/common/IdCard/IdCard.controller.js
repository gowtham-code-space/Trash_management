import { 
    successResponse, 
    forbiddenResponse,
    internalServerErrorResponse
} from '../../../utils/response.js';
import { getIdCardService } from './IdCard.services.js';

export const getIdCardHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const roleId = req.user.roleId;

        if (roleId === 1) {
            return forbiddenResponse(res, 'ID card not available for residents');
        }

        const idCard = await getIdCardService(userId);
        return successResponse(res, 'ID card retrieved successfully', { idCard });
    } catch (error) {
        console.error('Error in getIdCardHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to retrieve ID card');
    }
};
