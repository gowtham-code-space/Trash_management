import redis from "../config/redis.js";
import dotenv from 'dotenv';

dotenv.config();

const API_QUEUE = process.env.API_QUEUE;
const AUDIT_QUEUE = process.env.AUDIT_QUEUE;
const EVENT_QUEUE = process.env.EVENT_QUEUE;

const push = async (stream, payload) => {
    await redis.xadd(stream, '*', 'data', JSON.stringify(payload));
};

export const logApiRequest = (data) => push(API_QUEUE, data);
export const logAudit = (data) => push(AUDIT_QUEUE, data);
export const logEvent = (data) => push(EVENT_QUEUE, data);