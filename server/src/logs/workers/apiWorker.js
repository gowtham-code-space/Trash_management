import { createWorker } from "./baseWorker.js";
import dotenv from 'dotenv';

dotenv.config();
const API_QUEUE = process.env.API_QUEUE;

export default createWorker({
    queueName: API_QUEUE,
    tableName: "api_request_logs",
    columns: [
        "user_id",
        "role_id",
        "endpoint",
        "http_method",
        "status_code",
        "response_time_ms",
        "ip_address",
        "user_agent",
        "request_body",
        "response_body",
        "created_at"
    ],
    batchSize: 200
});