import React from "react";
import PieChart from "../../components/Statistics/PieChart";
import BarChart from "../../components/Statistics/BarChart";
import Rating from "../../components/Statistics/Rating";

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
