import { api } from '../core/apiMethods';

export const getProfile = async () => {
    return await api.get('/settings/profile');
};

export const updateProfile = async (formData) => {
    return await api.patch('/settings/profile', formData);
};

export const requestPhoneOtp = async (newPhone) => {
    return await api.post('/settings/request-phone-otp', { newPhone });
};

export const requestEmailOtp = async (newEmail) => {
    return await api.post('/settings/request-email-otp', { newEmail });
};

export const verifyEmailOtp = async (newEmail, otpCode) => {
    return await api.post('/settings/verify-email-otp', { newEmail, otpCode });
};

export const deleteProfilePic = async () => {
    return await api.delete('/settings/profile-pic');
};

export const getAddress = async () => {
    return await api.get('/settings/address');
};

export const updateAddress = async (addressData) => {
    return await api.patch('/settings/address', addressData);
};
