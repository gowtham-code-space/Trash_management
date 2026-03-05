import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { X, Trash } from "../../../assets/icons/icons";
import ThemeStore from "../../../store/ThemeStore";
import { SkeletonLine } from "../../skeleton";
import { getDeletedQuizConfigs, restoreQuizConfig } from "../../../services/features/adminService";
import ToastNotification from "../../Notification/ToastNotification";

function DeletedConfigModal({ onClose, onRestored }) {
    const { isDarkTheme } = ThemeStore();
    const { t } = useTranslation(["modals", "common"]);
    const [deleted, setDeleted] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restoringId, setRestoringId] = useState(null);

    const fetchDeleted = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDeletedQuizConfigs();
            setDeleted(Array.isArray(res.data) ? res.data : []);
        } catch {
            ToastNotification(t('modals:deleted_config.toast_load_failed'), "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDeleted(); }, [fetchDeleted]);

    async function handleRestore(config) {
        const prev = deleted;
        setDeleted((d) => d.filter((c) => c.score_time_id !== config.score_time_id));
        setRestoringId(config.score_time_id);
        try {
            await restoreQuizConfig(config.score_time_id);
            ToastNotification(t('modals:deleted_config.toast_restored', { id: config.score_time_id }), "success");
            onRestored?.();
        } catch {
            setDeleted(prev);
            ToastNotification(t('modals:deleted_config.toast_restore_failed'), "error");
        } finally {
            setRestoringId(null);
        }
    }

    const surfaceClass = isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200";
    const rowClass = isDarkTheme ? "bg-darkBackground border-darkBorder" : "bg-background border-gray-200";
    const labelClass = `text-xs ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`;
    const valueClass = `text-xs font-semibold ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/30 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative z-10 w-full max-w-lg mx-4 rounded-veryLarge border shadow-lg flex flex-col max-h-[80vh] ${surfaceClass}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-darkBorder shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-medium bg-error/10">
                            <Trash size={16} defaultColor="#E75A4C" />
                        </div>
                        <div>
                            <h2 className={`text-base font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
                                {t('modals:deleted_config.title')}
                            </h2>
                            <p className={`text-xs mt-0.5 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                                {t('modals:deleted_config.subtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
                            ${isDarkTheme ? "bg-darkBackground" : "bg-secondary"}`}
                    >
                        <X size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={`rounded-large border p-4 space-y-3 ${rowClass}`}>
                                <SkeletonLine width="w-28" height="h-4" isDarkTheme={isDarkTheme} />
                                <div className="grid grid-cols-2 gap-2">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <SkeletonLine key={j} width="w-full" height="h-3" isDarkTheme={isDarkTheme} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : deleted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <p className={`text-sm font-medium ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                                {t('modals:deleted_config.empty')}
                            </p>
                        </div>
                    ) : (
                        deleted.map((config) => (
                            <div key={config.score_time_id} className={`rounded-large border p-4 ${rowClass}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-sm font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
                                        {t('modals:deleted_config.config_prefix')} {config.score_time_id}
                                    </span>
                                    <button
                                        disabled={restoringId === config.score_time_id}
                                        onClick={() => handleRestore(config)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-medium text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {restoringId === config.score_time_id ? t('modals:deleted_config.restoring') : t('modals:deleted_config.restore')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                    {[
                                        [t('modals:deleted_config.time'), config.total_time || "—"],
                                        [t('modals:deleted_config.questions'), config.total_questions],
                                        [t('modals:deleted_config.total_score'), config.total_score],
                                        [t('modals:deleted_config.pass_mark'), config.pass_mark],
                                        [t('modals:deleted_config.correct_mark'), config.correct_mark],
                                        [t('modals:deleted_config.wrong_mark'), config.wrong_mark],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex justify-between items-center">
                                            <span className={labelClass}>{label}</span>
                                            <span className={valueClass}>{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-3 shrink-0">
                    <button
                        onClick={onClose}
                        className={`w-full py-3 rounded-medium text-sm font-semibold hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
                            ${isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-secondary text-secondaryDark"}`}
                    >
                        {t('modals:deleted_config.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeletedConfigModal;
