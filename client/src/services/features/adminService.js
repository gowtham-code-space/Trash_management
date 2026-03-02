import { api } from '../core/apiMethods';

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
