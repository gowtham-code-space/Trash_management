import React, { useState } from "react";
import { 
    Notification, 
    Camera, 
    QR, 
    Certificate, 
    Star,
    Add,
    RightArrow,
    Check,
    TrashRoute,
    ZoomIn,
    ZoomOut,
    Expand
} from "../../assets/icons/icons";
import MyReports from "../../components/Cards/Residents/MyReports";
import Pagination from "../../utils/Pagination";
import { useNavigate } from "react-router-dom";
import ThemeStore from "../../store/ThemeStore";
import ToastNotification from "../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";

// Mock Data declared at component top level
const mockReports = [
    { id: 1, title: "Overflowing public bin", time: "Today - 7:32 AM", location: "3rd Street Park", status: "Pending", image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=200" },
    { id: 2, title: "Plastic near riverbank", time: "Yesterday", location: "Riverside Lane", status: "Critical", image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=200" },
    { id: 3, title: "Alleyway cleaned", time: "Mon", location: "Old Town Alley", status: "Resolved", image: "https://images.unsplash.com/photo-1516992654410-9309d4587e94?w=200" },
    { id: 4, title: "Broken Streetlight", time: "2 days ago", location: "North Ave", status: "Pending", image: "https://images.unsplash.com/photo-1517495306684-24558509c314?w=200" },
    { id: 5, title: "Industrial Leakage", time: "Wed", location: "Dockyard", status: "Critical", image: "https://images.unsplash.com/photo-1605600611221-1ae2e1ffb171?w=200" },
    { id: 6, title: "Drainage Blockage", time: "Thu", location: "Market St", status: "Pending", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200" },
    { id: 7, title: "Park Maintenance", time: "Fri", location: "East Park", status: "Resolved", image: "https://images.unsplash.com/photo-1516992654410-9309d4587e94?w=200" }
];

function Home() {
    const navigate = useNavigate();
    const { isDarkTheme } = ThemeStore();
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    function handleZoomIn() {
        ToastNotification("Zooming in", "info");
    }

    function handleZoomOut() {
        ToastNotification("Zooming out", "info");
    }

    function handleExpandMap() {
        setIsMapExpanded(!isMapExpanded);
        ToastNotification(isMapExpanded ? "Map view minimized" : "Map view expanded", "info");
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="min-h-screen bg-background animate-in fade-in duration-700 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: Main Feed */}
            <div className="lg:col-span-2 space-y-6">
            {/* Map View Section */}
            <div className="w-full h-80 rounded-veryLarge border border-secondary overflow-hidden shadow-sm relative group">
                <img 
                src="https://tile.openstreetmap.org/14/4824/6156.png" 
                className="bg-white w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="map"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded-medium border border-secondary text-xs font-bold text-primary uppercase tracking-tight">
                San Francisco District
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
                </div>
            </div>

            {/* MOBILE/MID QUICK ACTIONS */}
            <div className="lg:hidden space-y-3">
                <h2 className="text-sm font-bold text-black uppercase tracking-widest pl-1">Quick actions</h2>
                <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar snap-x snap-mandatory">
                
                {/* Report Trash Action */}
                    <button 
                        onClick={() => navigate("report-trash")} 
                        className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                        <Camera size={22} isPressed={false} defaultColor="#145B47" />
                        </div>
                        <div className="text-center">
                        <p className="text-sm font-bold leading-tight">Report trash</p>
                        <p className="text-xs mt-1 font-medium opacity-80">Photo + location</p>
                        </div>
                    </button>

                    {/* Scan QR Action */}
                    <button 
                        onClick={() => navigate("submit-feedback")} 
                        className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                        <QR size={22} isPressed={false} defaultColor="#145B47" />
                        </div>
                        <div className="text-center">
                        <p className="text-sm font-bold leading-tight">Scan QR</p>
                        <p className="text-xs mt-1 font-medium opacity-80">Rate Trashman</p>
                        </div>
                    </button>
                    {/* Routes & Timings */}
                    <button 
                        onClick={() => navigate("route-timings")} 
                        className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                        <TrashRoute size={22} isPressed={false} defaultColor="#145B47" />
                        </div>
                        <div className="text-center">
                        <p className="text-sm font-bold leading-tight">Route & Timings</p>
                        <p className="text-xs mt-1 font-medium opacity-80">Open Routes</p>
                        </div>
                    </button>
                    {/* Quiz Action */}
                    <button 
                        onClick={() => navigate("quiz")} 
                        className="hover:bg-primary hover:text-white bg-white shrink-0 w-40 h-36 rounded-large p-4 flex flex-col justify-center items-center text-left snap-start transition-all duration-200 hover:scale-[0.99] active:scale-[0.99] shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                        <Certificate size={22} isPressed={false} defaultColor="#145B47" />
                        </div>
                        <div className="text-center">
                        <p className="text-sm font-bold leading-tight">Quiz</p>
                        <p className="text-xs mt-1 font-medium opacity-80">Earn points</p>
                        </div>
                    </button>

                </div>
            </div>

            {/* Reports Section */}
            <section className="bg-white border border-secondary rounded-large p-5 shadow-sm">
                <h2 className="text-sm font-bold text-black uppercase tracking-widest mb-4">Recent Reports</h2>
                <Pagination 
                data={mockReports}
                itemsPerPage={5}
                renderItem={function(report) {
                    return <MyReports key={report.id} report={report} />;
                }}
                />
            </section>
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
                    <button onClick={()=>navigate("report-trash")} className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                        <Camera size={18} isPressed={false} isDarkTheme={true} />
                        </div>
                        <div className="text-left">
                        <p className="text-xs font-bold text-black tracking-tight">Report trash</p>
                        <p className="text-xs text-gray-500 font-medium">Snap and pin concern</p>
                        </div>
                    </div>
                    <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                    </button>

                    <button onClick={()=>navigate("submit-feedback")} className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                        <QR size={18} isPressed={false} isDarkTheme={true} />
                        </div>
                        <div className="text-left">
                        <p className="text-xs font-bold text-black tracking-tight">Scan QR Code</p>
                        <p className="text-xs text-gray-500 font-medium">Verify collection</p>
                        </div>
                    </div>
                    <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                    </button>
                    <button onClick={()=>navigate("route-timings")} className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                        <TrashRoute size={18} isPressed={false} isDarkTheme={true} />
                        </div>
                        <div className="text-left">
                        <p className="text-xs font-bold text-black tracking-tight">Routes & Timings</p>
                        <p className="text-xs text-gray-500 font-medium">Live Track the Trash truck</p>
                        </div>
                    </div>
                    <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                    </button>

                    <button onClick={()=>navigate("quiz")} className="w-full flex items-center justify-between p-3.5 bg-white border border-secondary rounded-large hover:border-primaryLight hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-large shadow-sm group-hover:bg-primaryLight transition-colors">
                        <Certificate size={18} isPressed={false} isDarkTheme={true} />
                        </div>
                        <div className="text-left">
                        <p className="text-xs font-bold text-black tracking-tight">Eco Quiz</p>
                        <p className="text-xs text-gray-500 font-medium">Earn daily points</p>
                        </div>
                    </div>
                    <RightArrow size={14} isPressed={false} isDarkTheme={false} />
                    </button>
                </div>
                </div>

                {/* Daily Eco Tip Card */}
                <div className="bg-white border border-secondary border-l-4 border-l-primary rounded-large p-5 shadow-sm group hover:bg-secondary/40 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-primary/10 rounded-large text-primary transition-transform group-hover:rotate-12">
                    <Add size={18} isPressed={false} isDarkTheme={false} />
                    </div>
                    <h3 className="text-xs font-bold text-black uppercase tracking-tight">Daily eco tip</h3>
                </div>
                <p className="text-xs leading-relaxed text-gray-700 font-medium italic">
                    "Carry a reusable bottle today and avoid using at least 3 plastic bottles."
                </p>
                </div>

                {/* Support Action */}
                <button className="w-full py-3.5 bg-secondary border border-primary/10 rounded-large text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary hover:text-white hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm">
                Need Help? Contact Support
                </button>
            </div>
            </div>

        </div>
        </div>
        <ToastContainer />
        </div>
    );
    }

export default Home;