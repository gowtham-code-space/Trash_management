import { logApiRequest } from "../logs/producer.js";

export const apiLogger = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const responseTime = Date.now() - start;

        logApiRequest({
            user_id: req.user?.user_id || null,
            role_id: req.user?.role_id || null,
            endpoint: req.originalUrl,
            http_method: req.method,
            status_code: res.statusCode,
            response_time_ms: responseTime,
            ip_address: req.ip,
            user_agent: req.headers["user-agent"],
            request_body: req.body,
            response_body: null,
            created_at: new Date()
        });
    });

    next();
};