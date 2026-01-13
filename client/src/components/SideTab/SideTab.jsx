import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
Home, 
Map, 
Camera, 
Stats, 
Task, 
FeedBack, 
Settings, 
LogOut,
Add,
People,
Certificate,
Notification,
Search,
TrashRoute
} from "../../assets/icons/icons";
import ThemeStore from "../../store/ThemeStore";

// Mock Data for Profile
const mockProfile = {
avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
notifications: 3
};

/**
 * Internal Mobile Bottom Navigation Component
 */
function BottomNav({ user, menuItems, isActive }) {
const navigate = useNavigate();

// Filter menu items to only show those with showMobile: true
const mobileMenuItems = menuItems.filter(item => item.showMobile === true);

function handleNavigation(path) {
navigate(path === "" ? "/" : `/${path}`);
}

return (
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-secondary shadow-[0_-8px_30px_rgba(0,0,0,0.08)] h-20 px-4 flex items-center justify-around z-50">
    {mobileMenuItems.map(function(item) {
    const active = isActive(item.id);
    const Icon = item.icon;

    return (
        <button
        key={item.label}
        onClick={function() { handleNavigation(item.id); }}
        className="flex flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-90 relative"
        >
        <div className={`transition-colors duration-300 ${active ? "text-primaryLight" : "text-primary"}`}>
            <Icon 
            isPressed={active} 
            isDarkTheme={false} 
            defaultColor={active ? "#1E8E54" : "#145B47"} 
            />
        </div>
        <span className={`text-[10px] font-bold  tracking-widest transition-colors duration-300 ${active ? "text-primaryLight" : "text-gray-400"}`}>
            {item.label}
        </span>
        {active && (
            <div className="absolute -top-2.5 w-5 h-1 bg-primaryLight rounded-full" />
        )}
        </button>
    );
    })}
</nav>
);
}

/**
 * Main SideTab Component (Responsive Wrapper)
 */
function SideTab({ user }) {
const navigate = useNavigate();
const location = useLocation();
const { isDarkTheme } = ThemeStore();

const menuConfig = {
Resident: [
    { id: "", label: "Home", icon: Home, showMobile: true },
    { id: "map", label: "Map", icon: Map, showMobile: true },
    { id: "route-timings", label: "Routes & timings", icon: TrashRoute, showMobile: false },
    { id: "report-trash", label: "Report", icon: Camera, showMobile: true },
    { id: "my-stats", label: "Statistics", icon: Stats, showMobile: true },
    { id: "quiz", label: "Quiz", icon: Certificate, showMobile: true },
    { id: "submit-feedback", label: "Feedback", icon: FeedBack, showMobile: false },
    { id: "settings", label: "Settings", icon: Settings, showMobile: true },
],
TrashMan: [
    { id: "", label: "Home", icon: Home, showMobile: true },
    { id: "upload-attendance", label: "Attendance", icon: People, showMobile: true },
    { id: "create-feedback-session", label: "Create Feedback session", icon: FeedBack, showMobile: true },
    { id: "submit-feedback", label: "Submit Feedback", icon: FeedBack, showMobile: true },
    { id: "immediate-tasks", label: "Immediate tasks", icon: Task, showMobile: true },
    { id: "route-timings", label: "Routes & timings", icon: Map, showMobile: true },
    { id: "my-stats", label: "Stats", icon: Stats, showMobile: true },
    { id: "quiz", label: "Quiz", icon:Certificate, showMobile: false },
    { id: "settings", label: "Settings", icon: Settings, showMobile: true },
],
SuperVisor: [
    { id: "", label: "Home", icon: Home, showMobile: true },
    { id: "search-workers", label: "Search", icon: Search, showMobile: true },
    { id: "attendance", label: "Attendance", icon: People, showMobile: true },
    { id: "all-tasks", label: "Tasks", icon: Task, showMobile: true },
    { id: "create-feedback-session", label: "Create feedback", icon:FeedBack, showMobile: true },
    { id: "submit-feedback", label: "submit feedback", icon: FeedBack, showMobile: true },
    { id: "settings", label: "Settings", icon: Settings, showMobile: true },
    { id: "my-stats", label: "Stats", icon: Stats, showMobile: true },
],
SanitaryInspector: [
    { id: "", label: "Home", icon: Home, showMobile: true },
    { id: "search-workers", label: "Search", icon: Search, showMobile: true },
    { id: "attendance", label: "Attendance", icon: People, showMobile: true },
    { id: "all-tasks", label: "Tasks", icon: Task, showMobile: true },
    { id: "create-feedback-session", label: "Create feedback", icon:FeedBack, showMobile: true },
    { id: "submit-feedback", label: "submit feedback", icon: FeedBack, showMobile: true },
    { id: "settings", label: "Settings", icon: Settings, showMobile: true },
    { id: "overall-stats", label: "overall stats", icon: Stats, showMobile: true },
],
MHO: [
    { id: "", label: "Home", icon: Home, showMobile: true },
    { id: "immediate-tasks", label: "Tasks", icon: Task, showMobile: true },
    { id: "my-stats", label: "Stats", icon: Stats, showMobile: true },
    { id: "zones", label: "Zones", icon: Map, showMobile: true },
    { id: "settings", label: "Settings", icon: Settings, showMobile: true },
]
};

const menuItems = menuConfig[user?.role] || [];

function handleNavigation(path) {
navigate(path === "" ? "/" : `/${path}`);
}

function isActive(path) {
const currentPath = location.pathname.split("/")[1] || "";
return currentPath === path;
}

function getPageTitle() {
const path = location.pathname.split("/")[1] || "";
const currentItem = menuItems.find(function(item) { return item.id === path; });
return currentItem ? currentItem.label : "Dashboard";
}

return (
<div>
<div className="flex h-screen overflow-hidden">
    {/* DESKTOP SIDEBAR - Background updated to primary */}
    <aside className="hidden md:flex w-64 h-full bg-primary border-r border-primary flex-col z-20 shrink-0 transition-all duration-300">
    
    {/* LOGO AREA */}
    <div className="h-20 bg-primary flex items-center gap-3 px-6 shrink-0 shadow-md">
        <div className="transition-transform hover:rotate-12 duration-300">
        <Add defaultColor={"white"} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">CleanCity</h1>
    </div>

    {/* NAV LINKS - Hover updated to secondary */}
    <nav className="flex-1 space-y-2 overflow-y-auto p-4 custom-scrollbar">
        {menuItems.map(function(item) {
        const active = isActive(item.id);
        const Icon = item.icon;

        return (
            <button
            key={item.label}
            onClick={function() { handleNavigation(item.id); }}
            className={`w-full flex items-center gap-4 px-4 py-3 my-4 rounded-lg transition-all duration-300 group ${
                active 
                ? "bg-primaryLight text-white shadow-lg shadow-primary/20 scale-[0.99]" 
                : "hover:bg-secondaryDark hover:cursor-pointer active:scale-95"
            }`}
            >
            <Icon 
                isPressed={active} 
                isDarkTheme={false} 
                defaultColor={active ? "white" : "#ECF7F0"}
                OnpressColor="white"
                DarkThemeColor="white"
            />
            <span className={`text-sm font-semibold ${active ? "text-white" : "text-secondary"}`}>
                {item.label}
            </span>
            </button>
        );
        })}
    </nav>

    {/* BOTTOM LOGOUT */}
    <div className="w-full py-5 border-t border-primaryLight flex justify-baseline items-center shrink-0">
        <button 
        onClick={function() { navigate("/login"); }}
        className="flex items-center gap-3 px-8 py-2 rounded-xl text-error hover:cursor-pointer transition-colors"
        >
        <LogOut 
            isPressed={false} 
            isDarkTheme={false}
            defaultColor="currentColor"
        />
        <span className="text-sm font-bold">Logout</span>
        </button>
    </div>
    </aside>

    {/* RIGHT SIDE WRAPPER */}
    <div className="flex-1 flex flex-col h-full overflow-hidden">
    
    {/* TOP HEADER */}
    <header className={`${isDarkTheme && "dark"} h-20  bg-white border-b border-secondary px-4 md:px-8 flex items-center justify-between z-10 shadow-sm shrink-0`}>
        <div className="flex items-center gap-2 md:gap-4">
        <h2 className="text-lg md:text-xl font-bold text-primary tracking-tight truncate">
            {getPageTitle()}
        </h2>
        <div className="h-6 w-0.5 bg-secondary mx-1 md:mx-2" />
        <span className="text-[10px] md:text-xs font-bold text-primaryLight bg-secondary px-3 py-1 rounded-full uppercase tracking-wider">
            {user?.role}
        </span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
        <button className="p-2 hover:bg-secondary rounded-full transition-colors relative">
            <Notification isPressed={false} isDarkTheme={isDarkTheme} defaultColor="black" />
            {mockProfile.notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white">
                {mockProfile.notifications}
            </span>
            )}
        </button>

        <div 
            onClick={function() { navigate("settings"); }} 
            className="flex items-center gap-3 pl-2 md:pl-4 border-l border-secondaryLight hover:cursor-pointer"
        >
            <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-primary leading-none mb-1">{user?.name}</p>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">View Profile</p>
            </div>
            <div className="relative group cursor-pointer transition-transform active:scale-95">
            <img 
                src={mockProfile.avatar} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-primaryLight p-0.5"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-white rounded-full" />
            </div>
        </div>
        </div>
    </header>

    {/* MAIN CONTENT AREA */}
    <main className={`flex-1 overflow-auto bg-background p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar ${isDarkTheme ? "dark" : ""}`}>
        <div className="animate-fade-in max-w-7xl mx-auto">
        <Outlet />
        </div>
    </main>

    {/* MOBILE BOTTOM NAV */}
    <BottomNav 
        user={user} 
        menuItems={menuItems} 
        isActive={isActive} 
    />
    </div>
</div>
</div>
);
}

export default SideTab;