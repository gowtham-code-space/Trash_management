import pool from '../../../config/db.js';

export const getQuizConfig = async () => {
    try {
        const query = `
            SELECT 
                score_time_id,
                total_time,
                total_score,
                pass_mark,
                total_questions
            FROM quiz_total_score_time
            WHERE score_time_id = 1
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

export const getRandomQuestions = async (limit) => {
    try {
        const parsedLimit = parseInt(limit, 10);
        
        const query = `
            SELECT question_id
            FROM question_db
            ORDER BY RAND()
            LIMIT ${parsedLimit}
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query);
        conn.release();
        
        return rows;
    } catch (error) {
        throw error;
    }
};

export const createQuiz = async (userId, scoreTimeId, finishesAt) => {
    try {
        const query = `
            INSERT INTO quiz_management 
            (user_id, score_time_id, created_at, finishes_at, has_completed, score, is_pass)
            VALUES (?, ?, UTC_TIMESTAMP(), ?, 0, 0, 0)
        `;
        
        const conn = await pool.getConnection();
        const [result] = await conn.execute(query, [userId, scoreTimeId, finishesAt]);
        conn.release();
        
        return result.insertId;
    } catch (error) {
        throw error;
    }
};

export const storeQuizQuestions = async (quizId, questionIds) => {
    try {
        const conn = await pool.getConnection();
        
        for (const questionId of questionIds) {
            const fetchQuery = `
                SELECT CAST(correct_option AS CHAR) as correct_option
                FROM question_db
                WHERE question_id = ?
            `;
            const [rows] = await conn.execute(fetchQuery, [questionId]);
            
            if (rows.length > 0) {
                const insertQuery = `
                    INSERT INTO quiz_history (quiz_id, question_id, correct_answer)
                    VALUES (?, ?, ?)
                `;
                await conn.execute(insertQuery, [quizId, questionId, rows[0].correct_option]);
            }
        }
        
        conn.release();
        return true;
    } catch (error) {
        throw error;
    }
};

export const updateUserAnswer = async (quizId, questionId, userAnswer) => {
    try {
        const query = `
            UPDATE quiz_history
            SET user_answer = ?
            WHERE quiz_id = ? AND question_id = ?
        `;
        
        const conn = await pool.getConnection();
        await conn.execute(query, [userAnswer, quizId, questionId]);
        conn.release();
        
        return true;
    } catch (error) {
        throw error;
    }
};

export const updateMarkStatus = async (quizId, questionId, isMarked) => {
    try {
        const query = `
            UPDATE quiz_history
            SET is_marked = ?
            WHERE quiz_id = ? AND question_id = ?
        `;
        
        const conn = await pool.getConnection();
        await conn.execute(query, [isMarked, quizId, questionId]);
        conn.release();
        
        return true;
    } catch (error) {
        throw error;
    }
};

export const getQuizHistoryAnswers = async (quizId) => {
    try {
        const query = `
            SELECT question_id, 
                    CAST(correct_answer AS CHAR) as correct_answer, 
                    CAST(user_answer AS CHAR) as user_answer
            FROM quiz_history
            WHERE quiz_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [quizId]);
        conn.release();
        
        return rows;
    } catch (error) {
        throw error;
    }
};

export const getQuiz = async (quizId, userId) => {
    try {
        const query = `
            SELECT 
                qm.quiz_id,
                qm.user_id,
                qm.score_time_id,
                qm.score,
                qm.is_pass,
                qm.certificate_url,
                qm.created_at,
                qm.finishes_at,
                qm.has_completed,
                qst.total_time,
                qst.total_score,
                qst.pass_mark,
                qst.total_questions
            FROM quiz_management qm
            JOIN quiz_total_score_time qst ON qm.score_time_id = qst.score_time_id
            WHERE qm.quiz_id = ? AND qm.user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [quizId, userId]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

export const getQuizQuestions = async (quizId) => {
    try {
        const query = `
            SELECT 
                qh.history_id,
                qh.question_id,
                CAST(qh.user_answer AS CHAR) as user_answer,
                qh.is_marked,
                qdb.question,
                qdb.option_a,
                qdb.option_b,
                qdb.option_c,
                qdb.option_d
            FROM quiz_history qh
            JOIN question_db qdb ON qh.question_id = qdb.question_id
            WHERE qh.quiz_id = ?
            ORDER BY qh.history_id
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [quizId]);
        conn.release();
        
        return rows;
    } catch (error) {
        throw error;
    }
};

export const getQuizReviewData = async (quizId) => {
    try {
        const query = `
            SELECT 
                qdb.question_id,
                qdb.question,
                qdb.option_a,
                qdb.option_b,
                qdb.option_c,
                qdb.option_d,
                CAST(qh.correct_answer AS CHAR) as correct_option,
                CAST(qh.user_answer AS CHAR) as user_answer
            FROM quiz_history qh
            JOIN question_db qdb ON qh.question_id = qdb.question_id
            WHERE qh.quiz_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [quizId]);
        conn.release();
        
        return rows;
    } catch (error) {
        throw error;
    }
};

export const updateQuizScore = async (quizId, score, isPass, certificateUrl = null) => {
    try {
        const query = `
            UPDATE quiz_management
            SET score = ?,
                is_pass = ?,
                certificate_url = ?,
                has_completed = 1,
                completed_at = UTC_TIMESTAMP()
            WHERE quiz_id = ?
        `;
        
        const conn = await pool.getConnection();
        await conn.execute(query, [score, isPass, certificateUrl, quizId]);
        conn.release();
        
        return true;
    } catch (error) {
        throw error;
    }
};
export const getQuizStats = async (userId) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_attempts,
                SUM(CASE WHEN has_completed = 1 THEN 1 ELSE 0 END) as completed_attempts,
                SUM(CASE WHEN is_pass = 1 THEN 1 ELSE 0 END) as passed_attempts,
                MAX(score) as best_score,
                AVG(CASE WHEN has_completed = 1 THEN score ELSE NULL END) as average_score
            FROM quiz_management
            WHERE user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [userId]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

export const getQuizHistory = async (userId, limit, offset) => {
    try {
        const parsedLimit = parseInt(limit, 10);
        const parsedOffset = parseInt(offset, 10);
        
        const query = `
            SELECT 
                qm.quiz_id,
                qm.score,
                qm.is_pass,
                qm.certificate_url,
                qm.created_at,
                qm.completed_at,
                qm.finishes_at,
                qm.has_completed,
                qst.total_score,
                qst.pass_mark,
                qst.total_questions
            FROM quiz_management qm
            JOIN quiz_total_score_time qst ON qm.score_time_id = qst.score_time_id
            WHERE qm.user_id = ?
            ORDER BY qm.created_at DESC
            LIMIT ${parsedLimit} OFFSET ${parsedOffset}
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [userId]);
        conn.release();
        
        return rows;
    } catch (error) {
        throw error;
    }
};

export const getQuizHistoryCount = async (userId) => {
    try {
        const query = `
            SELECT COUNT(*) as total
            FROM quiz_management
            WHERE user_id = ?
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [userId]);
        conn.release();
        
        return rows[0].total;
    } catch (error) {
        throw error;
    }
};

export const getIncompleteQuiz = async (userId) => {
    try {
        const query = `
            SELECT 
                qm.quiz_id,
                qm.created_at,
                qm.finishes_at,
                qst.total_time,
                qst.total_questions
            FROM quiz_management qm
            JOIN quiz_total_score_time qst ON qm.score_time_id = qst.score_time_id
            WHERE qm.user_id = ? AND qm.has_completed = 0
            ORDER BY qm.created_at DESC
            LIMIT 1
        `;
        
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(query, [userId]);
        conn.release();
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};
