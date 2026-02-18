import { 
    successResponse, 
    badRequestResponse, 
    unauthorizedResponse, 
    internalServerErrorResponse,
    createdResponse,
    conflictResponse
} from '../../../utils/response.js';
import {
    getUserProfileService,
    updateBasicProfileService,
    requestEmailChangeOtp,
    verifyEmailChangeOtp,
    requestPhoneChangeOtp,
    deleteProfilePicService,
    getAddressService,
    updateAddressService
} from './settings.services.js';

export const getUserProfileHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userProfile = await getUserProfileService(userId);
        return successResponse(res, 'Profile retrieved successfully', { profile: userProfile });
}
    catch (error) {
        console.error('Error in getUserProfileHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to retrieve profile');
    }
};

export const updateBasicProfileHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { firstName, lastName } = req.body;

        if (!firstName || !lastName) {
            return badRequestResponse(res, 'First name and last name are required');
        }
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();

        let profilePicPublicId = null;
        if (req.file) {
            profilePicPublicId = req.file.filename;
        }
        
        const updateData = {
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            profilePic: profilePicPublicId
        };
        
        const result = await updateBasicProfileService(userId, updateData);
        
        return successResponse(res, result.message);
    } catch (error) {
        console.error('Error in updateBasicProfileHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to update profile');
    }
};

export const requestEmailChangeOtpHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { newEmail } = req.body;
        
        if (!newEmail) {
            return badRequestResponse(res, 'New email is required');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return badRequestResponse(res, 'Invalid email format');
        }
        const result = await requestEmailChangeOtp(userId, newEmail.toLowerCase().trim());
        if (result.sameAsPrevious) {
            return successResponse(res, result.message, { sameAsPrevious: true });
        }
        
        return createdResponse(res, result.message, { otp_id: result.otp_id });
    } catch (error) {
        console.error('Error in requestEmailChangeOtpHandler:', error);
        
        if (error.message.includes('already in use')) {
            return conflictResponse(res, error.message);
        }
        
        return internalServerErrorResponse(res, error.message || 'Failed to send OTP');
    }
};

export const verifyEmailChangeOtpHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { newEmail, otpCode } = req.body;
        
        if (!newEmail || !otpCode) {
            return badRequestResponse(res, 'New email and OTP code are required');
        }
        
        if (otpCode.length !== 6 || isNaN(otpCode)) {
            return badRequestResponse(res, 'Invalid OTP format (must be 6 digits)');
        }
        
        const result = await verifyEmailChangeOtp(userId, newEmail.toLowerCase().trim(), otpCode);
        
        return successResponse(res, result.message);
    } catch (error) {
        console.error('Error in verifyEmailChangeOtpHandler:', error);
        
        if (
            error.message.includes('expired') ||
            error.message.includes('invalid') ||
            error.message.includes('Invalid') ||
            error.message.includes('Unauthorized')
        ) {
            return unauthorizedResponse(res, error.message);
        }
        
        return internalServerErrorResponse(res, error.message || 'Failed to verify OTP');
    }
};

// Request phone change OTP (under construction)
export const requestPhoneChangeOtpHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { newPhone } = req.body;
        
        if (!newPhone) {
            return badRequestResponse(res, 'New phone number is required');
        }
        
        const result = await requestPhoneChangeOtp(userId, newPhone.trim());
        
        // Check if phone is same as previous
        if (result.sameAsPrevious) {
            return successResponse(res, result.message, { sameAsPrevious: true });
        }
        
        // Check if under construction
        if (result.underConstruction) {
            return successResponse(res, result.message, { underConstruction: true });
        }
        
        return createdResponse(res, result.message);
    } catch (error) {
        console.error('Error in requestPhoneChangeOtpHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to process phone change request');
    }
};

export const deleteProfilePicHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await deleteProfilePicService(userId);
        return successResponse(res, result.message);
    } catch (error) {
        console.error('Error in deleteProfilePicHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to delete profile picture');
    }
};

export const getAddressHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const address = await getAddressService(userId);
        
        if (!address) {
            return badRequestResponse(res, 'Address not found');
        }
        
        return successResponse(res, 'Address retrieved successfully', address);
    } catch (error) {
        console.error('Error in getAddress Handler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to retrieve address');
    }
};

export const updateAddressHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { district_id, ward_id, street_id, house_number } = req.body;
        
        if (!district_id || !ward_id || !street_id || !house_number) {
            return badRequestResponse(res, 'All address fields are required');
        }
        
        const result = await updateAddressService(userId, {
            district_id,
            ward_id,
            street_id,
            house_number: house_number.trim()
        });
        
        if (result.sameAsPrevious) {
            return res.status(200).json({
                success: false,
                sameAsPrevious: true,
                message: result.message
            });
        }
        
        return successResponse(res, result.message);
    } catch (error) {
        console.error('Error in updateAddressHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to update address');
    }
};
