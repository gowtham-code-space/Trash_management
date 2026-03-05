import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Location,
    Expand,
    X
} from "../../../assets/icons/icons";
import ThemeStore from "../../../store/ThemeStore";

function CreateFeedBack() {
    const { isDarkTheme } = ThemeStore();
    const { t } = useTranslation(["pages", "common"]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSessionGenerated, setIsSessionGenerated] = useState(false);

    const sessionOTP = "749382";
    const isSessionActive = true;
    
    const qrCodeURL = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=FEEDBACK-749382-SESSION";

    const collectorData = {
    name: "John Martinez",
    route: "Downtown District - Zone A",
    vehicle: "TC-2047",
    sessionGeneratedAt: "08:30:45 AM"
    };

    useEffect(function () {
        const timer = setInterval(function () {
        setCurrentTime(new Date());
        }, 1000);

        return function () {
        clearInterval(timer);
        };
    }, []);

    function formatTime(date) {
        return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
        });
    }

    function formatDate(date) {
        return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
        });
    }

    function getTimeUntilMidnight() {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    function generateSession() {
        setIsSessionGenerated(true);
    }

    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="min-h-screen bg-background transition-all duration-200">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

            <div className="bg-white rounded-large p-4 sm:p-6 border border-secondary space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-primary">
                    {collectorData.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-secondaryDark mt-1">
                    <Location size={16} isDarkTheme={isDarkTheme} />
                    <span>{collectorData.route}</span>
                    </div>
                    <p className="text-xs text-secondaryDark mt-1">
                    {t('pages:common.feedback.vehicle_id')} {collectorData.vehicle}
                    </p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-base sm:text-lg font-semibold text-primary">
                    {formatTime(currentTime)}
                    </p>
                    <p className="text-xs sm:text-sm text-secondaryDark">
                    {formatDate(currentTime)}
                    </p>
                </div>
                </div>

                {isSessionGenerated && (
                <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-secondary">
                    <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                        isSessionActive ? "bg-success" : "bg-error"
                    }`}
                    ></div>
                    <span className="text-xs sm:text-sm font-medium text-secondaryDark">
                    {isSessionActive ? t('pages:common.feedback.session_active') : t('pages:common.feedback.session_expired')} • {t('pages:common.feedback.expires_in')}{" "}
                    {getTimeUntilMidnight()}
                    </span>
                </div>
                )}
            </div>

            {!isSessionGenerated ? (
                <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-primary">
                        {t('pages:common.feedback.no_active_session')}
                    </h3>
                    <p className="text-sm sm:text-base text-secondaryDark max-w-md">
                        {t('pages:common.feedback.generate_session_desc')}
                    </p>
                    </div>
                    <button
                    onClick={generateSession}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-medium text-base sm:text-lg font-semibold hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    >
                    {t('pages:common.feedback.generate_qr_otp')}
                    </button>
                </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-large p-6 sm:p-8 border border-secondary flex flex-col items-center justify-center space-y-4 sm:space-y-6">
                    <div className="text-center">
                    <h3 className="text-base sm:text-lg font-bold text-primary mb-2">
                        {t('pages:common.feedback.daily_qr_code')}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondaryDark">
                        {t('pages:common.feedback.scan_to_submit')}
                    </p>
                    </div>

                    <div className="relative bg-secondary p-4 sm:p-6 rounded-large">
                    <img
                        src={qrCodeURL}
                        alt="Feedback QR Code"
                        className="w-48 h-48 sm:w-64 sm:h-64 mx-auto"
                    />
                    <button
                        onClick={openModal}
                        className="absolute top-2 right-2 p-2 bg-white rounded-medium border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                        aria-label={t('pages:common.feedback.expand_qr')}
                    >
                        <Expand size={20} defaultColor="#145B47" isDarkTheme={isDarkTheme} />
                    </button>
                    </div>

                    <div className="text-center space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-secondaryDark">
                        {t('pages:common.feedback.one_time_password')}
                    </p>
                    <div className="bg-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-medium">
                        <p className="text-2xl sm:text-3xl font-bold text-primary tracking-wider">
                        {sessionOTP}
                        </p>
                    </div>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white rounded-large p-4 sm:p-6 border border-secondary space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-primary">
                        {t('pages:common.feedback.session_information')}
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-secondary">
                        <span className="text-sm text-secondaryDark">{t('pages:common.feedback.session_status')}</span>
                        <span className={`text-sm font-semibold ${isSessionActive ? "text-success" : "text-error"}`}>
                            {isSessionActive ? t('pages:common.feedback.session_active') : t('pages:common.feedback.session_expired')}
                        </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-secondary">
                        <span className="text-sm text-secondaryDark">{t('pages:common.feedback.time_remaining')}</span>
                        <span className="text-sm font-semibold text-primary">
                            {getTimeUntilMidnight()}
                        </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-secondary">
                        <span className="text-sm text-secondaryDark">{t('pages:common.feedback.generated_at')}</span>
                        <span className="text-sm font-semibold text-primary">
                            {collectorData.sessionGeneratedAt}
                        </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-secondaryDark">{t('pages:common.feedback.valid_until')}</span>
                        <span className="text-sm font-semibold text-primary">
                            {t('pages:common.feedback.valid_until_value')}
                        </span>
                        </div>
                    </div>
                    </div>

                    <div className="bg-white rounded-large p-4 sm:p-6 border border-secondary space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-primary">
                        {t('pages:common.feedback.collection_route_details')}
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex items-start justify-between py-2 border-b border-secondary">
                        <span className="text-sm text-secondaryDark">{t('pages:common.feedback.assigned_route')}</span>
                        <span className="text-sm font-semibold text-primary text-right">
                            {collectorData.route}
                        </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-secondary">
                        <span className="text-sm text-secondaryDark">{t('pages:common.feedback.vehicle_id_detail')}</span>
                        <span className="text-sm font-semibold text-primary">
                            {collectorData.vehicle}
                        </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-secondary">
                        <span className="text-sm text-secondaryDark">{t('pages:common.feedback.collector_name')}</span>
                        <span className="text-sm font-semibold text-primary">
                            {collectorData.name}
                        </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-secondaryDark">{t('pages:common.feedback.shift_date')}</span>
                        <span className="text-sm font-semibold text-primary">
                            {new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                            })}
                        </span>
                        </div>
                    </div>
                    </div>

                    <div className="bg-white rounded-large p-4 sm:p-6 border border-secondary space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-primary">
                        {t('pages:common.feedback.usage_guidelines')}
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-secondaryDark">
                        <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{t('pages:common.feedback.guideline_1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{t('pages:common.feedback.guideline_2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{t('pages:common.feedback.guideline_3')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{t('pages:common.feedback.guideline_4')}</span>
                        </li>
                    </ul>
                    </div>
                </div>
                </div>
            )}

            <div className="bg-primary/5 rounded-large p-4 border border-primary/20">
                <p className="text-xs sm:text-sm text-center text-secondaryDark">
                {t('pages:common.feedback.footer_disclaimer')}
                </p>
            </div>
            </div>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-large p-6 sm:p-8 max-w-md w-full space-y-4">
                <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-primary">
                    {t('pages:common.feedback.qr_code_title')}
                </h3>
                <button
                    onClick={closeModal}
                    className="p-2 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    aria-label={t('pages:common.feedback.close_modal')}
                >
                    <X size={24} defaultColor="#145B47" isDarkTheme={isDarkTheme} />
                </button>
                </div>
                
                <div className="bg-secondary p-6 rounded-large flex items-center justify-center">
                <img
                    src={qrCodeURL}
                    alt="Feedback QR Code"
                    className="w-full max-w-sm"
                />
                </div>

                <div className="text-center space-y-2">
                <p className="text-sm font-medium text-secondaryDark">
                    {t('pages:common.feedback.one_time_password')}
                </p>
                <div className="bg-secondary px-8 py-4 rounded-medium">
                    <p className="text-3xl font-bold text-primary tracking-wider">
                    {sessionOTP}
                    </p>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}

export default CreateFeedBack;