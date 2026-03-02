import { createWorker } from "./baseWorker.js";
import dotenv from 'dotenv';
dotenv.config();

const EVENT_QUEUE = process.env.EVENT_QUEUE;
export default createWorker({
    queueName: EVENT_QUEUE,
    tableName: "event_logs",
    columns: [
        "event_type",
        "entity_type",
        "entity_id",
        "user_id",
        "severity",
        "metadata",
        "created_at"
    ],
    batchSize: 100
});