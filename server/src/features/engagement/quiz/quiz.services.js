import * as quizModel from './quiz.model.js';
import { getUserById } from '../../../auth/auth.model.js';
import { generateQuizCertificate, convertCertificateToPDF } from '../../../utils/certificateService.js';
import { uploadCertificate } from '../../../utils/publicUrlService.js';

// Helper function to convert MySQL datetime to ISO 8601 format (UTC)
const toISOString = (mysqlDatetime) => {
    if (!mysqlDatetime) return null;
    // MySQL datetime is stored as UTC, append 'Z' to indicate UTC timezone
    return new Date(mysqlDatetime + ' UTC').toISOString();
};

export const startQuizService = async (userId) => {
    try {
        const incompleteQuiz = await quizModel.getIncompleteQuiz(userId);
        if (incompleteQuiz) {
            return {
                success: false,
                hasIncomplete: true,
                incompleteQuizId: incompleteQuiz.quiz_id,
                message: 'You have an incomplete quiz. Please complete or resume it first.'
            };
        }

        const quizConfig = await quizModel.getQuizConfig();
        if (!quizConfig) {
            throw new Error('Quiz configuration not found');
        }

        const timeParts = quizConfig.total_time.split(':');
        const hours = parseInt(timeParts[0] || 0);
        const minutes = parseInt(timeParts[1] || 0);
        const seconds = parseInt(timeParts[2] || 0);
        const totalTimeInMilliseconds = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
        
        const finishesAt = new Date(Date.now() + totalTimeInMilliseconds).toISOString().slice(0, 19).replace('T', ' ');
        const quizId = await quizModel.createQuiz(userId, quizConfig.score_time_id, finishesAt);
        const randomQuestions = await quizModel.getRandomQuestions(quizConfig.total_questions);
        const questionIds = randomQuestions.map(q => q.question_id);
        await quizModel.storeQuizQuestions(quizId, questionIds);
        const questions = await quizModel.getQuizQuestions(quizId);

        return {
            success: true,
            quiz: {
                quiz_id: quizId,
                total_questions: quizConfig.total_questions,
                total_time: quizConfig.total_time,
                total_score: quizConfig.total_score,
                pass_mark: quizConfig.pass_mark,
                finishes_at: new Date(finishesAt + ' UTC').toISOString(),
                questions: questions
            }
        };
    } catch (error) {
        throw error;
    }
};

export const resumeQuizService = async (quizId, userId) => {
    try {
        const quiz = await quizModel.getQuiz(quizId, userId);
        
        if (!quiz) {
            return {
                success: false,
                message: 'Quiz not found'
            };
        }

        if (quiz.has_completed) {
            return {
                success: false,
                message: 'Quiz already completed'
            };
        }
        const now = new Date();
        const finishesAt = new Date(quiz.finishes_at + ' UTC');
        
        if (now > finishesAt) {
            const quizHistory = await quizModel.getQuizHistoryAnswers(quizId);
            let score = 0;
            const totalQuestions = quizHistory.length;
            const scorePerQuestion = quiz.total_score / totalQuestions;

            quizHistory.forEach(qa => {
                if (qa.user_answer && qa.user_answer === qa.correct_answer) {
                    score += scorePerQuestion;
                }
            });

            score = Math.round(score);
            const isPass = score >= quiz.pass_mark ? 1 : 0;
            
            let certificateUrl = null;
            if (isPass) {
                try {
                    const user = await getUserById(userId);
                    const userName = `${user.first_name} ${user.last_name}`;
                    const certId = `QZ-${quizId}-${Date.now()}`;
                    const certBuffer = generateQuizCertificate(userName, score, quiz.total_score, new Date().toISOString(), { cert_id: certId });
                    certificateUrl = await uploadCertificate(certBuffer, certId, userId);
                } catch (certError) {
                    console.error('Certificate generation failed:', certError);
                }
            }
            
            await quizModel.updateQuizScore(quizId, score, isPass, certificateUrl);

            return {
                success: false,
                timeExpired: true,
                autoSubmitted: true,
                result: {
                    quiz_id: quizId,
                    score: score,
                    total_score: quiz.total_score,
                    pass_mark: quiz.pass_mark,
                    is_pass: isPass,
                    percentage: ((score / quiz.total_score) * 100).toFixed(2),
                    certificate_url: certificateUrl
                },
                message: 'Quiz time expired and has been automatically submitted'
            };
        }
        const questions = await quizModel.getQuizQuestions(quizId);

        return {
            success: true,
            data: {
                quiz_id: quiz.quiz_id,
                total_questions: quiz.total_questions,
                total_time: quiz.total_time,
                total_score: quiz.total_score,
                pass_mark: quiz.pass_mark,
                created_at: toISOString(quiz.created_at),
                finishes_at: finishesAt.toISOString(),
                time_remaining: Math.max(0, Math.floor((finishesAt - now) / 1000)),
                questions: questions
            }
        };
    } catch (error) {
        throw error;
    }
};

export const saveAnswerService = async (quizId, userId, questionId, userAnswer) => {
    try {
        const quiz = await quizModel.getQuiz(quizId, userId);
        
        if (!quiz) {
            return { success: false, message: 'Quiz not found' };
        }

        if (quiz.has_completed) {
            return { success: false, message: 'Quiz already completed' };
        }

        await quizModel.updateUserAnswer(quizId, questionId, userAnswer);

        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const markQuestionService = async (quizId, userId, questionId, isMarked) => {
    try {
        const quiz = await quizModel.getQuiz(quizId, userId);
        
        if (!quiz) {
            return { success: false, message: 'Quiz not found' };
        }

        if (quiz.has_completed) {
            return { success: false, message: 'Quiz already completed' };
        }

        await quizModel.updateMarkStatus(quizId, questionId, isMarked);

        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const submitQuizService = async (quizId, userId) => {
    try {
        const quiz = await quizModel.getQuiz(quizId, userId);
        
        if (!quiz) {
            return {
                success: false,
                message: 'Quiz not found'
            };
        }

        if (quiz.has_completed) {
            return {
                success: false,
                message: 'Quiz already completed'
            };
        }

        const quizHistory = await quizModel.getQuizHistoryAnswers(quizId);
        let score = 0;
        const totalQuestions = quizHistory.length;
        const scorePerQuestion = quiz.total_score / totalQuestions;

        quizHistory.forEach(qa => {
            if (qa.user_answer && qa.user_answer === qa.correct_answer) {
                score += scorePerQuestion;
            }
        });

        score = Math.round(score);
        const isPass = score >= quiz.pass_mark ? 1 : 0;
        
        let certificateUrl = null;
        if (isPass) {
            try {
                const user = await getUserById(userId);
                const userName = `${user.first_name} ${user.last_name}`;
                const certId = `QZ-${quizId}-${Date.now()}`;
                const certBuffer = generateQuizCertificate(userName, score, quiz.total_score, new Date().toISOString(), { cert_id: certId });
                certificateUrl = await uploadCertificate(certBuffer, certId, userId);
            } catch (certError) {
                console.error('Certificate generation failed:', certError);
            }
        }
        
        await quizModel.updateQuizScore(quizId, score, isPass, certificateUrl);

        return {
            success: true,
            result: {
                quiz_id: quizId,
                score: score,
                total_score: quiz.total_score,
                pass_mark: quiz.pass_mark,
                is_pass: isPass,
                percentage: ((score / quiz.total_score) * 100).toFixed(2),
                certificate_url: certificateUrl
            }
        };
    } catch (error) {
        throw error;
    }
};
export const getQuizStatsService = async (userId) => {
    try {
        const stats = await quizModel.getQuizStats(userId);
        
        if (!stats) {
            return {
                success: true,
                stats: {
                    total_attempts: 0,
                    completed_attempts: 0,
                    passed_attempts: 0,
                    failed_attempts: 0,
                    best_score: 0,
                    average_score: 0
                }
            };
        }

        return {
            success: true,
            stats: {
                total_attempts: stats.total_attempts || 0,
                completed_attempts: stats.completed_attempts || 0,
                passed_attempts: stats.passed_attempts || 0,
                failed_attempts: (stats.completed_attempts || 0) - (stats.passed_attempts || 0),
                best_score: stats.best_score || 0,
                average_score: stats.average_score ? parseFloat(stats.average_score).toFixed(2) : 0
            }
        };
    } catch (error) {
        throw error;
    }
};

export const getQuizHistoryService = async (userId, page = 1, limit = 10, dateFilter = null, startDate = null, endDate = null) => {
    try {
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        const offset = (parsedPage - 1) * parsedLimit;
        
        const history = await quizModel.getQuizHistory(userId, parsedLimit, offset, dateFilter, startDate, endDate);
        const totalCount = await quizModel.getQuizHistoryCount(userId, dateFilter, startDate, endDate);
        
        const formattedHistory = history.map(quiz => ({
            ...quiz,
            created_at: toISOString(quiz.created_at),
            completed_at: toISOString(quiz.completed_at),
            finishes_at: toISOString(quiz.finishes_at)
        }));
        
        return {
            success: true,
            history: formattedHistory,
            pagination: {
                current_page: parsedPage,
                per_page: parsedLimit,
                total_items: totalCount,
                total_pages: Math.ceil(totalCount / parsedLimit)
            }
        };
    } catch (error) {
        throw error;
    }
};

export const getQuizReviewService = async (quizId, userId) => {
    try {
        const quiz = await quizModel.getQuiz(quizId, userId);
        
        if (!quiz) {
            return {
                success: false,
                message: 'Quiz not found'
            };
        }

        if (!quiz.has_completed) {
            return {
                success: false,
                message: 'Quiz not completed yet'
            };
        }

        const questionsWithAnswers = await quizModel.getQuizReviewData(quizId);

        return {
            success: true,
            data: {
                quiz_id: quiz.quiz_id,
                score: quiz.score,
                total_score: quiz.total_score,
                pass_mark: quiz.pass_mark,
                is_pass: quiz.is_pass,
                percentage: ((quiz.score / quiz.total_score) * 100).toFixed(2),
                questions: questionsWithAnswers
            }
        };
    } catch (error) {
        throw error;
    }
};

export const getCertificatePDFService = async (quizId, userId) => {
    try {
        const quiz = await quizModel.getQuiz(quizId, userId);
        
        if (!quiz) {
            return { success: false, message: 'Quiz not found' };
        }

        if (!quiz.has_completed) {
            return { success: false, message: 'Quiz not completed yet' };
        }

        if (!quiz.is_pass) {
            return { success: false, message: 'Certificate only available for passed quizzes' };
        }

        const user = await getUserById(userId);
        const userName = `${user.first_name} ${user.last_name}`;
        const certId = `QZ-${quizId}-${Date.now()}`;
        
        const certImageBuffer = generateQuizCertificate(userName, quiz.score, quiz.total_score, new Date().toISOString(), { cert_id: certId });
        const pdfBuffer = await convertCertificateToPDF(certImageBuffer);

        return { success: true, pdfBuffer };
    } catch (error) {
        throw error;
    }
};
