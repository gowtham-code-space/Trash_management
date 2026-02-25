import React, { useState } from "react";
import ThemeStore from "../../store/ThemeStore";
import AdminKpiCard from "../../components/Cards/Admin/AdminKpiCard";
import AreaChart from "../../components/Statistics/AreaChart";
import ToastNotification from "../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import {
Mobile,
Stats,
Notification,
People,
Check,
Settings,
Edit,
DownArrow,
} from "../../assets/icons/icons";

const kpiData = [
{
title: "API Requests Today",
value: "4.2M",
subtitle: "+8.4% vs avg",
subtitleColor: "#1E8E54",
icon: <Mobile size={16} />,
},
{
title: "Requests / Min",
value: "3,150",
subtitle: "Stable load",
icon: <Stats size={16} />,
},
{
title: "4XX Errors",
value: "842",
subtitle: "0.02% Rate",
subtitleColor: "#F2C94C",
icon: <Notification size={16} />,
},
{
title: "5XX Errors",
value: "15",
subtitle: "Critical Check",
subtitleColor: "#E75A4C",
icon: <Notification size={16} />,
highlighted: true,
},
{
title: "Avg Response Time",
value: "124ms",
subtitle: "Optimal (<200ms)",
subtitleColor: "#1E8E54",
icon: <Stats size={16} />,
},
{
title: "New Users",
value: "1,245",
subtitle: "+18% this month",
subtitleColor: "#1E8E54",
icon: <People size={16} />,
},
{
title: "Failed Login Attempts",
value: "89",
subtitle: "Security Check",
subtitleColor: "#F2C94C",
icon: <Notification size={16} />,
highlighted: true,
},
{
title: "Active Users Today",
value: "45,200",
subtitle: "All roles combined",
subtitleColor: "#1E8E54",
icon: <People size={16} />,
},
];

const apiTrafficData = [
{ label: "00:00", value: 1200 },
{ label: "03:00", value: 800 },
{ label: "06:00", value: 1500 },
{ label: "09:00", value: 2800 },
{ label: "12:00", value: 4200 },
{ label: "15:00", value: 3800 },
{ label: "18:00", value: 3150 },
{ label: "21:00", value: 2100 },
{ label: "23:59", value: 1700 },
];

const errors4xxData = [
{ label: "00:00", value: 45 },
{ label: "03:00", value: 32 },
{ label: "06:00", value: 58 },
{ label: "09:00", value: 120 },
{ label: "12:00", value: 180 },
{ label: "15:00", value: 165 },
{ label: "18:00", value: 142 },
{ label: "21:00", value: 98 },
{ label: "23:59", value: 76 },
];

const errors5xxData = [
{ label: "00:00", value: 2 },
{ label: "03:00", value: 1 },
{ label: "06:00", value: 3 },
{ label: "09:00", value: 8 },
{ label: "12:00", value: 15 },
{ label: "15:00", value: 12 },
{ label: "18:00", value: 9 },
{ label: "21:00", value: 5 },
{ label: "23:59", value: 4 },
];

const escalationTiers = [
{ role: "Resident", timing: "Trigger", isTrigger: true },
{ role: "Supervisor", timing: "24h" },
{ role: "Sanitary Inspector", timing: "48h" },
{ role: "MHO", timing: "72h" },
{ role: "Commissioner", timing: "Final", isFinal: true },
];

function AdminDashboard() {
const { isDarkTheme } = ThemeStore();
const [isEditingEscalation, setIsEditingEscalation] = useState(false);
const [activeFilter, setActiveFilter] = useState("today");
const [showDatePicker, setShowDatePicker] = useState(false);
const [customLabel, setCustomLabel] = useState(null);
const [escalationConfig, setEscalationConfig] = useState([
    { role: "Resident", timing: "Trigger", isTrigger: true, editable: false },
    { role: "Supervisor", timing: "24h", editable: true },
    { role: "Sanitary Inspector", timing: "48h", editable: true },
    { role: "MHO", timing: "72h", editable: true },
    { role: "Commissioner", timing: "Final", isFinal: true, editable: false },
]);

function handleTimingChange(index, value) {
    setEscalationConfig(function (prev) {
    const updated = [...prev];
    updated[index] = { ...updated[index], timing: value };
    return updated;
    });
}

function handleSaveConfiguration() {
    setIsEditingEscalation(false);
    ToastNotification("Escalation configuration updated successfully", "success");
}

function handleFilterClick(value) {
    if (value === "custom") {
        setShowDatePicker(!showDatePicker);
    } else {
        setActiveFilter(value);
        setCustomLabel(null);
        setShowDatePicker(false);
    }
}

function handleDateApply(from, to) {
    const fmt = (d) =>
        `${d.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]}`;
    setCustomLabel(`${fmt(from)} – ${fmt(to)}`);
    setActiveFilter("custom");
    setShowDatePicker(false);
}

return (
<div className={isDarkTheme ? "dark" : ""}>
    <div className="min-h-screen bg-background transition-all duration-200">
    <div className="p-6 space-y-6">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {kpiData.map(function (card, idx) {
            return (
            <AdminKpiCard
                key={idx}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                subtitleColor={card.subtitleColor}
                icon={card.icon}
                highlighted={card.highlighted}
            />
            );
        })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div  className="lg:col-span-2">
                <div>
                    <AreaChart
                    title="API Traffic Volume"
                    subtitle="Requests per minute trend"
                    data={apiTrafficData}
                    showFilters={true}
                    activeFilter={activeFilter}
                    customLabel={customLabel}
                    showDatePicker={showDatePicker}
                    onFilterClick={handleFilterClick}
                    onDateApply={handleDateApply}
                    onCloseDatePicker={() => setShowDatePicker(false)}
                    syncId="apiCharts"
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <AreaChart 
                    title="4xx Errors Trend"
                    subtitle="Client errors over time"
                    data={errors4xxData}
                    showFilters={false}
                    syncId="apiCharts"
                    />
                    <AreaChart 
                    title="5xx Errors Trend"
                    subtitle="Server errors over time"
                    data={errors5xxData}
                    showFilters={false}
                    syncId="apiCharts"
                    />
                </div>
            </div>
        <div
            className={`rounded-veryLarge border p-6 flex flex-col
            ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}
        >
            <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className={`text-sm font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
                    Escalation Timing Flow
                </h3>
                <p className={`text-xs mt-0.5 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                Automated escalation hierarchy
                </p>
            </div>
            <span className="text-xs font-semibold text-primaryLight bg-primaryLight/10 px-2.5 py-1 rounded-medium">
                v2.4 Active
            </span>
            </div>

            {/* Vertical Flowchart */}
            <div className="flex-1 flex flex-col items-center gap-1 py-4">
            {escalationConfig.map(function (tier, idx) {
                const showArrow = idx < escalationConfig.length - 1;
                return (
                <React.Fragment key={idx}>
                    {/* Node Block */}
                    <div
                    className={`w-full px-4 py-3 rounded-large border-2 transition-all duration-200
                    ${tier.isTrigger
                        ? "border-primaryLight/40 bg-primaryLight/5"
                        : tier.isFinal
                        ? "border-error/40 bg-error/5"
                        : isDarkTheme
                        ? "bg-darkBackground border-darkBorder"
                        : "bg-background border-gray-200"
                    }
                    ${isEditingEscalation && tier.editable ? "ring-2 ring-primary/30" : ""}`}
                    >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                        <span
                            className={`text-xs font-bold block
                            ${tier.isFinal
                            ? "text-error"
                            : tier.isTrigger
                            ? "text-primaryLight"
                            : isDarkTheme
                            ? "text-darkTextPrimary"
                            : "text-secondaryDark"
                            }`}
                        >
                            {tier.role}
                        </span>
                        <span className={`text-[10px] font-medium mt-0.5 block ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark/60"}`}>
                            {tier.isTrigger ? "Initial Request" : tier.isFinal ? "Final Authority" : `Auto-escalate after ${tier.timing}`}
                        </span>
                        </div>
                        
                        {isEditingEscalation && tier.editable ? (
                        <input
                            type="text"
                            value={tier.timing}
                            onChange={function (e) { handleTimingChange(idx, e.target.value); }}
                            className={`w-16 px-2 py-1 text-xs font-semibold text-center rounded-medium border outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200
                            ${isDarkTheme
                                ? "bg-darkSurface border-darkBorder text-darkTextPrimary"
                                : "bg-white border-gray-300 text-primary"}`}
                            placeholder="24h"
                        />
                        ) : (
                        <span
                            className={`px-2.5 py-1 rounded-medium text-xs font-bold
                            ${tier.isTrigger || tier.isFinal
                                ? isDarkTheme ? "bg-darkSurface text-darkTextSecondary" : "bg-gray-100 text-secondaryDark"
                                : "bg-primary/10 text-primary"}`}
                        >
                            {tier.timing}
                        </span>
                        )}
                    </div>
                    </div>

                    {/* Arrow */}
                    {showArrow && (
                    <div className="flex flex-col items-center py-1">
                        <div className={`w-0.5 h-3 ${isDarkTheme ? "bg-darkBorder" : "bg-gray-300"}`} />
                        <DownArrow size={12} defaultColor={isDarkTheme ? "#254C40" : "#316F5D"} />
                        <div className={`w-0.5 h-3 ${isDarkTheme ? "bg-darkBorder" : "bg-gray-300"}`} />
                    </div>
                    )}
                </React.Fragment>
                );
            })}
            </div>

            {/* Action Button */}
            <button
                onClick={function () {
                if (isEditingEscalation) {
                    handleSaveConfiguration();
                } else {
                    setIsEditingEscalation(true);
                    ToastNotification("Edit mode enabled - adjust timing values", "info");
                }
                }}
                className="w-full mt-4 bg-primary text-white py-3 rounded-large text-sm font-bold flex items-center justify-center gap-2
                hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                transition-all duration-200 ease-in-out"
            >
                {isEditingEscalation ? (
                <>
                    <Check size={16} defaultColor="#fff" isDarkTheme={true} />
                    Save Configuration
                </>
                ) : (
                <>
                    <Edit size={16} defaultColor="#fff" isDarkTheme={true} />
                    Update Configuration
                </>
                )}
            </button>
        </div>
        </div>


    </div>
    </div>
    <ToastContainer />
</div>
);
}

export default AdminDashboard;