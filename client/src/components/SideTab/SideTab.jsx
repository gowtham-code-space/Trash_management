import React, { useState, useEffect } from "react";
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
TrashRoute,
QR,
ZoomIn,
Configure,
IdCard
} from "../../assets/icons/icons";
import ThemeStore from "../../store/ThemeStore";
import { clearSession } from "../../services/session";
import { api } from "../../services/apiMethods";

// Role ID to Role Name mapping
function getRoleNameFromId(roleId) {
    const roleMap = {
        1: "Resident",
        2: "TrashMan",
        3: "SuperVisor",
        4: "SanitaryInspector",
        5: "MHO",
        6: "Commissioner"
    };
    return roleMap[roleId] || "Resident";
}

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
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-darkSurface border-t border-secondary dark:border-darkBorder shadow-[0_-8px_30px_rgba(0,0,0,0.08)] h-20 px-4 flex items-center justify-around z-50">
    {mobileMenuItems.map(function(item) {
    const active = isActive(item.id);
    const isHighlighted = item.isHighlighted || false;
    const Icon = item.icon;

    return (
        <button
        key={item.label}
        onClick={function() { handleNavigation(item.id); }}
        className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 active:scale-90 relative ${
            isHighlighted ? "-translate-y-4" : ""
        }`}
        >
        <div className={`transition-all duration-300 ${
            isHighlighted 
            ? "w-16 h-16 bg-primaryLight rounded-full flex items-center justify-center shadow-lg shadow-primaryLight/30 scale-110" 
            : active 
            ? "text-primaryLight" 
            : "text-primary dark:text-darkTextSecondary"
        }`}>
            <div className={isHighlighted ? "text-white scale-125" : ""}>
                <Icon 
                isPressed={active || isHighlighted} 
                isDarkTheme={false} 
                defaultColor={isHighlighted ? "white" : active ? "#1E8E54" : "#145B47"}
                OnpressColor={isHighlighted ? "white" : "#1E8E54"}
                />
            </div>
        </div>
        <span className={`text-[10px] font-bold tracking-widest transition-colors duration-300 ${
            isHighlighted 
            ? "text-primaryLight" 
            : active 
            ? "text-primaryLight" 
            : "text-gray-400 dark:text-darkTextSecondary"
        }`}>
            {item.mobileLabel || item.label}
        </span>
        {active && !isHighlighted && (
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
const [userDetails, setUserDetails] = useState(null);
const [isLoadingUser, setIsLoadingUser] = useState(true);

// Fetch user details on mount
useEffect(function() {
    async function fetchUserDetails() {
        if (!user || !user.user_id) {
            setIsLoadingUser(false);
            return;
        }
        
        try {
            const response = await api.get(`/auth/user/${user.user_id}`);
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setIsLoadingUser(false);
        }
    }
    
    fetchUserDetails();
}, [user?.user_id]);

const menuConfig = {
Resident: [
    { id: "", label: "Home", mobileLabel: "Home", icon: Home, showMobile: true, isHighlighted: false },
    { id: "map", label: "Map", mobileLabel: "Map", icon: Map, showMobile: true, isHighlighted: false },
    { id: "submit-feedback", label: "Feedback", mobileLabel: "Feedback", icon: QR, showMobile: true, isHighlighted: true },
    { id: "route-timings", label: "Routes & Timings", mobileLabel: "Routes", icon: TrashRoute, showMobile: false, isHighlighted: false },
    { id: "report-trash", label: "Report", mobileLabel: "Report", icon: Camera, showMobile: false, isHighlighted: false },
    { id: "my-stats", label: "Statistics", mobileLabel: "Stats", icon: Stats, showMobile: true, isHighlighted: false },
    { id: "quiz", label: "Quiz", mobileLabel: "Quiz", icon: Certificate, showMobile: false, isHighlighted: false },
    { id: "settings", label: "Settings", mobileLabel: "Settings", icon: Settings, showMobile: true, isHighlighted: false },
],
TrashMan: [
    { id: "", label: "Home", mobileLabel: "Home", icon: Home, showMobile: true, isHighlighted: false },
    { id: "upload-attendance", label: "Attendance", mobileLabel: "Attendance", icon: People, showMobile: true, isHighlighted: false },
    { id: "create-feedback-session", label: "Scan & share", mobileLabel: "Create", icon: ZoomIn, showMobile: true, isHighlighted: true },
    { id: "immediate-tasks", label: "Immediate Tasks", mobileLabel: "Tasks", icon: Task, showMobile: false, isHighlighted: false },
    { id: "route-timings", label: "Routes & Timings", mobileLabel: "Routes", icon: Map, showMobile: false, isHighlighted: false },
    { id: "my-stats", label: "Stats", mobileLabel: "Stats", icon: Stats, showMobile: true, isHighlighted: false },
    { id: "settings", label: "Settings", mobileLabel: "Settings", icon: Settings, showMobile: true, isHighlighted: false },
],
SuperVisor: [
    { id: "", label: "Home", mobileLabel: "Home", icon: Home, showMobile: true, isHighlighted: false },
    { id: "search-workers", label: "Search", mobileLabel: "Search", icon: Search, showMobile: true, isHighlighted: false },
    { id: "attendance", label: "Attendance", mobileLabel: "Attendance", icon: People, showMobile: false, isHighlighted: false },
    { id: "all-tasks", label: "Tasks", mobileLabel: "Tasks", icon: Task, showMobile: false, isHighlighted: false },
    { id: "create-feedback-session", label: "Create Feedback", mobileLabel: "Create", icon:ZoomIn, showMobile: true, isHighlighted: true },
    { id: "submit-feedback", label: "Submit Feedback", mobileLabel: "Feedback", icon: FeedBack, showMobile: false, isHighlighted: false },
    { id: "my-stats", label: "Stats", mobileLabel: "Stats", icon: Stats, showMobile: true, isHighlighted: false },
    { id: "settings", label: "Settings", mobileLabel: "Settings", icon: Settings, showMobile: true, isHighlighted: false },
],
SanitaryInspector: [
    { id: "", label: "Home", mobileLabel: "Home", icon: Home, showMobile: true, isHighlighted: false },
    { id: "search-workers", label: "Search", mobileLabel: "Search", icon: Search, showMobile: false, isHighlighted: false },
    { id: "attendance", label: "Attendance", mobileLabel: "Attendance", icon: People, showMobile: false, isHighlighted: false },
    { id: "all-tasks", label: "Tasks", mobileLabel: "Tasks", icon: Task, showMobile: true, isHighlighted: false },
    { id: "create-feedback-session", label: "Create Feedback", mobileLabel: "Create", icon:ZoomIn, showMobile: true, isHighlighted: true },
    { id: "config-route", label: "configure route", mobileLabel: "configure", icon:Configure, showMobile: false, isHighlighted: false },
    { id: "overall-stats", label: "Overall Stats", mobileLabel: "Stats", icon: Stats, showMobile: true, isHighlighted: false },
    { id: "settings", label: "Settings", mobileLabel: "Settings", icon: Settings, showMobile: true, isHighlighted: false },
],
MHO: [
    { id: "", label: "Home", mobileLabel: "Home", icon: Home, showMobile: true, isHighlighted: false },
    { id: "all-tasks", label: "Tasks", mobileLabel: "Tasks", icon: Task, showMobile: true, isHighlighted: false },
    //{ id: "my-stats", label: "Stats", mobileLabel: "Stats", icon: Stats, showMobile: true, isHighlighted: false },
    //{ id: "zones", label: "Zones", mobileLabel: "Zones", icon: Map, showMobile: true, isHighlighted: false },
    { id: "id-card", label: "Id Card", mobileLabel: "Id card", icon: IdCard, showMobile: true, isHighlighted: false },
    { id: "quiz", label: "Quiz", mobileLabel: "Quiz", icon: Certificate, showMobile: true, isHighlighted: false },
    { id: "settings", label: "Settings", mobileLabel: "Settings", icon: Settings, showMobile: true, isHighlighted: false },
],
Commissioner:[
    { id: "", label: "Home", mobileLabel: "Home", icon: Home, showMobile: true, isHighlighted: false },
    { id: "config-district", label: "Configure district", mobileLabel: "config", icon: Configure, showMobile: true, isHighlighted: false },
    { id: "appoint-employees", label: "Appoint employees", mobileLabel: "Appoint", icon: People, showMobile: true, isHighlighted: false },
    { id: "id-card", label: "Id Card", mobileLabel: "Id card", icon: IdCard, showMobile: true, isHighlighted: false },
    { id: "quiz", label: "Quiz", mobileLabel: "Quiz", icon: Certificate, showMobile: true, isHighlighted: false },
    { id: "settings", label: "Settings", mobileLabel: "Settings", icon: Settings, showMobile: true, isHighlighted: false },
],
};

// Get role name from role_id
const roleName = user?.role_id ? getRoleNameFromId(user.role_id) : (user?.role || "Resident");
const menuItems = menuConfig[roleName] || [];

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
        onClick={async function() { 
            try {
                // Call backend to clear HttpOnly refresh token cookie
                await api.post("/auth/logout");
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                // Clear memory state regardless of backend response
                clearSession();
                navigate("/login"); 
            }
        }}
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
            {roleName}
        </span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
        <button className="p-2 hover:bg-secondary rounded-full transition-colors relative">
            <Notification isPressed={false} isDarkTheme={isDarkTheme} defaultColor="black" />
        </button>

        <div 
            onClick={function() { navigate("settings"); }} 
            className="flex items-center gap-3 pl-2 md:pl-4 border-l border-secondaryLight hover:cursor-pointer"
        >
            <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-primary leading-none mb-1">
                {isLoadingUser ? 'Loading...' : (
                    userDetails?.first_name ? `${userDetails.first_name} ${userDetails.last_name || ''}`.trim() : userDetails?.email || 'User'
                )}
            </p>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">View Profile</p>
            </div>
            <div className="relative group cursor-pointer transition-transform active:scale-95">
            <img 
                src={userDetails?.profile_pic || "https://res.cloudinary.com/do7fy5b0l/image/upload/v1771158049/avator_placeholder_ijsokb.png"} 
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