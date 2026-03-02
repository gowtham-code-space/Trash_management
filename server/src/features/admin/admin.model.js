import pool from '../../config/db.js';

export const getMetricsData = async (metricType, startTime, endTime, intervalSeconds) => {
    const [rows] = await pool.query(
        `SELECT
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(bucket_time) / ?) * ?) AS bucket,
            SUM(count) AS value
        FROM metrics_minute
        WHERE tenant_id = 1
            AND metric_type = ?
            AND bucket_time >= ?
            AND bucket_time < ?
        GROUP BY bucket
        ORDER BY bucket ASC`,
        [intervalSeconds, intervalSeconds, metricType, startTime, endTime]
    );
    return rows;
};
