import * as adminModel from './admin.model.js';

const INTERVALS = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600 };
const METRIC_TYPES = ['API_TRAFFIC', 'HTTP_4XX', 'HTTP_5XX'];
const RANGES = ['today', 'week', 'month'];
const MAX_BUCKETS = 2000;

const rangeWindow = (range) => {
    const now = new Date();
    if (range === 'today') {
        const start = new Date(now);
        start.setUTCHours(0, 0, 0, 0);
        return { start, end: now };
    }
    if (range === 'week') {
        return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now };
    }
    return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
};

const err400 = (msg) => Object.assign(new Error(msg), { status: 400 });

export const getMetricsService = async ({ range, interval, metricType, start: startParam, end: endParam }) => {
    if (!INTERVALS[interval]) throw err400('Invalid interval. Use: 1m, 5m, 15m, 1h');
    if (!METRIC_TYPES.includes(metricType)) throw err400('Invalid metric_type. Use: API_TRAFFIC, HTTP_4XX, HTTP_5XX');

    let start, end;

    if (startParam && endParam) {
        start = new Date(startParam);
        end = new Date(endParam);
        if (isNaN(start) || isNaN(end)) throw err400('Invalid date format for start/end');
    } else {
        if (!RANGES.includes(range)) throw err400('Invalid range. Use: today, week, month');
        ({ start, end } = rangeWindow(range));
    }

    const intervalSec = INTERVALS[interval];
    const rangeSeconds = (end.getTime() - start.getTime()) / 1000;

    if (rangeSeconds / intervalSec > MAX_BUCKETS) {
        throw err400(`Interval too small for selected range. Would exceed ${MAX_BUCKETS} buckets.`);
    }

    const rows = await adminModel.getMetricsData(metricType, start, end, intervalSec);
    return rows.map(r => ({ bucket: r.bucket, value: Number(r.value) }));
};

export const getLogsService = async ({ type, page = 1, limit = 20, search, method, status, userId, action, entityType, eventType, severity, performedBy, start, end }) => {
    const offset = (Number(page) - 1) * Number(limit);
    const filters = { search, method, status, userId, action, entityType, eventType, severity, performedBy, start, end };
    let rows, total;
    if (type === 'api') {
        [rows, total] = await Promise.all([adminModel.getApiLogs(filters, limit, offset), adminModel.getApiLogsCount(filters)]);
    } else if (type === 'audit') {
        [rows, total] = await Promise.all([adminModel.getAuditLogs(filters, limit, offset), adminModel.getAuditLogsCount(filters)]);
    } else if (type === 'event') {
        [rows, total] = await Promise.all([adminModel.getEventLogs(filters, limit, offset), adminModel.getEventLogsCount(filters)]);
    } else {
        throw err400('Invalid type. Use: api, audit, event');
    }
    return { rows, total, page: Number(page), limit: Number(limit) };
};

export const getDistinctValuesService = async (type) => {
    if (type === 'api') return adminModel.getApiDistinct();
    if (type === 'audit') return adminModel.getAuditDistinct();
    if (type === 'event') return adminModel.getEventDistinct();
    throw err400('Invalid type');
};

export const exportLogsService = async ({ type, search, method, status, userId, action, entityType, eventType, severity, performedBy, start, end }) => {
    const filters = { search, method, status, userId, action, entityType, eventType, severity, performedBy, start, end };
    if (type === 'api') return adminModel.exportApiLogs(filters);
    if (type === 'audit') return adminModel.exportAuditLogs(filters);
    if (type === 'event') return adminModel.exportEventLogs(filters);
    throw err400('Invalid type');
};

export const getDashboardKpisService = async () => adminModel.getDashboardKpis();

export const getQuizKpisService = async () => adminModel.getQuizKpis();

// ── Quiz Configs ──────────────────────────────────────────────────────────────
export const getQuizConfigsService = async () => adminModel.getAllQuizConfigs();

export const createQuizConfigService = async (data) => {
    const id = await adminModel.createQuizConfig(data);
    const configs = await adminModel.getAllQuizConfigs();
    return configs.find(c => c.score_time_id === id);
};

export const updateQuizConfigService = async (id, data) => {
    await adminModel.updateQuizConfig(id, data);
    const configs = await adminModel.getAllQuizConfigs();
    return configs.find(c => c.score_time_id === Number(id)) || null;
};

export const deleteQuizConfigService = async (id) => adminModel.deleteQuizConfig(id);

export const restoreQuizConfigService = async (id) => adminModel.restoreQuizConfig(id);

export const getDeletedQuizConfigsService = async () => adminModel.getDeletedQuizConfigs();

export const setActiveQuizConfigService = async (id) => adminModel.setActiveQuizConfig(id);

// ── Questions ─────────────────────────────────────────────────────────────────
export const getQuestionsService = async ({ search, page = 1, limit = 10 }) => {
    const offset = (Number(page) - 1) * Number(limit);
    const [rows, total] = await Promise.all([
        adminModel.getQuestions({ search, limit, offset }),
        adminModel.getQuestionsCount({ search }),
    ]);
    return { rows, total, page: Number(page), limit: Number(limit) };
};

export const createQuestionService = async (data) => adminModel.createQuestion(data);

export const updateQuestionService = async (id, data) => adminModel.updateQuestion(id, data);

export const deleteQuestionService = async (id) => adminModel.deleteQuestion(id);

export const bulkCreateQuestionsService = async (questions) => adminModel.bulkCreateQuestions(questions);
