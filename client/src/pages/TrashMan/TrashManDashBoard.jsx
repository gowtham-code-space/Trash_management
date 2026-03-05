import React, { useState } from "react";
import {
    ZoomIn,
    ZoomOut,
    Location,
    TrashRoute,
    Task,
    FeedBack,
    Certificate,
    Star,
    Notification,
    RightArrow,
    Add
} from "../../assets/icons/icons";
import ToastNotification from "../../components/Notification/ToastNotification";
import ThemeStore from "../../store/ThemeStore";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

function TrashManDashboard() {
    const navigate = useNavigate();
    const { isDarkTheme } = ThemeStore();
    const { t } = useTranslation('pages');

    function handleAttendance() {
        ToastNotification(t('trashman.dashboard.toast_attendance'), "info");
    }

    function handleRoutesTimings() {
        ToastNotification(t('trashman.dashboard.toast_routes'), "info");
    }

    function handleImmediateTasks() {
        ToastNotification(t('trashman.dashboard.toast_tasks'), "info");
    }

    function handleFeedbackSession() {
        ToastNotification(t('trashman.dashboard.toast_feedback'), "success");
    }

    function handleQuiz() {
        ToastNotification(t('trashman.dashboard.toast_quiz'), "info");
    }

    function handleNotificationClick() {
        ToastNotification(t('trashman.dashboard.toast_notifications', { count: 3 }), "info");
    }

    function handlePointsClick() {
        ToastNotification(t('trashman.dashboard.toast_points', { count: 420 }), "success");
    }

    function handleZoomIn() {
        ToastNotification(t('shared.zoom_in_toast'), "info");
    }

    function handleZoomOut() {
        ToastNotification(t('shared.zoom_out_toast'), "info");
    }

    function handleLocate() {
        ToastNotification(t('shared.locate_toast'), "info");
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="min-h-screen bg-background animate-in fade-in duration-700 pb-20 lg:pb-0">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: Main Feed */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Header Card */}
                <header className="bg-primary p-5 rounded-veryLarge flex items-center justify-between text-white shadow-sm transition-all duration-200 hover:scale-[0.99]">
                <div>
                    <h1 className="text-base md:text-lg font-bold tracking-tight">{t('trashman.dashboard.greeting', { name: 'Alex' })}</h1>
                    <p className="text-xs opacity-80 mt-1 font-medium">{t('trashman.dashboard.greeting_subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 px-3 py-2 rounded-large flex items-center gap-2 border border-white/20">
                    <Star size={18} defaultColor="#F2C94C"/>
                    <span className="text-xs font-bold whitespace-nowrap">{t('trashman.dashboard.points', { count: 420 })}</span>
                    </div>
                    <button 
                    onClick={handleNotificationClick}
                    className="p-2 bg-white/10 rounded-large hover:bg-white/20 hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                    <Notification size={20} isPressed={false} isDarkTheme={true} />
                    </button>
                </div>
                </header>

                {/* Map View Section */}
                <div className="w-full h-96 rounded-veryLarge border border-secondary overflow-hidden shadow-sm relative group">
                <img 
                    src="https://tile.openstreetmap.org/14/4824/6156.png" 
                    className="bg-white w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    alt="map"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded-medium border border-secondary text-xs font-bold text-primary uppercase tracking-tight">
                    San Francisco District
                </div>
                
                {/* Map Controls */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2">
                    <button
                    onClick={handleZoomIn}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-medium shadow-md flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    >
                    <ZoomIn size={18} defaultColor="#145B47" />
                    </button>
                    <button
                    onClick={handleZoomOut}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-medium shadow-md flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    >
                    <ZoomOut size={18} defaultColor="#145B47" />
                    </button>
                    <button
                    onClick={handleLocate}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-medium shadow-md flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    >
                    <Location size={18} defaultColor="#145B47" />
                    </button>
                </div>
                </div>

                {/* MOBILE/MID QUICK ACTIONS */}
                <div className="lg:hidden space-y-3">
                    <h2 className="text-sm font-bold text-black uppercase tracking-widest pl-1">{t('shared.quick_actions')}</h2>
                    <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar snap-x snap-mandatory">
                        
                        {/* Routes & Timings */}
                        <div 
                            onClick={()=>navigate("route-timings")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <TrashRoute size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('trashman.dashboard.routes_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('trashman.dashboard.routes_sub')}</p>
                            </div>
                        </div>

                        {/* Immediate Tasks */}
                        <div 
                            onClick={()=>navigate("immediate-tasks")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Task size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('trashman.dashboard.tasks_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('trashman.dashboard.tasks_sub')}</p>
                            </div>
                        </div>
                        {/* Attendance */}
                        <div 
                            onClick={()=>navigate("upload-attendance")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Certificate size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('trashman.dashboard.attendance_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('trashman.dashboard.attendance_sub')}</p>
                            </div>
                        </div>
                        {/* Create Feedback Session */}
                        <div 
                            onClick={()=>navigate("create-feedback-session")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <FeedBack size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('trashman.dashboard.feedback_create_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('trashman.dashboard.feedback_create_sub')}</p>
                            </div>
                        </div>
                        
                        {/* Submit feedback to supervisor  */}
                        <div 
                            onClick={()=>navigate("submit-feedback")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <FeedBack size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('trashman.dashboard.feedback_submit_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('trashman.dashboard.feedback_submit_sub')}</p>
                            </div>
                        </div>
                        {/* ID card */}
                        <div 
                            onClick={()=>navigate("id-card")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Certificate size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('shared.id_card_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('trashman.dashboard.id_card_sub')}</p>
                            </div>
                        </div>
                        {/* Quiz */}
                        <div 
                            onClick={()=>navigate("quiz")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Certificate size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('trashman.dashboard.quiz_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('trashman.dashboard.quiz_sub')}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Daily Eco Tip Card - Mobile/Tablet */}
                <div className="lg:hidden bg-white border border-secondary border-l-4 border-l-primary rounded-large p-5 shadow-sm group hover:bg-secondary/40 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-primary/10 rounded-large text-primary transition-transform group-hover:rotate-12">
                        <Add size={18} isPressed={false} isDarkTheme={false} />
                        </div>
                        <h3 className="text-xs font-bold text-black uppercase tracking-tight">{t('shared.daily_eco_tip')}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 font-medium italic">
                        "{t('trashman.dashboard.eco_tip_text')}"
                    </p>
                </div>

            </div>

            {/* RIGHT COLUMN: Sticky Sidebar Actions */}
            <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-6 space-y-5">
                
                {/* Quick Actions Card */}
                <div className="bg-white border border-secondary rounded-large p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                    <h2 className="text-xs font-bold text-black uppercase tracking-widest">{t('shared.quick_actions')}</h2>
                    </div>
                    
                    <div className="space-y-3">
                        {/* Attendance */}
                        <div 
                            onClick={()=>navigate("upload-attendance")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Certificate size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('trashman.dashboard.attendance_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('trashman.dashboard.attendance_sub')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* Routes & Timings */}
                        <div 
                            onClick={()=>navigate("route-timings")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <TrashRoute size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('trashman.dashboard.routes_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('trashman.dashboard.routes_sub')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* Immediate Tasks */}
                        <div 
                            onClick={()=>navigate("immediate-tasks")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Task size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('trashman.dashboard.tasks_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('trashman.dashboard.tasks_sub')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* Create Feedback Session */}
                        <div 
                            onClick={()=>navigate("create-feedback-session")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <FeedBack size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('trashman.dashboard.feedback_create_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('trashman.dashboard.feedback_create_sub')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* submit Feedback for Supervisor */}
                        <div 
                            onClick={()=>navigate("submit-feedback")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <FeedBack size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('trashman.dashboard.feedback_submit_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('trashman.dashboard.feedback_submit_sub_long')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* ID card */}
                        <div 
                            onClick={()=>navigate("id-card")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Certificate size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('shared.id_card_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('shared.view_id_card')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* Quiz */}
                        <div 
                            onClick={()=>navigate("quiz")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Certificate size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('trashman.dashboard.quiz_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('trashman.dashboard.quiz_sub')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>
                    </div>
                </div>

                {/* Daily Eco Tip Card */}
                <div className="bg-white border border-secondary border-l-4 border-l-primary rounded-large p-5 shadow-sm group hover:bg-secondary/40 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-primary/10 rounded-large text-primary transition-transform group-hover:rotate-12">
                        <Add size={18} isPressed={false} isDarkTheme={false} />
                    </div>
                    <h3 className="text-xs font-bold text-black uppercase tracking-tight">{t('shared.daily_eco_tip')}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 font-medium italic">
                    "{t('trashman.dashboard.eco_tip_text')}"
                    </p>
                </div>

                {/* Support Action */}
                <button 
                    onClick={function () {
                    ToastNotification(t('shared.contact_support_toast'), "info");
                    }}
                    className="w-full py-3.5 bg-secondary border border-primary/10 rounded-large text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary hover:text-white hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                >
                    {t('shared.contact_support')}
                </button>
                </div>
            </div>

            </div>
        </div>
        <ToastContainer/>
        </div>
    );
}

export default TrashManDashboard;