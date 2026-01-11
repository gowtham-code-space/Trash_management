import React from "react";
import PieChart from "../../components/Statistics/PieChart";
import BarChart from "../../components/Statistics/BarChart";
import Rating from "../../components/Statistics/Rating";
import { Star } from "../../assets/icons/icons";

// Mock Data
const trashmanProfile = {
    profile_pic: null,
    name: "Gowtham CD",
    id: "TM-2024-001",
    role: "TrashMan",
    zone: "Zone A - Block 5",
    joinedDate: "Jan 2024",
    attendance: 92,
    ratings: 4.8,
    tasksCompleted: 142,
    phone: "+91 98765 43210",
    email: "gowtham.cd@trashmanagement.com"
};

// Mock Data
const attendanceData = [
    { name: "Present", value: 92, color: "#1E8E54" },
    { name: "Absent", value: 8, color: "#E5E7EB" },
];

const weeklyRatingData = [
    { week: "Week 1", complaints: 4.2 },
    { week: "Week 2", complaints: 4.5 },
    { week: "Week 3", complaints: 4.6 },
    { week: "Week 4", complaints: 4.8 },
];

const taskResolutionData = [
    { week: "Assigned", complaints: 32 },
    { week: "Resolved", complaints: 28 },
];

const residentFeedbackData = {
    averageRating: 4.8,
    totalReviews: 142,
    ratingBreakdown: [
        { stars: 5, count: 90, percentage: 63 },
        { stars: 4, count: 35, percentage: 25 },
        { stars: 3, count: 10, percentage: 7 },
        { stars: 2, count: 5, percentage: 3 },
        { stars: 1, count: 2, percentage: 2 },
    ],
};

// Main Component
export default function TrashmanStats() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Profile Card */}
                <div className="bg-white border border-secondary rounded-large p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Section - Profile Picture and Basic Info */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            {trashmanProfile.profile_pic ? (
                                <img
                                    src={trashmanProfile.profile_pic}
                                    alt={trashmanProfile.name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-secondary"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-secondary">
                                    <span className="text-white text-3xl font-bold">
                                        {trashmanProfile.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            
                            <div className="text-center md:text-left">
                                <h2 className="text-xl font-bold text-black">{trashmanProfile.name}</h2>
                                <p className="text-sm text-secondaryDark/60 font-medium">{trashmanProfile.id}</p>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-medium">
                                        {trashmanProfile.role}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star size={16} defaultColor="#F2C94C" />
                                        <span className="text-sm font-bold text-secondaryDark">
                                            {trashmanProfile.ratings.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Details Grid */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Zone */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Assigned Zone</span>
                                <p className="text-sm font-bold text-primary">{trashmanProfile.zone}</p>
                            </div>

                            {/* Joined Date */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Joined</span>
                                <p className="text-sm font-bold text-secondaryDark">{trashmanProfile.joinedDate}</p>
                            </div>

                            {/* Attendance */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Attendance</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-success">{trashmanProfile.attendance}%</span>
                                    <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="h-full bg-success rounded-full transition-all duration-500"
                                            style={{ width: `${trashmanProfile.attendance}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Tasks Completed */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Tasks Completed</span>
                                <p className="text-lg font-bold text-primary">{trashmanProfile.tasksCompleted}</p>
                            </div>

                            {/* Phone */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Phone</span>
                                <p className="text-sm font-bold text-secondaryDark">{trashmanProfile.phone}</p>
                            </div>

                            {/* Email */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Email</span>
                                <p className="text-sm font-bold text-secondaryDark truncate" title={trashmanProfile.email}>
                                    {trashmanProfile.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Section - 2 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PieChart data={attendanceData} yearDropDown={['2025', '2026']} />
                    <BarChart
                        Heading={"Weekly Avg. rating"}
                        data={weeklyRatingData} 
                        yearDropDown={['2025', '2026']} 
                        monthDropDown={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]}
                    />
                </div>

                {/* Bottom Section - 2 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BarChart 
                        Heading={"Immediate Tasks"}
                        data={taskResolutionData}
                        yearDropDown={['2025', '2026']} 
                        monthDropDown={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]}
                    />
                    <Rating 
                        averageRating={residentFeedbackData.averageRating}
                        totalReviews={residentFeedbackData.totalReviews}
                        ratingBreakdown={residentFeedbackData.ratingBreakdown}
                    />
                </div>
            </div>
        </div>
    );
}
