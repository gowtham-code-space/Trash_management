import redis from "../../config/redis.js";
import pool from "../../config/db.js";

export const createWorker = ({ queueName, tableName, columns, batchSize = 100 }) => {
    const GROUP = 'db-writers';
    const CONSUMER = `${tableName}-consumer`;

    const formatRow = (log) =>
        columns.map(col => {
            const value = log[col];
            if (value === undefined || value === null) return null;
            if (typeof value === "object") return JSON.stringify(value);
            return value;
        });

    const buildInsertQuery = (rows) => {
        const placeholders = rows.map(() => `(${columns.map(() => "?").join(",")})`).join(",");
        return `INSERT INTO ${tableName} (${columns.join(",")}) VALUES ${placeholders}`;
    };

    const ensureGroup = async () => {
        try {
            await redis.xgroup('CREATE', queueName, GROUP, '$', 'MKSTREAM');
        } catch (err) {
            if (!err.message.includes('BUSYGROUP')) throw err;
        }
    };

    const start = async () => {
        await ensureGroup();
        console.log(`Worker started → ${tableName}`);

        while (true) {
            try {
                const results = await redis.xreadgroup(
                    'GROUP', GROUP, CONSUMER,
                    'COUNT', batchSize,
                    'BLOCK', 1000,
                    'STREAMS', queueName, '>'
                );

                if (!results || results.length === 0) continue;

                const messages = results[0][1];
                const logs = [];
                const ids = [];

                for (const [id, fields] of messages) {
                    ids.push(id);
                    logs.push(JSON.parse(fields[1]));
                }

                const rows = logs.map(formatRow);
                const query = buildInsertQuery(rows);

                await pool.query(query, rows.flat());
                await redis.xack(queueName, GROUP, ...ids);
                console.log(`${tableName}: inserted ${logs.length} rows`);

            } catch (err) {
                console.error(`Worker error (${tableName}):`, err);
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    };

    return { start };
};