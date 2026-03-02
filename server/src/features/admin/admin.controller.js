import { successResponse, badRequestResponse, internalServerErrorResponse } from '../../utils/response.js';
import { getMetricsService } from './admin.services.js';

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
