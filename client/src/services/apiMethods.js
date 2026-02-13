import { apiClient } from './apiClient';

export const api = {
    get: async (url, config) => {
        const res = await apiClient.get(url, config);
        return res.data;
    },

    post: async (url, data, config) => {
        const res = await apiClient.post(url, data, config);
        return res.data;
    },

    put: async (url, data, config) => {
        const res = await apiClient.put(url, data, config);
        return res.data;
    },

    delete: async (url, config) => {
        const res = await apiClient.delete(url, config);
        return res.data;
    },
};
