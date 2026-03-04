import { api } from '../core/apiMethods';

export const getLogs = async (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') query.set(k, v); });
    return api.get(`/admin/logs?${query}`);
};

export const getLogFilters = async (type) => api.get(`/admin/logs/filters?type=${type}`);

export const exportLogs = async (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') query.set(k, v); });
    return api.get(`/admin/logs/export?${query}`);
};

export const getDashboardKpis = async () => api.get('/admin/dashboard/kpis');

export const getQuizKpis = async () => api.get('/admin/quiz/kpis');


export const getQuizConfigs = async () => api.get('/admin/quiz/configs');
export const getDeletedQuizConfigs = async () => api.get('/admin/quiz/configs/deleted');
export const createQuizConfig = async (data) => api.post('/admin/quiz/configs', data);
export const updateQuizConfig = async (id, data) => api.put(`/admin/quiz/configs/${id}`, data);
export const deleteQuizConfig = async (id) => api.delete(`/admin/quiz/configs/${id}`);
export const activateQuizConfig = async (id) => api.patch(`/admin/quiz/configs/${id}/activate`);
export const restoreQuizConfig = async (id) => api.patch(`/admin/quiz/configs/${id}/restore`);


export const getQuizQuestions = async (params) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.set(k, v); });
    return api.get(`/admin/quiz/questions?${q}`);
};
export const createQuizQuestion = async (data) => api.post('/admin/quiz/questions', data);
export const updateQuizQuestion = async (id, data) => api.put(`/admin/quiz/questions/${id}`, data);
export const deleteQuizQuestion = async (id) => api.delete(`/admin/quiz/questions/${id}`);
export const bulkUploadQuestions = async (questions) => api.post('/admin/quiz/questions/bulk', { questions });

export const getMetrics = async ({ range, interval, metricType, start, end }) => {
    const params = new URLSearchParams({ interval, metric_type: metricType });

    if (start && end) {
        params.set('start', start);
        params.set('end', end);
    } else {
        params.set('range', range);
    }

    return await api.get(`/admin/metrics?${params.toString()}`);
};
