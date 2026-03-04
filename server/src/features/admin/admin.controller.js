import { successResponse, badRequestResponse, internalServerErrorResponse } from '../../utils/response.js';
import {
    getMetricsService, getLogsService, getDistinctValuesService, exportLogsService, getDashboardKpisService, getQuizKpisService,
    getQuizConfigsService, createQuizConfigService, updateQuizConfigService, deleteQuizConfigService, setActiveQuizConfigService,
    getDeletedQuizConfigsService, restoreQuizConfigService,
    getQuestionsService, createQuestionService, updateQuestionService, deleteQuestionService, bulkCreateQuestionsService,
} from './admin.services.js';

export const getMetricsHandler = async (req, res) => {
    try {
        const { range, interval = '5m', metric_type, start, end } = req.query;
        if (!metric_type) return badRequestResponse(res, 'metric_type is required');

        const data = await getMetricsService({ range, interval, metricType: metric_type, start, end });
        return successResponse(res, 'Metrics fetched', data);
        
    } catch (err) {
        if (err.status === 400) return badRequestResponse(res, err.message);
        console.error('Error in getMetricsHandler:', err);
        return internalServerErrorResponse(res, 'Failed to fetch metrics');
    }
};

export const getLogsHandler = async (req, res) => {
    try {
        const { type, page = 1, limit = 20, search, method, status, user_id, action, entity_type, event_type, severity, performed_by, start, end } = req.query;
        if (!type) return badRequestResponse(res, 'type is required');
        const data = await getLogsService({ type, page, limit, search, method, status, userId: user_id, action, entityType: entity_type, eventType: event_type, severity, performedBy: performed_by, start, end });
        return successResponse(res, 'Logs fetched', data);
    } catch (err) {
        if (err.status === 400) return badRequestResponse(res, err.message);
        console.error('getLogsHandler:', err);
        return internalServerErrorResponse(res, 'Failed to fetch logs');
    }
};

export const getDistinctValuesHandler = async (req, res) => {
    try {
        const { type } = req.query;
        if (!type) return badRequestResponse(res, 'type is required');
        const data = await getDistinctValuesService(type);
        return successResponse(res, 'Filters fetched', data);
    } catch (err) {
        if (err.status === 400) return badRequestResponse(res, err.message);
        return internalServerErrorResponse(res, 'Failed to fetch filters');
    }
};

export const exportLogsHandler = async (req, res) => {
    try {
        const { type, search, method, status, user_id, action, entity_type, event_type, severity, performed_by, start, end } = req.query;
        if (!type) return badRequestResponse(res, 'type is required');
        const rows = await exportLogsService({ type, search, method, status, userId: user_id, action, entityType: entity_type, eventType: event_type, severity, performedBy: performed_by, start, end });
        return successResponse(res, 'Export ready', rows);
    } catch (err) {
        if (err.status === 400) return badRequestResponse(res, err.message);
        return internalServerErrorResponse(res, 'Failed to export logs');
    }
};

export const getDashboardKpisHandler = async (req, res) => {
    try {
        const data = await getDashboardKpisService();
        return successResponse(res, 'KPIs fetched', data);
    } catch (err) {
        console.error('getDashboardKpisHandler:', err);
        return internalServerErrorResponse(res, 'Failed to fetch KPIs');
    }
};


export const getQuizKpisHandler = async (req, res) => {
    try {
        const data = await getQuizKpisService();
        return successResponse(res, 'Quiz KPIs fetched', data);
    } catch (err) {
        console.error('getQuizKpisHandler:', err);
        return internalServerErrorResponse(res, 'Failed to fetch quiz KPIs');
    }
};

export const getQuizConfigsHandler = async (req, res) => {
    try {
        return successResponse(res, 'Configs fetched', await getQuizConfigsService());
    } catch (err) { return internalServerErrorResponse(res, 'Failed to fetch configs'); }
};

export const createQuizConfigHandler = async (req, res) => {
    try {
        const config = await createQuizConfigService(req.body);
        return successResponse(res, 'Config created', config);
    } catch (err) { return internalServerErrorResponse(res, 'Failed to create config'); }
};

export const updateQuizConfigHandler = async (req, res) => {
    try {
        const config = await updateQuizConfigService(req.params.id, req.body);
        return successResponse(res, 'Config updated', config);
    } catch (err) { return internalServerErrorResponse(res, 'Failed to update config'); }
};

export const deleteQuizConfigHandler = async (req, res) => {
    try {
        await deleteQuizConfigService(req.params.id);
        return successResponse(res, 'Config deleted');
    } catch (err) { return internalServerErrorResponse(res, 'Failed to delete config'); }
};

export const getDeletedQuizConfigsHandler = async (req, res) => {
    try {
        return successResponse(res, 'Deleted configs fetched', await getDeletedQuizConfigsService());
    } catch (err) { return internalServerErrorResponse(res, 'Failed to fetch deleted configs'); }
};

export const restoreQuizConfigHandler = async (req, res) => {
    try {
        await restoreQuizConfigService(req.params.id);
        return successResponse(res, 'Config restored');
    } catch (err) { return internalServerErrorResponse(res, 'Failed to restore config'); }
};

export const setActiveQuizConfigHandler = async (req, res) => {
    try {
        await setActiveQuizConfigService(req.params.id);
        return successResponse(res, 'Config activated');
    } catch (err) { return internalServerErrorResponse(res, 'Failed to activate config'); }
};


export const getQuestionsHandler = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        return successResponse(res, 'Questions fetched', await getQuestionsService({ search, page, limit }));
    } catch (err) { return internalServerErrorResponse(res, 'Failed to fetch questions'); }
};

export const createQuestionHandler = async (req, res) => {
    try {
        const id = await createQuestionService(req.body);
        return successResponse(res, 'Question created', { question_id: id });
    } catch (err) { return internalServerErrorResponse(res, 'Failed to create question'); }
};

export const updateQuestionHandler = async (req, res) => {
    try {
        await updateQuestionService(req.params.id, req.body);
        return successResponse(res, 'Question updated');
    } catch (err) { return internalServerErrorResponse(res, 'Failed to update question'); }
};

export const deleteQuestionHandler = async (req, res) => {
    try {
        await deleteQuestionService(req.params.id);
        return successResponse(res, 'Question deleted');
    } catch (err) { return internalServerErrorResponse(res, 'Failed to delete question'); }
};

export const bulkCreateQuestionsHandler = async (req, res) => {
    try {
        const { questions } = req.body;
        if (!Array.isArray(questions) || !questions.length) return badRequestResponse(res, 'questions array is required');
        const count = await bulkCreateQuestionsService(questions);
        return successResponse(res, `${count} questions uploaded`);
    } catch (err) { return internalServerErrorResponse(res, 'Failed to bulk upload questions'); }
};
