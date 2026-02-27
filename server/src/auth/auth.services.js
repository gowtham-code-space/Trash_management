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
            html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Static Template</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    </head>
    <body style="margin:0; font-family:'Poppins',sans-serif; background:#ffffff; font-size:14px;">

    <div style="
        max-width:680px;
        margin:0 auto;
        padding:45px 30px 60px;
        background:#f4f7ff;
        background-image:url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
        background-repeat:no-repeat;
        background-size:800px 452px;
        background-position:top center;
        font-size:14px;
        color:#434343;
    ">

        <!-- Header -->
        <header>
        <table style="width:100%;">
            <tbody>
            <tr style="height:0;">
                <td>
                <p style="font-weight:bold; font-size:24px; color:#ffffff; margin:0;">Trash Management</p>
                </td>
            </tr>
            </tbody>
        </table>
        </header>

        <!-- Main -->
        <main>
        <div style="
            margin:0;
            margin-top:70px;
            padding:60px 30px 60px;
            background:#ffffff;
            border-radius:30px;
            text-align:center;
        ">
            <div style="width:100%; max-width:489px; margin:0 auto;">

            <h1 style="margin:0; font-size:24px; font-weight:500; color:#1f1f1f;">
                Your OTP
            </h1>

            <p style="margin:0; margin-top:17px; font-size:16px; font-weight:500;">
                Hey <span style="font-weight:bold; color:#1E8E54;">${userName},</span>
            </p>

            <p style="margin:0; margin-top:17px; font-weight:500; letter-spacing:0.56px; line-height:1.6;">
                Thank you for using Trash management. Use the following OTP to complete the procedure to change your email address. OTP is valid for
                <span style="font-weight:600; color:#1f1f1f;">10 minutes</span>.
                Do not share this code with others.
            </p>

            <div style="
                background-color:#F4F7FF;
                border-radius:25px;
                padding:30px 20px;
                margin-top:36px;
            ">
                <p style="
                margin:0;
                font-size:40px;
                font-weight:600;
                letter-spacing:25px;
                color:#1E8E54;
                text-align:center;
                padding-left:25px; /* compensate letter-spacing optical shift */
                ">
                ${otpCode}
                </p>
            </div>

            </div>
        </div>

        <!-- Help text -->
        <p style="
            max-width:400px;
            margin:0 auto;
            margin-top:40px;
            text-align:center;
            font-weight:500;
            color:#8c8c8c;
            line-height:1.7;
        ">
            Need help? Ask at
            <a href="mailto:gowthamj7773@gmail.com" style="color:#1E8E54; text-decoration:none;">gowthamj7773@gmail.com</a>
            or visit our
            <a href="" target="_blank" style="color:#1E8E54; text-decoration:none;">Help Center</a>
        </p>
        </main>

        <!-- Footer -->
        <footer style="
        width:100%;
        max-width:490px;
        margin:30px auto 0;
        text-align:center;
        border-top:1px solid #e6ebf1;
        ">
        <p style="margin:0; margin-top:40px; font-size:22px; font-weight:600; color:#434343;">
            Trash Management
        </p>

        <p style="margin:0; margin-top:8px; color:#434343;">
            Sample Address, Sample State, Country-123.
        </p>

        <!-- Social icons -->
        <div style="margin:16px 0 0;">
            <a href="" target="_blank" style="display:inline-block;">
            <img width="36" alt="Facebook" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook"/>
            </a>
            <a href="" target="_blank" style="display:inline-block; margin-left:8px;">
            <img width="36" alt="Instagram" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram"/>
            </a>
            <a href="" target="_blank" style="display:inline-block; margin-left:8px;">
            <img width="36" alt="Twitter" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter"/>
            </a>
            <a href="" target="_blank" style="display:inline-block; margin-left:8px;">
            <img width="36" alt="Youtube" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube"/>
            </a>
        </div>

        <p style="margin:0; margin-top:16px; margin-bottom:0; color:#434343;">
            Copyright © 2026 Company. All rights reserved.
        </p>
        </footer>

    </div>
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
