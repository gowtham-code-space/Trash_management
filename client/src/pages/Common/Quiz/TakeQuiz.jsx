import React, { useState, useEffect } from "react";
import ThemeStore from "../../../store/ThemeStore";
import QuizResultModal from "../../../components/Modals/Quiz/QuizResultModal";
import ConfirmModal from "../../../components/Modals/Quiz/ConfirmModal";
import { RightArrow, LeftArrow } from "../../../assets/icons/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { resumeQuiz, submitQuiz, saveAnswer, markQuestion } from "../../../services/features/quizService";
import ToastNotification from "../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";

function TakeQuiz() {
    const { isDarkTheme } = ThemeStore();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [quizData, setQuizData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState(new Set());
    const [showResultModal, setShowResultModal] = useState(false);
    const [showPaletteMobile, setShowPaletteMobile] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Load quiz data
    useEffect(() => {
        const loadQuiz = async () => {
            try {
                setIsLoading(true);
                const { quizData: passedQuizData, resumeQuizId } = location.state || {};

                if (passedQuizData) {
                    // New quiz started
                    setQuizData(passedQuizData);
                    const finishTime = new Date(passedQuizData.finishes_at).getTime();
                    const now = new Date().getTime();
                    setTimeRemaining(Math.max(0, Math.floor((finishTime - now) / 1000)));
                } else if (resumeQuizId) {
                    const response = await resumeQuiz(resumeQuizId);
                    if (response.success && response.data) {
                        setQuizData(response.data);
                        setTimeRemaining(response.data?.time_remaining || 0);
                        
                        const savedAnswers = {};
                        const markedQuestions = new Set();
                        
                        (response.data?.questions || []).forEach((q, index) => {
                            if (q.user_answer) {
                                savedAnswers[q.question_id] = q.user_answer;
                            }
                            if (q.is_marked === 1) {
                                markedQuestions.add(index);
                            }
                        });
                        
                        setAnswers(savedAnswers);
                        setMarkedForReview(markedQuestions);
                        
                        ToastNotification('Quiz resumed successfully', 'success');
                    } else if (response.autoSubmitted && response.result) {
                        ToastNotification('Quiz was expired and has been auto-submitted', 'info');
                        setQuizResult(response.result);
                        setShowResultModal(true);
                        setIsLoading(false);
                        return;
                    } else {
                        ToastNotification(response.message || 'Failed to resume quiz', 'error');
                        navigate('/quiz');
                        return;
                    }
                } else {
                    // No quiz data provided
                    ToastNotification('No quiz data found', 'error');
                    navigate('/quiz');
                    return;
                }
            } catch (error) {
                console.error('Error loading quiz:', error);
                ToastNotification('Failed to load quiz', 'error');
                navigate('/quiz');
            } finally {
                setIsLoading(false);
            }
        };

        loadQuiz();
    }, [location.state, navigate]);

    // Timer countdown
    useEffect(() => {
        if (!quizData || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    ToastNotification('Time expired! Submitting quiz...', 'warning');
                    submitQuiz(quizData.quiz_id).then(response => {
                        if (response.success) {
                            setQuizResult(response.data);
                            setShowResultModal(true);
                        } else {
                            ToastNotification(response.message || 'Failed to submit quiz', 'error');
                        }
                    }).catch(error => {
                        console.error('Error auto-submitting quiz:', error);
                        ToastNotification('Failed to submit quiz', 'error');
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizData]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading || !quizData) {
        return (
            <div className={`min-h-screen ${isDarkTheme ? "bg-darkBackground" : "bg-background"} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className={isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}>Loading quiz...</p>
                </div>
            </div>
        );
    }

    const quizQuestions = quizData.questions || [];
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const totalQuestions = quizQuestions.length;

    function handleAnswerSelect(optionId) {
        setAnswers(function(prev) {
            return {
                ...prev,
                [currentQuestion.question_id]: optionId
            };
        });
    }

    async function handleMarkForReview() {
        try {
            const isCurrentlyMarked = markedForReview.has(currentQuestionIndex);
            const newMarkStatus = !isCurrentlyMarked;
            
            await markQuestion(quizData.quiz_id, currentQuestion.question_id, newMarkStatus ? 1 : 0);
            
            setMarkedForReview(function(prev) {
                const newSet = new Set(prev);
                if (newSet.has(currentQuestionIndex)) {
                    newSet.delete(currentQuestionIndex);
                } else {
                    newSet.add(currentQuestionIndex);
                }
                return newSet;
            });
        } catch (error) {
            console.error('Error marking question:', error);
            ToastNotification('Failed to mark question for review', 'error');
        }
    }

    function goToQuestion(index) {
        setCurrentQuestionIndex(index);
        setShowPaletteMobile(false);
    }

    async function handleNext() {
        if (currentQuestionIndex < totalQuestions - 1 && !isNavigating) {
            setIsNavigating(true);
            try {
                const currentAnswer = answers[currentQuestion.question_id];
                if (currentAnswer) {
                    await saveAnswer(quizData.quiz_id, currentQuestion.question_id, currentAnswer);
                }
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } catch (error) {
                console.error('Error saving answer:', error);
            } finally {
                setIsNavigating(false);
            }
        }
    }

    function handlePrevious() {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    }

    function handleClearResponse() {
        setAnswers(function(prev) {
            const newAnswers = { ...prev };
            delete newAnswers[currentQuestion.question_id];
            return newAnswers;
        });
    }

    async function handleSubmit(autoSubmit = false) {
        if (!autoSubmit) {
            setShowConfirmModal(true);
            return;
        }

        try {
            setIsSubmitting(true);
            
            const currentAnswer = answers[currentQuestion.question_id];
            if (currentAnswer) {
                await saveAnswer(quizData.quiz_id, currentQuestion.question_id, currentAnswer);
            }

            const response = await submitQuiz(quizData.quiz_id);

            console.log('Quiz submission response:', response);

            if (response.success) {
                console.log('Setting quiz result:', response.data);
                console.log('Setting showResultModal to true');
                setQuizResult(response.data);
                setShowResultModal(true);
                console.log('States updated - modal should show');
            } else {
                ToastNotification(response.message || 'Failed to submit quiz', 'error');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            ToastNotification('Failed to submit quiz', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function confirmSubmit() {
        setShowConfirmModal(false);

        try {
            setIsSubmitting(true);
            
            const currentAnswer = answers[currentQuestion.question_id];
            if (currentAnswer) {
                await saveAnswer(quizData.quiz_id, currentQuestion.question_id, currentAnswer);
            }

            const response = await submitQuiz(quizData.quiz_id);

            console.log('Quiz submission response (confirmSubmit):', response);

            if (response.success) {
                console.log('Setting quiz result (confirmSubmit):', response.data);
                console.log('Setting showResultModal to true (confirmSubmit)');
                setQuizResult(response.data);
                setShowResultModal(true);
                console.log('States updated (confirmSubmit) - modal should show');
            } else {
                ToastNotification(response.message || 'Failed to submit quiz', 'error');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            ToastNotification('Failed to submit quiz', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    function getQuestionStatus(index) {
        if (index === currentQuestionIndex) return "current";
        if (markedForReview.has(index)) return "review";
        const question = quizQuestions[index];
        if (question && answers[question.question_id]) return "answered";
        return "notVisited";
    }

    function getPaletteStyle(status) {
        if (status === "answered") {
        return isDarkTheme 
            ? "bg-success/20 text-success border-2 border-success/40"
            : "bg-success/10 text-success border-2 border-success/20";
        }
        if (status === "review") {
        return isDarkTheme
            ? "bg-primaryLight/20 text-primaryLight border-2 border-primaryLight/60"
            : "bg-primaryLight text-white border-2 border-primaryLight";
        }
        if (status === "current") {
        return isDarkTheme
            ? "bg-primary/30 text-white border-2 border-primary"
            : "bg-white text-gray-900 border-2 border-gray-900";
        }
        return isDarkTheme
        ? "bg-darkSurface text-darkTextSecondary border-2 border-darkBorder"
        : "bg-white text-gray-400 border-2 border-gray-300";
    }

    const answeredCount = Object.keys(answers).length;
    const unansweredCount = totalQuestions - answeredCount;

    return (
        <div className={isDarkTheme ? "dark" : ""}>
            <ToastContainer/>
        <div className="min-h-screen bg-background ">
            {/* Mobile Palette Toggle */}
            <button
            onClick={() => setShowPaletteMobile(!showPaletteMobile)}
            className={`lg:hidden w-full mb-4 px-4 py-3 rounded-medium text-sm font-medium border-2
                        ${isDarkTheme 
                        ? "bg-darkSurface text-darkTextPrimary border-darkBorder hover:border-primary/40 hover:bg-darkSurfaceHover" 
                        : "bg-white text-secondaryDark border-gray-200 hover:bg-gray-50"}
                        hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]`}
            >
            {showPaletteMobile ? "Hide" : "Show"} Question Palette
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Left Panel - Question Palette */}
            <div className={`lg:col-span-3 ${showPaletteMobile ? "block" : "hidden lg:block"}`}>
                <div className={`rounded-large p-4 border-2
                            ${isDarkTheme 
                                ? "bg-darkSurface border-darkBorder" 
                                : "bg-white border-gray-200"}`}>
                <h2 className={`text-base font-semibold mb-4
                                ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
                    Question Palette
                </h2>

                {/* Question Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {quizQuestions.map(function(q, index) {
                    const status = getQuestionStatus(index);
                    return (
                        <button
                        key={q.question_id || index}
                        onClick={() => goToQuestion(index)}
                        className={`w-full aspect-square rounded-small text-sm font-medium
                                    ${getPaletteStyle(status)}
                                    hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]`}
                        >
                        {index + 1}
                        </button>
                    );
                    })}
                </div>

                {/* Summary */}
                <div className={`space-y-2 text-xs mb-4 pb-4 border-b-2
                                ${isDarkTheme ? "border-darkBorder" : "border-gray-200"}`}>
                    <div className="flex justify-between">
                    <span className={isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}>
                        Answered:
                    </span>
                    <span className="font-medium text-success">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className={isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}>
                        Not Answered:
                    </span>
                    <span className="font-medium text-error">{unansweredCount}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className={isDarkTheme ? "text-darkTextSecondary" : "text-gray-500"}>
                        Marked for Review:
                    </span>
                    <span className="font-medium text-primaryLight">{markedForReview.size}</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-small border-2
                                    ${isDarkTheme 
                                    ? "bg-success/20 border-success/40" 
                                    : "bg-success/10 border-success/20"}`}>
                    </div>
                    <span className={isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}>
                        Answered
                    </span>
                    </div>
                    <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-small border-2
                                    ${isDarkTheme 
                                    ? "bg-darkSurface border-darkBorder" 
                                    : "bg-white border-gray-300"}`}>
                    </div>
                    <span className={isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}>
                        Not Visited
                    </span>
                    </div>
                    <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-small border-2
                                    ${isDarkTheme 
                                    ? "bg-primaryLight/20 border-primaryLight/60" 
                                    : "bg-primaryLight border-primaryLight"}`}>
                    </div>
                    <span className={isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}>
                        Review
                    </span>
                    </div>
                </div>
                </div>
            </div>

            {/* Right Panel - Question Area */}
            <div className="lg:col-span-9">
                {/* Header */}
                <div className={`rounded-large p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-2
                            ${isDarkTheme 
                                ? "bg-primary/10 border-primary/30" 
                                : "bg-secondary border-gray-200"}`}>
                <div>
                    <h3 className={`text-base font-semibold
                                ${isDarkTheme ? "text-primaryLight" : "text-primary"}`}>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                    </h3>
                    <p className={`text-xs mt-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-600"}`}>
                        Time Remaining: {formatTime(timeRemaining)}
                    </p>
                </div>
                <button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-medium text-sm font-medium bg-primary text-white
                            hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                            disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
                </div>

                {/* Question Card */}
                <div className={`rounded-large p-4 md:p-6 mb-4 border-2
                            ${isDarkTheme 
                                ? "bg-darkSurface border-darkBorder" 
                                : "bg-white border-gray-200"}`}>
                <p className={`text-sm md:text-base mb-6 leading-relaxed
                            ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
                    {currentQuestion.question}
                </p>

                {/* Options */}
                <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map(function(optionId) {
                        const optionText = currentQuestion[`option_${optionId.toLowerCase()}`];
                        if (!optionText) return null;
                        
                        const isSelected = answers[currentQuestion.question_id] === optionId;
                        return (
                            <button
                            key={optionId}
                            onClick={() => handleAnswerSelect(optionId)}
                            className={`w-full text-left p-3 md:p-4 rounded-medium border-2 transition-all duration-200 ease-in-out
                                        ${isSelected 
                                        ? isDarkTheme
                                            ? "border-primary bg-primary/10" 
                                            : "border-primary bg-secondary"
                                        : isDarkTheme
                                            ? "border-darkBorder bg-darkBackground hover:border-primary/40 hover:bg-darkSurfaceHover"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"}
                                        hover:scale-[0.99] active:scale-[0.99]
                                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]`}
                            >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                                            ${isSelected 
                                                ? "border-primary bg-primary" 
                                                : isDarkTheme 
                                                ? "border-darkBorder" 
                                                : "border-gray-300"}`}>
                                {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                                </div>
                                <span className={`text-sm
                                                ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
                                {optionId}) {optionText}
                                </span>
                            </div>
                            </button>
                        );
                    })}
                </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                {/* Left Side */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 md:px-6 py-3 rounded-medium text-sm font-medium border-2 flex items-center justify-center gap-2
                                ${isDarkTheme 
                                ? "bg-darkSurface text-darkTextPrimary border-darkBorder hover:bg-darkSurfaceHover hover:border-primary/40" 
                                : "bg-white text-secondaryDark border-gray-200 hover:bg-gray-50"}
                                hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                    <LeftArrow size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
                    Previous
                    </button>

                    <button
                    onClick={handleMarkForReview}
                    className={`px-4 md:px-6 py-3 rounded-medium text-sm font-medium transition-all duration-200 ease-in-out
                                ${markedForReview.has(currentQuestionIndex)
                                ? "bg-primaryLight text-white border-2 border-primaryLight" 
                                : isDarkTheme
                                    ? "bg-darkSurface text-primaryLight border-2 border-primaryLight/60 hover:bg-darkSurfaceHover"
                                    : "bg-white text-primaryLight border-2 border-primaryLight"}
                                hover:scale-[0.99] active:scale-[0.99]
                                focus:outline-none focus:ring-2 focus:ring-primaryLight/20 focus:scale-[0.99]`}
                    >
                    {markedForReview.has(currentQuestionIndex) ? "Unmark Review" : "Mark for Review"}
                    </button>
                </div>

                {/* Right Side */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                    onClick={handleClearResponse}
                    className={`px-4 md:px-6 py-3 rounded-medium text-sm font-medium border-2
                                ${isDarkTheme 
                                ? "bg-darkSurface text-darkTextPrimary border-darkBorder hover:bg-darkSurfaceHover hover:border-error/40" 
                                : "bg-white text-secondaryDark border-gray-200 hover:bg-gray-50"}
                                hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]`}
                    >
                    Clear Response
                    </button>

                    <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === totalQuestions - 1 || isNavigating}
                    className="px-4 md:px-6 py-3 rounded-medium text-sm font-medium bg-primary text-white flex items-center justify-center gap-2
                                hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                                disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Next
                    <RightArrow size={16} defaultColor="#fff" />
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* Confirm Submit Modal */}
        {showConfirmModal && (
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Submit Quiz"
                message={`You have answered ${Object.keys(answers).length} out of ${totalQuestions} questions. Are you sure you want to submit?`}
                confirmText="Submit"
                cancelText="Cancel"
                type="submit"
                onConfirm={confirmSubmit}
                onClose={() => setShowConfirmModal(false)}
            />
        )}

        {/* Result Modal */}
        <QuizResultModal
            isOpen={showResultModal}
            onClose={() => {
                setShowResultModal(false);
                navigate('/quiz');
            }}
            results={quizResult}
        />
        </div>
    );
}

export default TakeQuiz;