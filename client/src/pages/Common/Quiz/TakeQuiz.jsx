import React, { useState } from "react";
import ThemeStore from "../../../store/ThemeStore";
import QuizResultModal from "../../../components/Modals/Quiz/QuizResultModal";
import { RightArrow, LeftArrow } from "../../../assets/icons/icons";

// Mock quiz questions
const quizQuestions = [
    {
    id: 1,
    question: "Which of the following color-coded bins is the correct designated disposal container for hazardous electronic waste (e-waste) such as old batteries and circuit boards?",
    options: [
        { id: "A", text: "A) Green Bin" },
        { id: "B", text: "B) Red Bin" },
        { id: "C", text: "C) Blue Bin" },
        { id: "D", text: "D) Black Bin" }
    ],
    correctAnswer: "C"
    },
    {
    id: 2,
    question: "What is the recommended frequency for emptying residential waste bins in urban areas?",
    options: [
        { id: "A", text: "A) Daily" },
        { id: "B", text: "B) Twice a week" },
        { id: "C", text: "C) Weekly" },
        { id: "D", text: "D) Bi-weekly" }
    ],
    correctAnswer: "B"
    },
    {
    id: 3,
    question: "Which waste management hierarchy principle should be prioritized first?",
    options: [
        { id: "A", text: "A) Recycling" },
        { id: "B", text: "B) Disposal" },
        { id: "C", text: "C) Prevention" },
        { id: "D", text: "D) Energy recovery" }
    ],
    correctAnswer: "C"
    },
    {
    id: 4,
    question: "What protective equipment is mandatory when handling medical waste?",
    options: [
        { id: "A", text: "A) Gloves only" },
        { id: "B", text: "B) Mask only" },
        { id: "C", text: "C) Full PPE including gloves, mask, and protective clothing" },
        { id: "D", text: "D) Safety glasses only" }
    ],
    correctAnswer: "C"
    },
    {
    id: 5,
    question: "How long should organic waste be composted before use in gardens?",
    options: [
        { id: "A", text: "A) 1-2 weeks" },
        { id: "B", text: "B) 2-3 months" },
        { id: "C", text: "C) 6-12 months" },
        { id: "D", text: "D) 2 years" }
    ],
    correctAnswer: "B"
    }
    ];

function TakeQuiz() {
    const { isDarkTheme } = ThemeStore();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState(new Set());
    const [showResultModal, setShowResultModal] = useState(false);
    const [showPaletteMobile, setShowPaletteMobile] = useState(false);

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const totalQuestions = quizQuestions.length;

    function handleAnswerSelect(optionId) {
    setAnswers(function(prev) {
        return {
        ...prev,
        [currentQuestionIndex]: optionId
        };
    });
    }

    function handleMarkForReview() {
        setMarkedForReview(function(prev) {
        const newSet = new Set(prev);
        if (newSet.has(currentQuestionIndex)) {
            newSet.delete(currentQuestionIndex);
        } else {
            newSet.add(currentQuestionIndex);
        }
        return newSet;
        });
    }

    function goToQuestion(index) {
        setCurrentQuestionIndex(index);
        setShowPaletteMobile(false);
    }

    function handleNext() {
        if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
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
        delete newAnswers[currentQuestionIndex];
        return newAnswers;
        });
    }

    function handleSubmit() {
        const correct = quizQuestions.filter(function(q, index) {
        return answers[index] === q.correctAnswer;
        }).length;
        
        const wrong = Object.keys(answers).length - correct;
        
        setShowResultModal(true);
    }

    function getQuestionStatus(index) {
        if (index === currentQuestionIndex) return "current";
        if (markedForReview.has(index)) return "review";
        if (answers[index]) return "answered";
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
                        key={q.id}
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
                </div>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded-medium text-sm font-medium bg-primary text-white
                            hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
                >
                    Submit Quiz
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
                    {currentQuestion.options.map(function(option) {
                    const isSelected = answers[currentQuestionIndex] === option.id;
                    return (
                        <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(option.id)}
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
                            {option.text}
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
                    disabled={currentQuestionIndex === totalQuestions - 1}
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

        {/* Result Modal */}
        <QuizResultModal
            isOpen={showResultModal}
            onClose={() => setShowResultModal(false)}
            results={{
            quizTitle: "Hazardous Waste Safety Quiz",
            total: totalQuestions,
            correct: quizQuestions.filter(function(q, index) {
                return answers[index] === q.correctAnswer;
            }).length,
            wrong: Object.keys(answers).length - quizQuestions.filter(function(q, index) {
                return answers[index] === q.correctAnswer;
            }).length
            }}
        />
        </div>
    );
}

export default TakeQuiz;