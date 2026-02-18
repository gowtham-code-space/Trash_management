import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { hashOtp, unhashOtp, generateOtpCode } from '../../../utils/otpCrypto.js';
import { getPublicUrl, deleteFromCloudinary, extractPublicId } from '../../../utils/publicUrlService.js';
import * as settingsModel from './settings.model.js';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
});

export const sendSettingsOtpEmail = async (email, otpCode, userName = 'User') => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your New Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
                        <h2 style="color: #333; text-align: center;">Email Verification</h2>
                        <p style="color: #666; font-size: 16px;">Hi ${userName},</p>
                        <p style="color: #666; font-size: 14px;">You requested to change your email address. Please verify using the OTP below:</p>
                        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                            <h1 style="color: #007bff; margin: 0; letter-spacing: 2px;">${otpCode}</h1>
                        </div>
                        <p style="color: #999; font-size: 12px;">This OTP will expire in 10 minutes.</p>
                        <p style="color: #999; font-size: 12px;">If you didn't request this change, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 11px; text-align: center;">© 2026 Trash Management. All rights reserved.</p>
                    </div>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        console.error('Error sending settings OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

export const getUserProfileService = async (userId) => {
    try {
        const userProfile = await settingsModel.getUserProfile(userId);
        
        if (!userProfile) {
            throw new Error('User profile not found');
        }
        if (userProfile.profile_pic) {
            userProfile.profile_pic = getPublicUrl(userProfile.profile_pic);
        }
        
        return userProfile;
    } catch (error) {
        console.error('Error in getUserProfileService:', error);
        throw error;
    }
};

export const updateBasicProfileService = async (userId, updateData) => {
    try {
        if (updateData.profilePic) {
            const currentProfile = await settingsModel.getUserProfile(userId);
            if (currentProfile?.profile_pic) {
                try {
                    await deleteFromCloudinary(currentProfile.profile_pic);
                } catch (error) {
                    console.error('Warning: Failed to delete old profile pic from Cloudinary:', error);
                }
            }
        }
        
        const result = await settingsModel.updateBasicProfile(userId, updateData);
        if (!result) {
            throw new Error('Failed to update profile');
        }
        return {
            success: true,
            message: 'Profile updated successfully'
        };
    } catch (error) {
        console.error('Error in updateBasicProfileService:', error);
        throw error;
    }
};

export const deleteProfilePicService = async (userId) => {
    try {
        const currentProfile = await settingsModel.getUserProfile(userId);
        if (!currentProfile?.profile_pic) {
            throw new Error('No profile picture to delete');
        }
        
        await deleteFromCloudinary(currentProfile.profile_pic);
        
        const result = await settingsModel.deleteProfilePic(userId);
        if (!result) {
            throw new Error('Failed to delete profile picture from database');
        }
        
        return {
            success: true,
            message: 'Profile picture deleted successfully'
        };
    } catch (error) {
        console.error('Error in deleteProfilePicService:', error);
        throw error;
    }
};

export const requestEmailChangeOtp = async (userId, newEmail) => {
    try {
        const currentUser = await settingsModel.getUserProfile(userId);
        
        if (!currentUser) {
            throw new Error('User not found');
        }
        if (currentUser.email === newEmail) {
            return {
                success: false,
                sameAsPrevious: true,
                message: 'Field same as previous'
            };
        }
        const emailExists = await settingsModel.checkEmailExists(newEmail, userId);
        if (emailExists) {
            throw new Error('Email already in use by another account');
        }
        const otpCode = generateOtpCode();
        const hashedOtp = hashOtp(otpCode);

        await settingsModel.invalidateOldOtps(userId);
        const otpResult = await settingsModel.storeSettingsOtp(userId, newEmail, hashedOtp);
        if (!otpResult.success) {
            throw new Error('Failed to store OTP');
        }
        await sendSettingsOtpEmail(newEmail, otpCode, currentUser.first_name || 'User');
        
        return {
            success: true,
            message: 'OTP sent to your new email address',
            otp_id: otpResult.otp_id
        };
    } catch (error) {
        console.error('Error in requestEmailChangeOtp:', error);
        throw error;
    }
};

export const verifyEmailChangeOtp = async (userId, newEmail, otpCode) => {
    try {
        const otpRecord = await settingsModel.getSettingsOtpByIdentifier(newEmail);
        
        if (!otpRecord) {
            throw new Error('OTP expired or invalid');
        }
        if (otpRecord.user_id !== userId) {
            throw new Error('Unauthorized OTP verification');
        }
        const decryptedOtp = unhashOtp(otpRecord.otp_hash);
        
        if (decryptedOtp !== otpCode) {
            throw new Error('Invalid OTP code');
        }
        await settingsModel.markOtpAsUsed(otpRecord.otp_id);
        const updateResult = await settingsModel.updateUserEmail(userId, newEmail);
        
        if (!updateResult) {
            throw new Error('Failed to update email');
        }
        
        return {
            success: true,
            message: 'Email updated successfully'
        };
    } catch (error) {
        console.error('Error in verifyEmailChangeOtp:', error);
        throw error;
    }
};

// Request phone change (under construction)
export const requestPhoneChangeOtp = async (userId, newPhone) => {
    try {
        const currentUser = await settingsModel.getUserProfile(userId);
        
        if (!currentUser) {
            throw new Error('User not found');
        }
        
        if (currentUser.phone_number === newPhone) {
            return {
                success: false,
                sameAsPrevious: true,
                message: 'Field same as previous'
            };
        }
        
        return {
            success: false,
            underConstruction: true,
            message: 'Phone OTP under construction'
        };
    } catch (error) {
        console.error('Error in requestPhoneChangeOtp:', error);
        throw error;
    }
};

export const getAddressService = async (userId) => {
    try {
        const address = await settingsModel.getUserAddress(userId);
        
        if (!address) {
            return null;
        }
        
        const districtId = await settingsModel.getDistrictIdByName(address.district);
        const wardId = await settingsModel.getWardIdByDetails(address.ward_number, address.ward_name);
        const streetId = await settingsModel.getStreetIdByName(address.street_name);
        
        return {
            ...address,
            district_id: districtId,
            ward_id: wardId,
            street_id: streetId
        };
    } catch (error) {
        console.error('Error in getAddressService:', error);
        throw error;
    }
};

export const updateAddressService = async (userId, addressData) => {
    try {
        const currentAddress = await settingsModel.getUserAddress(userId);
        
        if (!currentAddress) {
            throw new Error('User address not found');
        }
        
        const districtName = await settingsModel.getDistrictNameById(addressData.district_id);
        const wardDetails = await settingsModel.getWardDetailsById(addressData.ward_id);
        const streetName = await settingsModel.getStreetNameById(addressData.street_id);
        
        if (!districtName || !wardDetails || !streetName) {
            throw new Error('Invalid address data');
        }
        
        const normalize = (val) => String(val || '').trim();
        const normalizeNum = (val) => parseInt(val) || 0;
        
        const isSameDistrict = normalize(currentAddress.district) === normalize(districtName);
        const isSameWardNumber = normalizeNum(currentAddress.ward_number) === normalizeNum(wardDetails.ward_number);
        const isSameWardName = normalize(currentAddress.ward_name) === normalize(wardDetails.ward_name);
        const isSameStreet = normalize(currentAddress.street_name) === normalize(streetName);
        const isSameHouse = normalize(currentAddress.house_number) === normalize(addressData.house_number);
        
        if (isSameDistrict && isSameWardNumber && isSameWardName && isSameStreet && isSameHouse) {
            return {
                success: false,
                sameAsPrevious: true,
                message: 'Fields same as previous values'
            };
        }
        
        const updateData = {
            district: districtName,
            ward_number: wardDetails.ward_number,
            ward_name: wardDetails.ward_name,
            street_name: streetName,
            house_number: addressData.house_number.trim()
        };
        
        const success = await settingsModel.updateUserAddress(userId, updateData);
        
        if (!success) {
            throw new Error('Failed to update address');
        }
        
        return {
            success: true,
            message: 'Address updated successfully'
        };
    } catch (error) {
        console.error('Error in updateAddressService:', error);
        throw error;
    }
};
