import React from "react";
import ThemeStore from "../../../store/ThemeStore";
import { Check, X, Star } from "../../../assets/icons/icons";
import { useNavigate } from "react-router-dom";

function QuizResultModal({ isOpen, onClose, results }) {
    const navigate = useNavigate();
    const { isDarkTheme } = ThemeStore();

    console.log('QuizResultModal render:', { isOpen, hasResults: !!results, results });

    if (!isOpen) {
        console.log('QuizResultModal: Not showing because isOpen is false');
        return null;
    }
    
    if (!results) {
        console.log('QuizResultModal: Not showing because results is null/undefined');
        return null;
    }

    const percentage = parseFloat(results.percentage || 0);
    const passed = results.is_pass === 1 || results.is_pass === true;
    const score = results.score || 0;
    const totalScore = results.total_score || 20;
    const passMarkPercentage = results.pass_mark ? Math.round((results.pass_mark / results.total_score) * 100) : 60;

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-large w-full max-w-lg p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                <h2 className="text-xl font-bold text-secondaryDark mb-1">
                    Quiz Completed!
                </h2>
                <p className="text-sm text-gray-500">
                    Quiz #{results.quiz_id}
                </p>
                </div>
                <button
                onClick={onClose}
                className="w-8 h-8 rounded-medium flex items-center justify-center bg-gray-100 hover:bg-gray-200
                            hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
                >
                <X size={20} defaultColor="#316F5D" />
                </button>
            </div>

            {/* Score Circle */}
            <div className="flex flex-col items-center mb-6">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4
                            ${passed ? "bg-success/10 border-4 border-success" : "bg-error/10 border-4 border-error"}`}>
                <div className="text-center">
                    <p className={`text-3xl font-bold ${passed ? "text-success" : "text-error"}`}>
                    {percentage.toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500">Score</p>
                </div>
                </div>
                
                {passed ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-medium">
                    <Check size={18} defaultColor="#1E8E54" />
                    <span className="text-sm font-medium text-success">Passed!</span>
                </div>
                ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-error/10 rounded-medium">
                    <X size={18} defaultColor="#E75A4C" />
                    <span className="text-sm font-medium text-error">Failed</span>
                </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-secondary rounded-medium p-4 text-center border border-gray-200">
                <p className="text-2xl font-bold text-primary mb-1">
                    {score}
                </p>
                <p className="text-xs text-gray-500">Your Score</p>
                </div>
                
                <div className="bg-secondary rounded-medium p-4 text-center border border-gray-200">
                <p className="text-2xl font-bold text-primary mb-1">
                    {totalScore}
                </p>
                <p className="text-xs text-gray-500">Total Score</p>
                </div>
            </div>

            {/* Performance Message */}
            <div className="bg-secondary rounded-medium p-4 mb-6 border border-gray-200">
                <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-medium bg-primary/10 flex items-center justify-center ">
                    <Star size={20} defaultColor="#145B47" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-secondaryDark mb-1">
                    {passed ? "Great Job!" : "Keep Practicing!"}
                    </h3>
                    <p className="text-xs text-gray-500">
                    {passed 
                        ? `You've scored ${percentage.toFixed(1)}% and passed the quiz! (Pass mark: ${passMarkPercentage}%)`
                        : `You've scored ${percentage.toFixed(1)}%. You need ${passMarkPercentage}% to pass. Review the topics and try again!`}
                    </p>
                </div>
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={() => {
                    onClose();
                    navigate("/quiz");
                }}
                className="w-full px-6 py-3 rounded-medium text-sm font-medium bg-primary text-white
                            hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
            >
                {passed ? "Back to Quiz" : "Retake Quiz"}
            </button>
            </div>
        </div>
        </div>
    );
}

export default QuizResultModal;