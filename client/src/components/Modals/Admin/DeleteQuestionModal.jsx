import React from "react";
import { useTranslation } from "react-i18next";
import { X, Trash } from "../../../assets/icons/icons";
import ThemeStore from "../../../store/ThemeStore";

function DeleteQuestionModal({ question, onConfirm, onClose }) {
    const { isDarkTheme } = ThemeStore();
    const { t } = useTranslation(["modals", "common"]);

    if (!question) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative z-10 w-full max-w-md mx-4 rounded-veryLarge border shadow-lg p-6 space-y-4
            ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}>

            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-medium bg-error/10">
                <Trash size={16} defaultColor="#E75A4C" />
                </div>
                <h2 className={`text-base font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
                {t('modals:delete_question.title')}
                </h2>
            </div>
            <button
                onClick={onClose}
                className={`p-2 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out
                ${isDarkTheme ? "bg-darkBackground" : "bg-secondary"}`}
            >
                <X size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
            </button>
            </div>

            <p className={`text-sm ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
            {t('modals:delete_question.message')}
            </p>

            <div className={`p-3 rounded-large border text-sm font-medium line-clamp-2
            ${isDarkTheme ? "bg-darkBackground border-darkBorder text-darkTextPrimary" : "bg-secondary border-gray-200 text-secondaryDark"}`}>
            {question.question}
            </div>

            <div className="flex gap-3 pt-1">
            <button
                onClick={onClose}
                className={`flex-1 py-3 rounded-medium text-sm font-semibold hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out
                ${isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-secondary text-secondaryDark"}`}
            >
                {t('modals:delete_question.cancel')}
            </button>
            <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-medium text-sm font-semibold bg-error text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-error/20 transition-all duration-200 ease-in-out"
            >
                {t('modals:delete_question.delete')}
            </button>
            </div>
        </div>
        </div>
    );
    }

export default DeleteQuestionModal;
