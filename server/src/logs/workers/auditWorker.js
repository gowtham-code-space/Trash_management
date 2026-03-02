import { createWorker } from "./baseWorker.js";
import dotenv from 'dotenv';
dotenv.config()

const AUDIT_QUEUE = process.env.AUDIT_QUEUE;

export default createWorker({
    queueName: AUDIT_QUEUE,
    tableName: "audit_logs",
    columns: [
        "entity_type",
        "entity_id",
        "action_type",
        "old_value",
        "new_value",
        "performed_by",
        "performed_role_id",
        "ip_address",
        "user_agent",
        "remarks",
        "created_at"
    ],
    batchSize: 100
});