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

function InspectorDashboard() {
    const navigate = useNavigate();
    const { isDarkTheme } = ThemeStore();
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [selectedView, setSelectedView] = useState("trashmen"); // "trashmen" or "supervisors"

    function handleNotificationClick() {
        ToastNotification("You have 5 new notifications", "info");
    }

    function handleZoomIn() {
        ToastNotification("Zooming in", "info");
    }

    function handleZoomOut() {
        ToastNotification("Zooming out", "info");
    }

    function handleLocate() {
        ToastNotification("Locating inspector position", "info");
    }

    function handleExpandMap() {
        setIsMapExpanded(!isMapExpanded);
        ToastNotification(isMapExpanded ? "Map view minimized" : "Map view expanded", "info");
    }

    function handleViewSwitch(view) {
        setSelectedView(view);
        ToastNotification(`Switched to ${view} view`, "info");
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="min-h-screen bg-background animate-in fade-in duration-700 pb-20 lg:pb-0">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: Main Feed */}
            <div className="lg:col-span-2 space-y-6">
                {/* View Toggle */}
                <div className="bg-white border border-secondary rounded-large p-2 shadow-sm flex gap-2">
                    <button
                        onClick={() => handleViewSwitch("trashmen")}
                        className={`flex-1 px-4 py-2.5 rounded-medium text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                            selectedView === "trashmen"
                                ? "bg-primary text-white"
                                : "bg-transparent text-secondaryDark hover:bg-secondary"
                        }`}
                    >
                        Trashmen
                    </button>
                    <button
                        onClick={() => handleViewSwitch("supervisors")}
                        className={`flex-1 px-4 py-2.5 rounded-medium text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                            selectedView === "supervisors"
                                ? "bg-primary text-white"
                                : "bg-transparent text-secondaryDark hover:bg-secondary"
                        }`}
                    >
                        Supervisors
                    </button>
                </div>

                {/* Statistics Cards Row - Dynamic based on view */}
                {selectedView === "trashmen" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Trashmen */}
                        <div className="bg-secondary border border-secondary rounded-large p-5 shadow-sm hover:scale-[0.99] transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Trashmen</p>
                                <People size={18} defaultColor="#145B47" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">128</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                <p className="text-xs font-medium text-primary">Across All Zones</p>
                            </div>
                        </div>

                        {/* Attendance Today */}
                        <div className="bg-secondary border border-secondary rounded-large p-5 shadow-sm hover:scale-[0.99] transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Attendance Today</p>
                                <Certificate size={18} defaultColor="#145B47" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">
                                115<span className="text-sm text-gray-400">/128</span>
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                <p className="text-xs font-medium text-yellow-600">13 Absent</p>
                            </div>
                        </div>

                        {/* Pending Tasks */}
                        <div className="bg-secondary border border-secondary rounded-large p-5 shadow-sm hover:scale-[0.99] transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Tasks</p>
                                <Task size={18} defaultColor="#145B47" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">18</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                <p className="text-xs font-medium text-red-500">5 Overdue &gt; 24h</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Supervisors */}
                        <div className="bg-secondary border border-secondary rounded-large p-5 shadow-sm hover:scale-[0.99] transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Supervisors</p>
                                <People size={18} defaultColor="#145B47" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">12</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                <p className="text-xs font-medium text-primary">Managing All Zones</p>
                            </div>
                        </div>

                        {/* Attendance Today */}
                        <div className="bg-secondary border border-secondary rounded-large p-5 shadow-sm hover:scale-[0.99] transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Attendance Today</p>
                                <Certificate size={18} defaultColor="#145B47" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">
                                11<span className="text-sm text-gray-400">/12</span>
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                <p className="text-xs font-medium text-yellow-600">1 Absent</p>
                            </div>
                        </div>

                        {/* Active Reports */}
                        <div className="bg-secondary border border-secondary rounded-large p-5 shadow-sm hover:scale-[0.99] transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Reports</p>
                                <Task size={18} defaultColor="#145B47" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">8</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <p className="text-xs font-medium text-green-600">All On Track</p>
                            </div>
                        </div>
                    </div>
                )}

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
                    <p className="text-xs font-bold text-primary uppercase tracking-tight">Live Satellite View</p>
                </div>

                {/* Expand Button */}
                <button
                    onClick={handleExpandMap}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-medium border border-secondary flex items-center gap-2 hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <Expand size={14} defaultColor="#145B47" />
                    <p className="text-xs font-bold text-primary uppercase tracking-tight">Expand</p>
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
                    <h2 className="text-sm font-bold text-black uppercase tracking-widest pl-1">Quick actions</h2>
                    <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar snap-x snap-mandatory">
                        
                        {/* Search Workers */}
                        <div 
                            onClick={()=>navigate("search-workers")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Search size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">Search Workers</p>
                                <p className="text-xs mt-1 font-medium opacity-80">View all workers</p>
                            </div>
                        </div>

                        {/* View Reports */}
                        <div 
                            onClick={()=>navigate("view-reports")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Task size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">View Reports</p>
                                <p className="text-xs mt-1 font-medium opacity-80">Check all reports</p>
                            </div>
                        </div>

                        {/* Feedback Management */}
                        <div 
                            onClick={()=>navigate("feedback-management")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <FeedBack size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">Feedback Management</p>
                                <p className="text-xs mt-1 font-medium opacity-80">Manage feedback</p>
                            </div>
                        </div>

                        {/* Zone Analytics */}
                        <div 
                            onClick={()=>navigate("zone-analytics")}
                            className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                <Notification size={22} isPressed={false} defaultColor="#145B47" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold leading-tight">Zone Analytics</p>
                                <p className="text-xs mt-1 font-medium opacity-80">View zone stats</p>
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
                                <p className="text-sm font-bold leading-tight">ID card</p>
                                <p className="text-xs mt-1 font-medium opacity-80">Checkout your Id card</p>
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
                        <h3 className="text-xs font-bold text-black uppercase tracking-tight">Inspector tip</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 font-medium italic">
                        "Regular monitoring and feedback improves team efficiency by up to 35%."
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
                    <h2 className="text-xs font-bold text-black uppercase tracking-widest">Quick actions</h2>
                    </div>
                    
                    <div className="space-y-3">
                        {/* Search Workers */}
                        <div 
                            onClick={()=>navigate("search-workers")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Search size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">Search Workers</p>
                                    <p className="text-xs text-gray-500 font-medium">Trashmen & Supervisors</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* View Reports */}
                        <div 
                            onClick={()=>navigate("view-reports")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Task size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">View Reports</p>
                                    <p className="text-xs text-gray-500 font-medium">Check all reports</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* Feedback Management */}
                        <div 
                            onClick={()=>navigate("feedback-management")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <FeedBack size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">Feedback Management</p>
                                    <p className="text-xs text-gray-500 font-medium">Manage all feedback</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>

                        {/* Zone Analytics */}
                        <div 
                            onClick={()=>navigate("zone-analytics")}
                            className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                                    <Notification size={18} isPressed={false} isDarkTheme={true} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-black tracking-tight">Zone Analytics</p>
                                    <p className="text-xs text-gray-500 font-medium">Detailed zone statistics</p>
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
                                    <p className="text-xs font-bold text-black tracking-tight">ID Card</p>
                                    <p className="text-xs text-gray-500 font-medium">Checkout your ID card</p>
                                </div>
                            </div>
                            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                        </div>
                    </div>
                </div>

                {/* Daily Inspector Tip Card */}
                <div className="bg-white border border-secondary border-l-4 border-l-primary rounded-large p-5 shadow-sm group hover:bg-secondary/40 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-primary/10 rounded-large text-primary transition-transform group-hover:rotate-12">
                        <Add size={18} isPressed={false} isDarkTheme={false} />
                    </div>
                    <h3 className="text-xs font-bold text-black uppercase tracking-tight">Inspector tip</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 font-medium italic">
                    "Regular monitoring and feedback improves team efficiency by up to 35%."
                    </p>
                </div>

                {/* Support Action */}
                <button 
                    onClick={function () {
                    ToastNotification("Opening Support Contact", "info");
                    }}
                    className="w-full py-3.5 bg-secondary border border-primary/10 rounded-large text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary hover:text-white hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                >
                    Need Help? Contact Support
                </button>
                </div>
            </div>

            </div>
        </div>
        <ToastContainer/>
        </div>
    );
}

export default InspectorDashboard;
