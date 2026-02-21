import React from "react";
import PieChart from "../../components/Statistics/PieChart";
import Rating from "../../components/Statistics/Rating";
import { Star } from "../../assets/icons/icons";

// Mock Data
const supervisorProfile = {
    profile_pic: null,
    name: "Supervisor Name",
    id: "SUP-2024-001",
    role: "Supervisor",
    zone: "Zone A",
    joinedDate: "Jan 2024",
    totalDays: 100,
    present: 92,
    absent: 8,
    attendance: 92,
    ratings: 4.5,
    tasksAssigned: 156,
    phone: "+91 98765 43210",
    email: "supervisor@trashmanagement.com"
};

// Mock Data
const attendanceData = [
    { name: "Present", value: 92, color: "#1E8E54" },
    { name: "Absent", value: 8, color: "#E5E7EB" },
];

const trashmanFeedbackData = {
    averageRating: 4.5,
    totalReviews: 125,
    ratingBreakdown: [
        { stars: 5, count: 75, percentage: 60 },
        { stars: 4, count: 30, percentage: 24 },
        { stars: 3, count: 12, percentage: 10 },
        { stars: 2, count: 5, percentage: 4 },
        { stars: 1, count: 3, percentage: 2 },
    ],
};

// Main Component
export default function SupervisorStats() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Profile Card */}
                <div className="bg-white border border-secondary rounded-large p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Section - Profile Picture and Basic Info */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            {supervisorProfile.profile_pic ? (
                                <img
                                    src={supervisorProfile.profile_pic}
                                    alt={supervisorProfile.name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-secondary"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-secondary">
                                    <span className="text-white text-3xl font-bold">
                                        {supervisorProfile.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            
                            <div className="text-center md:text-left">
                                <h2 className="text-xl font-bold text-black">{supervisorProfile.name}</h2>
                                <p className="text-sm text-secondaryDark/60 font-medium">{supervisorProfile.id}</p>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-medium">
                                        {supervisorProfile.role}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star size={16} defaultColor="#F2C94C" />
                                        <span className="text-sm font-bold text-secondaryDark">
                                            {supervisorProfile.ratings.toFixed(1)}
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
                                <p className="text-sm font-bold text-primary">{supervisorProfile.zone}</p>
                            </div>

                            {/* Joined Date */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Joined</span>
                                <p className="text-sm font-bold text-secondaryDark">{supervisorProfile.joinedDate}</p>
                            </div>

                            {/* Attendance */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Attendance</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-success">{supervisorProfile.attendance}%</span>
                                    <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="h-full bg-success rounded-full transition-all duration-500"
                                            style={{ width: `${supervisorProfile.attendance}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Tasks Assigned */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Tasks Assigned</span>
                                <p className="text-lg font-bold text-primary">{supervisorProfile.tasksAssigned}</p>
                            </div>

                            {/* Phone */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Phone</span>
                                <p className="text-sm font-bold text-secondaryDark">{supervisorProfile.phone}</p>
                            </div>

                            {/* Email */}
                            <div className="bg-background rounded-medium p-4 border border-secondary/50">
                                <span className="text-xs font-bold text-secondaryDark/60 uppercase tracking-wide block mb-2">Email</span>
                                <p className="text-sm font-bold text-secondaryDark truncate" title={supervisorProfile.email}>
                                    {supervisorProfile.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Section - 3 Cards in a Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Total Days Card */}
                    <div className="bg-white border border-secondary rounded-large p-6 shadow-sm">
                        <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-sm font-bold text-secondaryDark/60 uppercase tracking-wide mb-2">
                                Total Days
                            </span>
                            <p className="text-4xl font-bold text-primary">
                                {supervisorProfile.totalDays}
                            </p>
                        </div>
                    </div>

                    {/* Present Card */}
                    <div className="bg-white border border-secondary rounded-large p-6 shadow-sm">
                        <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-sm font-bold text-secondaryDark/60 uppercase tracking-wide mb-2">
                                Present
                            </span>
                            <p className="text-4xl font-bold text-success">
                                {supervisorProfile.present}
                            </p>
                        </div>
                    </div>

                    {/* Absent Card */}
                    <div className="bg-white border border-secondary rounded-large p-6 shadow-sm">
                        <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-sm font-bold text-secondaryDark/60 uppercase tracking-wide mb-2">
                                Absent
                            </span>
                            <p className="text-4xl font-bold text-error">
                                {supervisorProfile.absent}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - PieChart and Rating in a Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left - PieChart */}
                    <PieChart data={attendanceData} yearDropDown={['2025', '2026']} />
                    
                    {/* Right - Rating */}
                    <Rating 
                        averageRating={trashmanFeedbackData.averageRating}
                        totalReviews={trashmanFeedbackData.totalReviews}
                        ratingBreakdown={trashmanFeedbackData.ratingBreakdown}
                        yearDropDown={['2025', '2026']}
                        monthDropDown={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]}
                    />
                </div>
            </div>
        </div>
    );
}
