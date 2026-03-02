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
