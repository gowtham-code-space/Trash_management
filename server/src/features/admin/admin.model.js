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

const buildApiWhere = ({ search, method, status, userId, start, end }) => {
    const p = [];
    let w = 'WHERE 1=1';
    if (search) { w += ' AND (endpoint LIKE ? OR ip_address LIKE ?)'; p.push(`%${search}%`, `%${search}%`); }
    if (method) { w += ' AND http_method = ?'; p.push(method); }
    if (status === '2xx') w += ' AND status_code BETWEEN 200 AND 299';
    else if (status === '4xx') w += ' AND status_code BETWEEN 400 AND 499';
    else if (status === '5xx') w += ' AND status_code >= 500';
    if (userId) { w += ' AND user_id = ?'; p.push(userId); }
    if (start) { w += ' AND created_at >= ?'; p.push(new Date(start)); }
    if (end) { w += ' AND created_at <= ?'; p.push(new Date(end)); }
    return { w, p };
};

export const getApiLogs = async (filters, limit, offset) => {
    const { w, p } = buildApiWhere(filters);
    const [rows] = await pool.query(
        `SELECT api_log_id, user_id, role_id, endpoint, http_method, status_code, response_time_ms, ip_address, user_agent, created_at FROM api_request_logs ${w} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...p, Number(limit), Number(offset)]
    );
    return rows;
};

export const getApiLogsCount = async (filters) => {
    const { w, p } = buildApiWhere(filters);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM api_request_logs ${w}`, p);
    return Number(total);
};

const buildAuditWhere = ({ search, action, entityType, performedBy, start, end }) => {
    const p = [];
    let w = 'WHERE 1=1';
    if (search) { w += ' AND (entity_type LIKE ? OR remarks LIKE ?)'; p.push(`%${search}%`, `%${search}%`); }
    if (action) { w += ' AND action_type = ?'; p.push(action); }
    if (entityType) { w += ' AND entity_type = ?'; p.push(entityType); }
    if (performedBy) { w += ' AND performed_by = ?'; p.push(performedBy); }
    if (start) { w += ' AND created_at >= ?'; p.push(new Date(start)); }
    if (end) { w += ' AND created_at <= ?'; p.push(new Date(end)); }
    return { w, p };
};

export const getAuditLogs = async (filters, limit, offset) => {
    const { w, p } = buildAuditWhere(filters);
    const [rows] = await pool.query(
        `SELECT audit_log_id, entity_type, entity_id, action_type, old_value, new_value, performed_by, performed_role_id, ip_address, remarks, created_at FROM audit_logs ${w} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...p, Number(limit), Number(offset)]
    );
    return rows;
};

export const getAuditLogsCount = async (filters) => {
    const { w, p } = buildAuditWhere(filters);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM audit_logs ${w}`, p);
    return Number(total);
};

const buildEventWhere = ({ search, eventType, entityType, severity, start, end }) => {
    const p = [];
    let w = 'WHERE 1=1';
    if (search) { w += ' AND (event_type LIKE ? OR entity_type LIKE ?)'; p.push(`%${search}%`, `%${search}%`); }
    if (eventType) { w += ' AND event_type = ?'; p.push(eventType); }
    if (entityType) { w += ' AND entity_type = ?'; p.push(entityType); }
    if (severity) { w += ' AND severity = ?'; p.push(severity); }
    if (start) { w += ' AND created_at >= ?'; p.push(new Date(start)); }
    if (end) { w += ' AND created_at <= ?'; p.push(new Date(end)); }
    return { w, p };
};

export const getEventLogs = async (filters, limit, offset) => {
    const { w, p } = buildEventWhere(filters);
    const [rows] = await pool.query(
        `SELECT event_log_id, event_type, entity_type, entity_id, user_id, severity, metadata, created_at FROM event_logs ${w} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...p, Number(limit), Number(offset)]
    );
    return rows;
};

export const getEventLogsCount = async (filters) => {
    const { w, p } = buildEventWhere(filters);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM event_logs ${w}`, p);
    return Number(total);
};

export const getApiDistinct = async () => {
    const [[methods], [users]] = await Promise.all([
        pool.query('SELECT DISTINCT http_method FROM api_request_logs WHERE http_method IS NOT NULL ORDER BY http_method'),
        pool.query('SELECT DISTINCT user_id FROM api_request_logs WHERE user_id IS NOT NULL ORDER BY user_id LIMIT 200'),
    ]);
    return { http_method: methods.map(r => r.http_method), user_id: users.map(r => String(r.user_id)) };
};

export const getAuditDistinct = async () => {
    const [[actions], [entityTypes], [performers]] = await Promise.all([
        pool.query('SELECT DISTINCT action_type FROM audit_logs WHERE action_type IS NOT NULL ORDER BY action_type'),
        pool.query('SELECT DISTINCT entity_type FROM audit_logs WHERE entity_type IS NOT NULL ORDER BY entity_type'),
        pool.query('SELECT DISTINCT performed_by FROM audit_logs WHERE performed_by IS NOT NULL ORDER BY performed_by LIMIT 200'),
    ]);
    return {
        action_type: actions.map(r => r.action_type),
        entity_type: entityTypes.map(r => r.entity_type),
        performed_by: performers.map(r => String(r.performed_by)),
    };
};

export const getEventDistinct = async () => {
    const [[eventTypes], [entityTypes]] = await Promise.all([
        pool.query('SELECT DISTINCT event_type FROM event_logs WHERE event_type IS NOT NULL ORDER BY event_type'),
        pool.query('SELECT DISTINCT entity_type FROM event_logs WHERE entity_type IS NOT NULL ORDER BY entity_type'),
    ]);
    return { event_type: eventTypes.map(r => r.event_type), entity_type: entityTypes.map(r => r.entity_type) };
};

export const exportApiLogs = async (filters) => {
    const { w, p } = buildApiWhere(filters);
    const [rows] = await pool.query(
        `SELECT api_log_id, user_id, role_id, endpoint, http_method, status_code, response_time_ms, ip_address, created_at FROM api_request_logs ${w} ORDER BY created_at DESC`,
        p
    );
    return rows;
};

export const exportAuditLogs = async (filters) => {
    const { w, p } = buildAuditWhere(filters);
    const [rows] = await pool.query(
        `SELECT audit_log_id, entity_type, entity_id, action_type, performed_by, performed_role_id, ip_address, remarks, created_at FROM audit_logs ${w} ORDER BY created_at DESC`,
        p
    );
    return rows;
};

export const exportEventLogs = async (filters) => {
    const { w, p } = buildEventWhere(filters);
    const [rows] = await pool.query(
        `SELECT event_log_id, event_type, entity_type, entity_id, user_id, severity, created_at FROM event_logs ${w} ORDER BY created_at DESC`,
        p
    );
    return rows;
};

export const getAllQuizConfigs = async () => {
    const [rows] = await pool.query('SELECT * FROM quiz_total_score_time WHERE is_deleted = 0 ORDER BY score_time_id ASC');
    return rows;
};

export const getDeletedQuizConfigs = async () => {
    const [rows] = await pool.query('SELECT * FROM quiz_total_score_time WHERE is_deleted = 1 ORDER BY score_time_id ASC');
    return rows;
};

export const createQuizConfig = async ({ total_time, total_score, pass_mark, total_questions, correct_mark, wrong_mark }) => {
    const [result] = await pool.query(
        'INSERT INTO quiz_total_score_time (total_time, total_score, pass_mark, total_questions, correct_mark, wrong_mark, is_active) VALUES (?, ?, ?, ?, ?, ?, 0)',
        [total_time, total_score, pass_mark, total_questions, correct_mark, wrong_mark]
    );
    return result.insertId;
};

export const updateQuizConfig = async (id, { total_time, total_score, pass_mark, total_questions, correct_mark, wrong_mark }) => {
    const [result] = await pool.query(
        'UPDATE quiz_total_score_time SET total_time=?, total_score=?, pass_mark=?, total_questions=?, correct_mark=?, wrong_mark=? WHERE score_time_id=?',
        [total_time, total_score, pass_mark, total_questions, correct_mark, wrong_mark, id]
    );
    return result.affectedRows;
};

export const deleteQuizConfig = async (id) => {
    const [result] = await pool.query('UPDATE quiz_total_score_time SET is_deleted = 1 WHERE score_time_id = ?', [id]);
    return result.affectedRows;
};

export const restoreQuizConfig = async (id) => {
    const [result] = await pool.query('UPDATE quiz_total_score_time SET is_deleted = 0 WHERE score_time_id = ?', [id]);
    return result.affectedRows;
};

export const setActiveQuizConfig = async (id) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('UPDATE quiz_total_score_time SET is_active = 0');
        await conn.query('UPDATE quiz_total_score_time SET is_active = 1 WHERE score_time_id = ?', [id]);
        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

export const getQuestions = async ({ search, limit, offset }) => {
    const p = [];
    let w = 'WHERE 1=1';
    if (search) { w += ' AND question LIKE ?'; p.push(`%${search}%`); }
    const [rows] = await pool.query(
        `SELECT question_id, question, option_a, option_b, option_c, option_d, correct_option FROM question_db ${w} ORDER BY question_id DESC LIMIT ? OFFSET ?`,
        [...p, Number(limit), Number(offset)]
    );
    return rows;
};

export const getQuestionsCount = async ({ search }) => {
    const p = [];
    let w = 'WHERE 1=1';
    if (search) { w += ' AND question LIKE ?'; p.push(`%${search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM question_db ${w}`, p);
    return Number(total);
};

export const createQuestion = async ({ question, option_a, option_b, option_c, option_d, correct_option }) => {
    const [result] = await pool.query(
        'INSERT INTO question_db (question, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?)',
        [question, option_a, option_b, option_c, option_d, correct_option]
    );
    return result.insertId;
};

export const updateQuestion = async (id, data) => {
    const { question, option_a, option_b, option_c, option_d, correct_option } = data;
    const [result] = await pool.query(
        'UPDATE question_db SET question=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=? WHERE question_id=?',
        [question, option_a, option_b, option_c, option_d, correct_option, id]
    );
    return result.affectedRows;
};

export const deleteQuestion = async (id) => {
    const [result] = await pool.query('DELETE FROM question_db WHERE question_id=?', [id]);
    return result.affectedRows;
};

export const bulkCreateQuestions = async (questions) => {
    if (!questions.length) return 0;
    const values = questions.map(q => [q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option]);
    const [result] = await pool.query(
        'INSERT INTO question_db (question, option_a, option_b, option_c, option_d, correct_option) VALUES ?',
        [values]
    );
    return result.affectedRows;
};

export const getDashboardKpis = async () => {
    const [
        [totalToday],
        [totalYesterday],
        [errors4xx],
        [errors5xx],
        [avgResp],
        [newUsersMonth],
        [newUsersLastMonth],
        [failedLogins],
        [activeUsers],
    ] = await Promise.all([
        pool.query('SELECT COUNT(*) AS count FROM api_request_logs WHERE created_at >= CURDATE()'),
        pool.query('SELECT COUNT(*) AS count FROM api_request_logs WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND created_at < CURDATE()'),
        pool.query('SELECT COUNT(*) AS count FROM api_request_logs WHERE status_code BETWEEN 400 AND 499 AND created_at >= CURDATE()'),
        pool.query('SELECT COUNT(*) AS count FROM api_request_logs WHERE status_code >= 500 AND created_at >= CURDATE()'),
        pool.query('SELECT ROUND(AVG(response_time_ms)) AS avg FROM api_request_logs WHERE created_at >= CURDATE()'),
        pool.query("SELECT COUNT(*) AS count FROM users WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')"),
        pool.query("SELECT COUNT(*) AS count FROM users WHERE created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')"),
        pool.query("SELECT COUNT(*) AS count FROM event_logs WHERE event_type = 'LOGIN_FAILED' AND created_at >= CURDATE()"),
        pool.query('SELECT COUNT(DISTINCT user_id) AS count FROM api_request_logs WHERE user_id IS NOT NULL AND created_at >= CURDATE()'),
    ]);

    const now = new Date();
    const minutesElapsed = now.getUTCHours() * 60 + now.getUTCMinutes() || 1;

    return {
        apiRequestsToday: Number(totalToday[0].count),
        apiRequestsYesterday: Number(totalYesterday[0].count),
        errors4xx: Number(errors4xx[0].count),
        errors5xx: Number(errors5xx[0].count),
        avgResponseMs: Number(avgResp[0].avg) || 0,
        newUsersThisMonth: Number(newUsersMonth[0].count),
        newUsersLastMonth: Number(newUsersLastMonth[0].count),
        failedLoginsToday: Number(failedLogins[0].count),
        activeUsersToday: Number(activeUsers[0].count),
        minutesElapsedToday: minutesElapsed,
    };
};

export const getQuizKpis = async () => {
    const [
        [attemptsRows],
        [passRows],
        [avgRows],
        [activeRows],
    ] = await Promise.all([
        pool.query('SELECT COUNT(*) AS totalAttempts FROM quiz_management WHERE has_completed = 1'),
        pool.query('SELECT SUM(is_pass) AS passed, COUNT(*) AS total FROM quiz_management WHERE has_completed = 1'),
        pool.query('SELECT AVG(TIMESTAMPDIFF(SECOND, created_at, completed_at)) AS avgSeconds FROM quiz_management WHERE has_completed = 1 AND completed_at IS NOT NULL'),
        pool.query('SELECT COUNT(*) AS activeSessions FROM quiz_management WHERE has_completed = 0'),
    ]);

    const totalAttempts = Number(attemptsRows[0].totalAttempts);
    const passed = Number(passRows[0].passed) || 0;
    const total = Number(passRows[0].total) || 0;
    const avgSeconds = passRows[0] && avgRows[0].avgSeconds != null ? Number(avgRows[0].avgSeconds) : null;
    const activeSessions = Number(activeRows[0].activeSessions);

    const passRate = total > 0 ? `${Math.round((passed / total) * 100)}%` : '—';

    let avgCompletion = '—';
    if (avgSeconds !== null) {
        const m = Math.floor(avgSeconds / 60);
        const s = Math.round(avgSeconds % 60);
        avgCompletion = m > 0 ? `${m}m ${s}s` : `${s}s`;
    }

    return { totalAttempts, passRate, avgCompletion, activeSessions };
};
