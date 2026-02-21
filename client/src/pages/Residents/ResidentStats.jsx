import React from "react";
import { useState } from "react";
import {
    RadarChart as RechartsRadar,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    LineChart as RechartsLine,
    Line,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPie,
    Pie,
    Cell,
} from "recharts";
import Pagination from "../../utils/Pagination";
import ToastNotification from "../../components/Notification/ToastNotification";

//stats
import RadarChart from "../../components/Statistics/RadarChart";
import LineChart from "../../components/Statistics/LineChart";
import PieChart from "../../components/Statistics/PieChart";

// Mock Data
const contributionData = [
    { label: "Raised", value: 42, color: "#145B47" },
    { label: "Resolved", value: 18, color: "#1E8E54" },
    { label: "Votes Given", value: 156, color: "#316F5D" },
    { label: "Valid Reports", value: 38, color: "#145B47" },
];

const radarData = [
    { category: "Resolved", value: 85 },
    { category: "In Progress", value: 65 },
    { category: "Pending", value: 45 },
    { category: "Rejected", value: 25 },
];

const trendData = [
    { week: "Week 1", complaints: 12 },
    { week: "Week 2", complaints: 19 },
    { week: "Week 3", complaints: 15 },
    { week: "Week 4", complaints: 22 },
];

const communityData = [
    { name: "Accepted", value: 85, color: "#1E8E54" },
    { name: "Declined", value: 15, color: "#E75A4C" },
];


// Contribution Summary Component
function ContributionSummary({ data }) {
    return (
        <div className="bg-secondary p-6 rounded-large border border-secondary">
        <h2 className="text-base font-semibold text-secondaryDark mb-6">
            My Contribution Summary
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map(function (item, index) {
            return (
                <div
                key={index}
                className="bg-primary p-6 rounded-large hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                <div className="text-center">
                    <p className="text-xl font-bold text-white mb-2">{item.value}</p>
                    <p className="text-sm text-white/90">{item.label}</p>
                </div>
                </div>
            );
            })}
        </div>
        </div>
    );
    }

// Main Component
export default function ResidentStats() {
    return (
        <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Section */}
            <ContributionSummary data={contributionData} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RadarChart data={radarData} yearDropDown={['2025','2026']}/>
            <LineChart data={trendData} yearDropDown={['2025','2026']} monthDropDown={["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"]}/>
            <PieChart data={communityData} yearDropDown={['2025','2026']} />
            </div>
        </div>
        </div>
    );
}