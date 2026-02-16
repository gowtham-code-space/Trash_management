import { badRequestResponse, successResponse, unauthorizedResponse, internalServerErrorResponse, createdResponse } from '../utils/response.js';
import { requestOtp, verifyOtp, refreshAccessToken, completeSignup, logout } from './auth.services.js';
import { verifyRefreshToken } from '../utils/jwt.js';
import { getUserById } from './auth.model.js';
import { getPublicUrl } from '../utils/publicUrlService.js';

export const requestOtpHandler = async (req, res) => {
    try {
        const { email, isSignup } = req.body;
        if (!email) {
            return badRequestResponse(res, 'Email is required');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return badRequestResponse(res, 'Invalid email format');
        }
        
        const result = await requestOtp(email, isSignup || false);
        
        // Check if user should be redirected
        if (result.shouldRedirect) {
            return successResponse(res, result.message, {
                shouldRedirect: result.shouldRedirect
            });
        }
        
        return createdResponse(res, result.message, {
            otp_id: result.otp_id,
            userId: result.userId,
            message: 'Check your email for OTP'
        });
    } catch (error) {
        console.error('Error in requestOtpHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to send OTP');
    }
};

export const verifyOtpHandler = async (req, res) => {
    try {
        const { email, otp_code } = req.body;

        if (!email || !otp_code) {
            return badRequestResponse(res, 'Email and OTP code are required');
        }

        if (otp_code.length !== 6 || isNaN(otp_code)) {
            return badRequestResponse(res, 'Invalid OTP format (must be 6 digits)');
        }

        const result = await verifyOtp(email, otp_code);

        // Set refresh token in HttpOnly cookie only
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true, // Required for sameSite: 'none'
            sameSite: 'none', // Required for cross-site (dev tunnels)
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return successResponse(res, result.message, {
            accessToken: result.accessToken,
            hasCompletedSignup: result.hasCompletedSignup
        });

    } catch (error) {
        console.error('Error in verifyOtpHandler:', error);

        if (
            error.message.includes('expired') ||
            error.message.includes('invalid') ||
            error.message.includes('Invalid')
        ) {
            return unauthorizedResponse(res, error.message);
        }

        return internalServerErrorResponse(
            res,
            error.message || 'Failed to verify OTP'
        );
    }
};

export const refreshTokenHandler = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return unauthorizedResponse(res, 'Refresh token required');
        }
        
        const decoded = verifyRefreshToken(refreshToken);
        
        if (!decoded) {
            return unauthorizedResponse(res, 'Invalid or expired refresh token');
        }
        
        // Generate new access token AND new refresh token (rotation)
        const result = await refreshAccessToken(refreshToken, decoded);
        
        // Set NEW refresh token as HttpOnly cookie (invalidates old one)
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        return successResponse(res, result.message, {
            accessToken: result.accessToken
        });
    } catch (error) {
        console.error('Error in refreshTokenHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to refresh token');
    }
};

export const logoutHandler = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        // Decode refresh token to get user_id
        if (refreshToken) {
            const decoded = verifyRefreshToken(refreshToken);
            if (decoded && decoded.user_id) {
                await logout(decoded.user_id);
            }
        }
        
        // Clear HttpOnly refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        
        return successResponse(res, 'Logged out successfully');
    } catch (error) {
        console.error('Error in logoutHandler:', error);
        return internalServerErrorResponse(res, 'Failed to logout');
    }
};


export const completeSignupHandler = async (req, res) => {
    try {
        const { userId, firstName, lastName, email, phoneNumber, district, wardName, streetName, houseNumber } = req.body;
        
        if (!userId || !firstName || !lastName || !email || !phoneNumber || !district || !wardName || !streetName || !houseNumber) {
            return badRequestResponse(res, 'All fields are required');
        }
        
        // Handle profile picture upload
        let profilePicUrl = null;
        if (req.file) {
            profilePicUrl = req.file.path || getPublicUrl(req.file.filename);
        }
        
        const userData = {
            firstName,
            lastName,
            email,
            phoneNumber,
            district,
            wardName,
            streetName,
            houseNumber,
            profilePic: profilePicUrl
        };
        
        const result = await completeSignup(userId, userData);
        
        return successResponse(res, result.message, {
            completed: true
        });
    } catch (error) {
        console.error('Error in completeSignupHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to complete signup');
    }
};

export const getUserDetailsHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return badRequestResponse(res, 'User ID is required');
        }
        
        const user = await getUserById(userId);
        
        if (!user) {
            return badRequestResponse(res, 'User not found');
        }
        
        // Return user details without sensitive data
        return successResponse(res, 'User details fetched successfully', {
            user_id: user.user_id,
            first_name: user.first_name || null,
            last_name: user.last_name || null,
            email: user.email || null,
            phone_number: user.phone_number || null,
            role_id: user.role_id,
            role_name: user.role_name,
            profile_pic: user.profile_pic || null,
            district: user.district || null,
            ward_name: user.ward_name || null
        });
    } catch (error) {
        console.error('Error in getUserDetailsHandler:', error);
        return internalServerErrorResponse(res, error.message || 'Failed to fetch user details');
    }
};
