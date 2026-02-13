import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateAccessToken, generateRefreshToken, hashRefreshToken, compareRefreshToken } from '../utils/jwt.js';
import { hashOtp, unhashOtp, generateOtpCode } from '../utils/otpCrypto.js';
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
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
                        <h2 style="color: #333; text-align: center;">Trash Management System</h2>
                        <p style="color: #666; font-size: 16px;">Hi ${userName},</p>
                        <p style="color: #666; font-size: 14px;">Your One-Time Password (OTP) for login is:</p>
                        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                            <h1 style="color: #007bff; margin: 0; letter-spacing: 2px;">${otpCode}</h1>
                        </div>
                        <p style="color: #999; font-size: 12px;">This OTP will expire in 10 minutes.</p>
                        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 11px; text-align: center;">© 2026 Trash Management. All rights reserved.</p>
                    </div>
                </div>
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
                profile_pic: user.profile_pic || null
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
