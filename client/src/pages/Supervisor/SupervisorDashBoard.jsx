import React, { useState } from "react";
import {
    ZoomIn,
    ZoomOut,
    Location,
    Certificate,
    People,
    Notification,
    RightArrow,
    Add,
    Expand,
    Task,
    Search,
    FeedBack
} from "../../assets/icons/icons";
import ToastNotification from "../../components/Notification/ToastNotification";
import ThemeStore from "../../store/ThemeStore";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

function SupervisorDashboard() {
    const navigate = useNavigate();
    const { isDarkTheme } = ThemeStore();
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const { t } = useTranslation('pages');

    function handleGenerateReport() {
        ToastNotification(t('supervisor.dashboard.toast_report'), "info");
    }

    function handleBroadcastAlert() {
        ToastNotification(t('supervisor.dashboard.toast_broadcast'), "info");
    }

    function handleManageShifts() {
        ToastNotification(t('supervisor.dashboard.toast_shifts'), "info");
    }

    function handleEmergencyStop() {
        ToastNotification(t('supervisor.dashboard.toast_emergency'), "warning");
    }

    function handleNotificationClick() {
        ToastNotification(t('supervisor.dashboard.toast_notifications', { count: 5 }), "info");
    }

    function handleZoomIn() {
        ToastNotification(t('shared.zoom_in_toast'), "info");
    }

    function handleZoomOut() {
        ToastNotification(t('shared.zoom_out_toast'), "info");
    }

    function handleLocate() {
        ToastNotification(t('supervisor.dashboard.toast_locate'), "info");
    }

    function handleExpandMap() {
        setIsMapExpanded(!isMapExpanded);
        ToastNotification(isMapExpanded ? t('shared.map_minimized') : t('shared.map_expanded'), "info");
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="min-h-screen bg-background animate-in fade-in duration-700 pb-20 lg:pb-0">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: Main Feed */}
            <div className="lg:col-span-2 space-y-6">
                {/* Statistics Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Collectors */}
                    <div className="bg-secondary border border-secondary rounded-large p-5 shadow-sm hover:scale-[0.99] transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('supervisor.dashboard.total_collectors')}</p>
                            <People size={18} defaultColor="#145B47" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">32</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <p className="text-xs font-medium text-primary">{t('supervisor.dashboard.full_staff_assigned')}</p>
                        </div>
                    </div>

                    {/* Attendance Today */}
                    <div className="bg-secondary border border-secondary rounded-large p-5 shadow-sm hover:scale-[0.99] transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('shared.attendance_today')}</p>
                            <Certificate size={18} defaultColor="#145B47" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">
                            29<span className="text-sm text-gray-400">/32</span>
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                            <p className="text-xs font-medium text-yellow-600">{t('shared.absent_count', { count: 3 })}</p>
                        </div>
                    </div>

                    {/* Pending Complaints */}
                    <div className="bg-secondary border border-secondary rounded-large p-5 shadow-sm hover:scale-[0.99] transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('supervisor.dashboard.pending_complaints')}</p>
                            <Task size={18} defaultColor="#145B47" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">5</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <p className="text-xs font-medium text-red-500">{t('shared.overdue_count', { count: 2 })}</p>
                        </div>
                    </div>
                </div>

                {/* Map View Section */}
                <div className="w-full h-96 rounded-veryLarge border border-secondary overflow-hidden shadow-sm relative group">
                <img 
                    src="https://tile.openstreetmap.org/14/4824/6156.png" 
                    className="bg-white w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    alt="map"
                />
                
                {/* Live Satellite View Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-medium border border-secondary flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-bold text-primary uppercase tracking-tight">{t('shared.live_satellite_view')}</p>
                </div>

                {/* Expand Button */}
                <button
                    onClick={handleExpandMap}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-medium border border-secondary flex items-center gap-2 hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <Expand size={14} defaultColor="#145B47" />
                    <p className="text-xs font-bold text-primary uppercase tracking-tight">{t('shared.expand')}</p>
                </button>
                
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
                        
                        {/* Mark attendance */}
                        <div 
                            onClick={()=>navigate("attendance")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <People size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('supervisor.dashboard.mark_attendance_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('supervisor.dashboard.mark_attendance_sub')}</p>
                            </div>
                        </div>

                        {/*Immediate Tasks*/}
                        <div 
                            onClick={()=>navigate("all-tasks")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Task size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('supervisor.dashboard.tasks_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('supervisor.dashboard.tasks_sub')}</p>
                            </div>
                        </div>

                        {/*Search Trashmen*/}
                        <div 
                            onClick={()=>navigate("search-workers")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Search size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('supervisor.dashboard.search_trashmen_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('supervisor.dashboard.search_trashmen_sub')}</p>
                            </div>
                        </div>

                        {/*create feedback session to trashmen*/}
                        <div 
                            onClick={()=>navigate("create-feedback-session")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <FeedBack size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('supervisor.dashboard.feedback_create_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('supervisor.dashboard.feedback_create_sub')}</p>
                            </div>
                        </div>

                        {/*submit feedback to sanitary inpector*/}
                        <div 
                            onClick={()=>navigate("submit-feedback")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <FeedBack size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('supervisor.dashboard.feedback_submit_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('supervisor.dashboard.feedback_submit_sub')}</p>
                            </div>
                        </div>

                        {/*Quiz*/}
                        <div 
                            onClick={()=>navigate("take-quiz")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Task size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('supervisor.dashboard.quiz_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('supervisor.dashboard.quiz_sub')}</p>
                            </div>
                        </div>

                        {/* My Id card */}
                        <div 
                            onClick={()=>navigate("id-card")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Certificate size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">{t('shared.id_card_label')}</p>
                                <p className="text-xs mt-1 font-medium opacity-80">{t('supervisor.dashboard.id_card_sub')}</p>
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
                        "{t('supervisor.dashboard.eco_tip_text')}"
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
                        {/* Mark Attendance */}
                        <div 
                            onClick={()=>navigate("attendance")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <People size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('supervisor.dashboard.mark_attendance_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('supervisor.dashboard.mark_attendance_sub')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* Immediate Tasks */}
                        <div 
                            onClick={()=>navigate("all-tasks")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Notification size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('supervisor.dashboard.tasks_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('supervisor.dashboard.tasks_sub')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* Search Trashmen */}
                        <div 
                            onClick={()=>navigate("search-workers")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Search size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('supervisor.dashboard.search_trashmen_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('supervisor.dashboard.search_trashmen_sub')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/*create feedback session for trashmen*/}
                        <div 
                            onClick={()=>navigate("create-feedback-session")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Task size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('supervisor.dashboard.feedback_create_label_long')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('supervisor.dashboard.feedback_create_sub_long')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/*Submit feedback for Sanitary inspector*/}
                        <div 
                            onClick={()=>navigate("submit-feedback")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Task size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">{t('supervisor.dashboard.feedback_submit_label')}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t('supervisor.dashboard.feedback_submit_sub_long')}</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* ID Card */}
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
                                    <p className="text-xs text-gray-500 font-medium">{t('shared.checkout_id_card')}</p>
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
                    "{t('supervisor.dashboard.eco_tip_text')}"
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

export default SupervisorDashboard;


