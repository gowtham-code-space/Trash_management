import { api } from '../core/apiMethods';
import { apiClient } from '../core/apiClient';

export const getQuizStats = async () => {
    return await api.get('/quiz/stats');
};

export const startQuiz = async () => {
    return await api.post('/quiz/start');
};

export const resumeQuiz = async (quizId) => {
    return await api.get(`/quiz/resume/${quizId}`);
};

export const saveAnswer = async (quizId, questionId, userAnswer) => {
    return await api.patch('/quiz/answer', { quizId, questionId, userAnswer });
};

export const markQuestion = async (quizId, questionId, isMarked) => {
    return await api.patch('/quiz/mark', { quizId, questionId, isMarked });
};

export const submitQuiz = async (quizId) => {
    return await api.post('/quiz/submit', { quizId });
};

export const getQuizHistory = async (page = 1, limit = 10, dateFilter = null, startDate = null, endDate = null) => {
    let url = `/quiz/history?page=${page}&limit=${limit}`;
    
    if (dateFilter) {
        url += `&dateFilter=${dateFilter}`;
    }
    
    if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    return await api.get(url);
};

export const getQuizReview = async (quizId) => {
    return await api.get(`/quiz/review/${quizId}`);
};

export const getCertificateUrl = (quizId) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return `${baseUrl}/quiz/certificate/${quizId}`;
};

export const downloadCertificate = async (quizId) => {
    try {
        const response = await apiClient.get(`/quiz/certificate/${quizId}`, {
            responseType: 'blob'
        });

        console.log('Certificate blob received:', response.data.type, response.data.size);
        
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate_quiz_${quizId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Error downloading certificate:', error);
        return { success: false, error: error.message };
    }
};
