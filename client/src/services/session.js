import { useAuthStore } from '../store/authStore';
import axios from 'axios';

// Decode JWT token (simple base64 decode)
export const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload);
        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const saveAccessToken = (token) => {
    const decoded = decodeToken(token);
    useAuthStore.getState().setAccessToken(token);
    if (decoded) {
        useAuthStore.getState().setUser(decoded);
    }
};

export const getAccessToken = () => {
    return useAuthStore.getState().accessToken;
};

export const getUser = () => {
    return useAuthStore.getState().user;
};

export const clearSession = () => {
    useAuthStore.getState().logout();
};

// Silent refresh: called on app load to restore session from HttpOnly refresh token
export const silentRefresh = async () => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/refresh`,
            {},
            { withCredentials: true } // Send HttpOnly cookie
        );

        const { accessToken } = response.data.data;
        if (accessToken) {
            saveAccessToken(accessToken);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Silent refresh failed:', error);
        clearSession();
        return false;
    }
};
