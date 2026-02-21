import React from "react";
import ThemeStore from "../../../store/ThemeStore";
import { Check, X, RightArrow, LeftArrow } from "../../../assets/icons/icons";

function ReviewQuizModal({ isOpen, quizData, onClose }) {
  const { isDarkTheme } = ThemeStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

  if (!isOpen || !quizData) return null;

  const questions = quizData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

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

  function goToQuestion(index) {
    setCurrentQuestionIndex(index);
  }

  function getOptionStatus(optionId) {
    const isCorrect = currentQuestion.correct_option === optionId;
    const isSelected = currentQuestion.user_answer === optionId;

    if (isCorrect) return "correct";
    if (isSelected && !isCorrect) return "wrong";
    return "default";
  }

  function getOptionStyle(status) {
    if (status === "correct") {
      return isDarkTheme
        ? "border-success bg-success/20 text-success"
        : "border-success bg-success/10 text-success";
    }
    if (status === "wrong") {
      return isDarkTheme
        ? "border-error bg-error/20 text-error"
        : "border-error bg-error/10 text-error";
    }
    return isDarkTheme
      ? "border-darkBorder bg-darkBackground text-darkTextSecondary"
      : "border-gray-200 bg-white text-secondaryDark";
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className={`rounded-large max-w-full md:max-w-4xl w-full my-4 md:my-8 border-2
          ${isDarkTheme 
            ? "bg-darkSurface border-darkBorder" 
            : "bg-white border-gray-200"}`}
        onClick={function(e) { e.stopPropagation(); }}
      >
        <div className={`p-3 sm:p-4 md:p-6 border-b-2 flex items-center justify-between gap-2
          ${isDarkTheme ? "border-darkBorder" : "border-gray-200"}`}>
          <div className="flex-1 min-w-0">
            <h2 className={`text-base sm:text-lg font-bold truncate ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
              Quiz Review - #{quizData.quiz_id}
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-600"}`}>
              Score: {quizData.score}/{quizData.total_score} ({quizData.percentage}%)
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-medium shrink-0
              hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
              transition-all duration-200 ease-in-out
              ${isDarkTheme ? "bg-darkBackground" : "bg-secondary"}`}
          >
            <X size={20} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 p-3 sm:p-4 md:p-6">
          <div className="lg:col-span-3">
            <div className={`rounded-large p-3 sm:p-4 border-2
              ${isDarkTheme 
                ? "bg-darkBackground border-darkBorder" 
                : "bg-secondary border-gray-200"}`}>
              <h3 className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3
                ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
                Questions
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-3 gap-2">
                {questions.map(function(q, index) {
                  const isCorrect = q.user_answer === q.correct_option;
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={index}
                      onClick={function() { goToQuestion(index); }}
                      className={`w-full aspect-square rounded-small text-sm font-medium border-2
                        hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                        transition-all duration-200 ease-in-out
                        ${isCurrent 
                          ? "border-primary bg-primary text-white" 
                          : isCorrect 
                            ? isDarkTheme
                              ? "border-success/40 bg-success/20 text-success"
                              : "border-success/20 bg-success/10 text-success"
                            : isDarkTheme
                              ? "border-error/40 bg-error/20 text-error"
                              : "border-error/20 bg-error/10 text-error"
                        }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className={`rounded-large p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 border-2
              ${isDarkTheme 
                ? "bg-darkBackground border-darkBorder" 
                : "bg-secondary border-gray-200"}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <h4 className={`text-xs sm:text-sm font-semibold
                  ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </h4>
                <span className={`text-xs font-medium px-2 sm:px-3 py-1 rounded-medium whitespace-nowrap
                  ${currentQuestion.user_answer === currentQuestion.correct_option
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                  }`}>
                  {currentQuestion.user_answer === currentQuestion.correct_option ? "Correct" : "Incorrect"}
                </span>
              </div>

              <p className={`text-sm md:text-base mb-4 sm:mb-6
                ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
                {currentQuestion.question}
              </p>

              <div className="space-y-2 sm:space-y-3">
                {['A', 'B', 'C', 'D'].map(function(optionId) {
                  const optionText = currentQuestion[`option_${optionId.toLowerCase()}`];
                  if (!optionText) return null;
                  
                  const status = getOptionStatus(optionId);
                  const isCorrect = status === "correct";
                  const isWrong = status === "wrong";
                  
                  return (
                    <div
                      key={optionId}
                      className={`p-2 sm:p-3 md:p-4 rounded-medium border-2 flex items-center gap-2 sm:gap-3
                        ${getOptionStyle(status)}`}
                    >
                      <div className="flex-shrink-0">
                        {isCorrect && (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success flex items-center justify-center">
                            <Check size={12} isDarkTheme={true} />
                          </div>
                        )}
                        {isWrong && (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-error flex items-center justify-center">
                            <X size={12} isDarkTheme={true} />
                          </div>
                        )}
                        {!isCorrect && !isWrong && (
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2
                            ${isDarkTheme ? "border-darkBorder" : "border-gray-300"}`}>
                          </div>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm wrap-break-word">
                        {optionId}) {optionText}
                      </span>
                    </div>
                  );
                })}
              </div>

              {currentQuestion.user_answer !== currentQuestion.correct_option && (
                <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-medium border-2
                  ${isDarkTheme 
                    ? "border-success/40 bg-success/10" 
                    : "border-success/20 bg-success/10"}`}>
                  <p className="text-xs font-medium text-success">
                    Correct Answer: Option {currentQuestion.correct_option}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-2 sm:gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-medium text-xs sm:text-sm font-medium border-2 flex items-center gap-1 sm:gap-2
                  hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                  transition-all duration-200 ease-in-out
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isDarkTheme 
                    ? "bg-darkBackground text-darkTextPrimary border-darkBorder" 
                    : "bg-white text-secondaryDark border-gray-200"}`}
              >
                <LeftArrow size={14} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-medium text-xs sm:text-sm font-medium bg-primary text-white flex items-center gap-1 sm:gap-2
                  hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                  transition-all duration-200 ease-in-out
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <RightArrow size={14} defaultColor="#fff" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewQuizModal;
