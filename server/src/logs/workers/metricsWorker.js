import redis from "../../config/redis.js";
import pool from "../../config/db.js";
import dotenv from 'dotenv';

dotenv.config();

const STREAM = process.env.API_QUEUE;
const GROUP = 'metrics-writers';
const CONSUMER = 'metrics-consumer';

const ensureGroup = async () => {
    try {
        await redis.xgroup('CREATE', STREAM, GROUP, '$', 'MKSTREAM');
    } catch (err) {
        if (!err.message.includes('BUSYGROUP')) throw err;
    }
};

const toBucketTime = (createdAt) => {
    const ms = createdAt ? new Date(createdAt).getTime() : Date.now();
    return new Date(Math.floor(ms / 60000) * 60000);
};

const resolveTypes = (statusCode) => {
    const types = ['API_TRAFFIC'];
    if (statusCode >= 400 && statusCode < 500) types.push('HTTP_4XX');
    if (statusCode >= 500) types.push('HTTP_5XX');
    return types;
};

const processBatch = async (messages) => {
    const ids = [];
    const agg = new Map();

    for (const [id, fields] of messages) {
        ids.push(id);
        const log = JSON.parse(fields[1]);
        const bucket = toBucketTime(log.created_at);
        for (const type of resolveTypes(log.status_code)) {
            const key = `${bucket.toISOString()}||${type}`;
            agg.set(key, (agg.get(key) || 0) + 1);
        }
    }

    if (agg.size > 0) {
        const values = [...agg.entries()].map(([key, count]) => {
            const [bucketIso, metricType] = key.split('||');
            return [1, new Date(bucketIso), metricType, count];
        });
        await pool.query(
            `INSERT INTO metrics_minute (tenant_id, bucket_time, metric_type, count)
            VALUES ?
            ON DUPLICATE KEY UPDATE count = count + VALUES(count)`,
            [values]
        );
    }

    await redis.xack(STREAM, GROUP, ...ids);
};

const start = async () => {
    await ensureGroup();
    console.log('Worker started → metrics_minute');

    // Drain any pending (previously unacked) messages first
    let pending;
    do {
        pending = await redis.xreadgroup('GROUP', GROUP, CONSUMER, 'COUNT', 500, 'STREAMS', STREAM, '0');
        if (pending?.[0]?.[1]?.length) {
            console.log(`metricsWorker: draining ${pending[0][1].length} pending messages`);
            await processBatch(pending[0][1]);
        }
    } while (pending?.[0]?.[1]?.length > 0);

    // Live read
    while (true) {
        try {
            const results = await redis.xreadgroup(
                'GROUP', GROUP, CONSUMER,
                'COUNT', 500,
                'BLOCK', 1000,
                'STREAMS', STREAM, '>'
            );
            if (!results || results.length === 0) continue;
            await processBatch(results[0][1]);
        } catch (err) {
            console.error('Worker error (metrics_minute):', err);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
};

export default { start };
