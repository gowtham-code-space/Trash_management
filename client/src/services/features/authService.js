import { api } from '../core/apiMethods';

export const requestOtp = async (data) => {
    return await api.post('/auth/request-otp', data);
};

export const verifyOtp = async (data) => {
    return await api.post('/auth/verify-otp', data);
};

export const completeSignup = async (formData, config = {}) => {
    return await api.post('/auth/complete-signup', formData, config);
};

export const logout = async () => {
    return await api.post('/auth/logout');
};

export const checkContact = async (contact, type) => {
    return await api.post('/auth/check-contact', { contact, type });
};

// dropdowns

export const getDistricts = async () => {
    return await api.get('/auth/districts');
};

export const getWardsByDistrict = async (districtId) => {
    return await api.get(`/auth/wards/${districtId}`);
};

export const getStreetsByWard = async (wardId) => {
    return await api.get(`/auth/streets/${wardId}`);
};
