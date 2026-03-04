import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateAccessToken, generateRefreshToken, hashRefreshToken, compareRefreshToken } from '../utils/jwt.js';
import { hashOtp, unhashOtp, generateOtpCode } from '../utils/otpCrypto.js';
import { getPublicUrl } from '../utils/publicUrlService.js';
import * as authModel from './auth.model.js';

dotenv.config();

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
});

export const sendOtpEmail = async (email, otpCode, userName = 'User') => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Trash Management Login',
            html: 
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>OTP Email</title>

            <style>
            @media screen and (max-width: 600px) {

            .container {
                padding: 25px 15px 40px !important;
            }

            .main-card {
                padding: 35px 20px !important;
                border-radius: 20px !important;
            }

            .otp-box {
                padding: 20px 10px !important;
            }

            .otp-text {
                font-size: 28px !important;
                letter-spacing: 12px !important;
                padding-left: 12px !important;
            }

            .heading {
                font-size: 20px !important;
            }

            .paragraph {
                font-size: 14px !important;
            }

            .footer-title {
                font-size: 18px !important;
            }

            }
            </style>

            </head>

            <body style="margin:0; font-family:'Poppins',sans-serif; background:#ffffff;">

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
            <td align="center">

            <!-- Wrapper -->
            <table class="container" width="680" cellpadding="0" cellspacing="0" border="0"
            style="max-width:680px;width:100%;padding:45px 30px 60px;background:#f4f7ff;background-image:url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);background-repeat:no-repeat;background-size:800px 452px;background-position:top center;color:#434343;">

            <!-- Header -->
            <tr>
            <td>
            <p style="font-weight:bold;font-size:24px;color:#ffffff;margin:0;">
            Trash Management
            </p>
            </td>
            </tr>

            <!-- Main Card -->
            <tr>
            <td align="center">

            <table class="main-card" width="100%" cellpadding="0" cellspacing="0"
            style="margin-top:70px;padding:60px 30px;background:#ffffff;border-radius:30px;text-align:center;">

            <tr>
            <td>

            <h1 class="heading" style="margin:0;font-size:24px;font-weight:500;color:#1f1f1f;">
            Your OTP
            </h1>

            <p class="paragraph" style="margin-top:17px;font-size:16px;font-weight:500;">
            Hey <span style="font-weight:bold;color:#1E8E54;">${userName},</span>
            </p>

            <p class="paragraph" style="margin-top:17px;font-weight:500;letter-spacing:0.5px;line-height:1.6;">
            Use the following OTP to complete the procedure. OTP is valid for 
            <strong>10 minutes</strong>. Do not share this code.
            </p>

            <!-- OTP Box -->
            <table class="otp-box" width="100%" cellpadding="0" cellspacing="0"
            style="background:#F4F7FF;border-radius:25px;padding:30px 20px;margin-top:36px;">
            <tr>
            <td align="center">

            <p class="otp-text"
            style="margin:0;font-size:40px;font-weight:600;letter-spacing:25px;color:#1E8E54;padding-left:25px;">
            ${otpCode}
            </p>

            </td>
            </tr>
            </table>

            </td>
            </tr>
            </table>

            </td>
            </tr>

            <!-- Footer -->
            <tr>
            <td align="center">

            <p class="footer-title"
            style="margin-top:40px;font-size:22px;font-weight:600;color:#434343;">
            Trash Management
            </p>

            <p style="margin-top:8px;color:#434343;">
            Sample Address, Sample State, Country-123
            </p>

            <p style="margin-top:16px;color:#434343;">
            Copyright © 2026 Company. All rights reserved.
            </p>

            </td>
            </tr>

            </table>
            </td>
            </tr>
            </table>

            </body>
            </html>
            `
        };
        
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

export const requestOtp = async (email, isSignup = false) => {
    try {
        const otpCode = generateOtpCode();
        const hashedOtp = hashOtp(otpCode);
        
        let user = await authModel.getUserByIdentifier(email);
        let userId;
        
        if (isSignup) {
            if (user && user.has_completed_signup === 1) {
                return {
                    success: false,
                    shouldRedirect: 'login',
                    message: 'Account already exists. Please login instead.'
                };
            }
            
            if (!user) {
                const identifierType = email.includes('@') ? 'email' : 'phone';
                const newUser = await authModel.createUser(email, identifierType, 'RESIDENT');
                userId = newUser.user_id;
            } else {
                userId = user.user_id;
            }
        } else {
            if (!user) {
                return {
                    success: false,
                    shouldRedirect: 'signup',
                    message: 'Account not found. Please sign up first.'
                };
            }
            
            if (user.has_completed_signup === 0) {
                return {
                    success: false,
                    shouldRedirect: 'signup',
                    message: 'Please complete your signup first.'
                };
            }
            
            userId = user.user_id;
        }
        
        await authModel.invalidateOldOtps(userId);
        
        // Store OTP in database (expires_at set to NOW() + 10 minutes in IST via MySQL)
        const otpResult = await authModel.storeOtp(userId, email, hashedOtp);
        if (!otpResult.success) {
            throw new Error('Failed to store OTP');
        }
        
        // Send OTP via email
        await sendOtpEmail(email, otpCode, user?.first_name || 'User');
        
        return {
            success: true,
            message: 'OTP sent to your email',
            otp_id: otpResult.otp_id,
            userId
        };
    } catch (error) {
        console.error('Error requesting OTP:', error);
        throw error;
    }
};

export const verifyOtp = async (email, otpCode) => {
    try {
        const otpRecord = await authModel.getOtpByIdentifier(email);
        
        if (!otpRecord) {
            throw new Error('OTP expired or invalid');
        }
        const decryptedOtp = unhashOtp(otpRecord.otp_hash);
        
        if (decryptedOtp !== otpCode) {
            throw new Error('Invalid OTP code');
        }
        
        // Mark OTP as used
        await authModel.markOtpAsUsed(otpRecord.otp_id);
        const user = await authModel.getUserById(otpRecord.user_id);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Generate tokens with minimal payload (only user_id and role_id)
        const payload = {
            user_id: user.user_id,
            role_id: user.role_id
        };
        
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        
        // Hash and store refresh token in database (single active session per user)
        const refreshTokenHash = hashRefreshToken(refreshToken);
        await authModel.storeRefreshTokenHash(user.user_id, refreshTokenHash);
        
        return {
            success: true,
            message: user.has_completed_signup === 0 ? 'OTP verified. Complete your profile.' : 'Login successful',
            accessToken,
            refreshToken,
            hasCompletedSignup: user.has_completed_signup === 1,
            user: {
                user_id: user.user_id,
                first_name: user.first_name || null,
                last_name: user.last_name || null,
                email: user.email || null,
                phone_number: user.phone_number || null,
                role_id: user.role_id,
                role_name: user.role_name,
                profile_pic: user.profile_pic ? getPublicUrl(user.profile_pic) : null
            }
        };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

export const refreshAccessToken = async (refreshToken, user) => {
    try {
        // Verify refresh token against stored hash in database
        const storedHash = await authModel.getRefreshTokenHash(user.user_id);
        if (!storedHash) {
            throw new Error('No active session found. Please login again.');
        }
        
        if (!compareRefreshToken(refreshToken, storedHash)) {
            // Old/invalid token - reject but don't clear DB (active session might be on another device)
            throw new Error('Invalid refresh token. Please login again.');
        }
        
        const payload = {
            user_id: user.user_id,
            role_id: user.role_id
        };
        
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);
        
        // Update database with new refresh token hash (rotation)
        const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
        await authModel.storeRefreshTokenHash(user.user_id, newRefreshTokenHash);
        
        return {
            success: true,
            message: 'Token refreshed successfully',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};

export const completeSignup = async (userId, userData) => {
    try {
        const result = await authModel.completeUserSignup(userId, userData);
        
        if (!result) {
            throw new Error('Failed to complete signup');
        }
        
        return {
            success: true,
            message: 'Signup completed successfully'
        };
    } catch (error) {
        console.error('Error completing signup:', error);
        throw error;
    }
};

export const logout = async (userId) => {
    try {
        // Clear refresh token hash from database (invalidates session)
        await authModel.clearRefreshTokenHash(userId);
        
        return {
            success: true,
            message: 'Logged out successfully'
        };
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
};

export const getDistricts = async () => {
    try {
        const districts = await authModel.getAllDistricts();
        return { success: true, data: districts };
    } catch (error) {
        console.error('Error fetching districts:', error);
        throw error;
    }
};

export const getWards = async (districtId) => {
    try {
        const wards = await authModel.getWardsByDistrictId(districtId);
        return { success: true, data: wards };
    } catch (error) {
        console.error('Error fetching wards:', error);
        throw error;
    }
};

export const getStreets = async (wardId) => {
    try {
        const streets = await authModel.getStreetsByWardId(wardId);
        return { success: true, data: streets };
    } catch (error) {
        console.error('Error fetching streets:', error);
        throw error;
    }
};

export const checkContact = async (contact, type) => {
    try {
        const exists = await authModel.checkContactExists(contact, type);
        return { exists };
    } catch (error) {
        console.error('Error checking contact:', error);
        throw error;
    }
};
