import React, { useState, useEffect } from "react";
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
Edit,
DownArrow,
} from "../../assets/icons/icons";
import { getMetrics, getDashboardKpis } from "../../services/features/adminService";

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return n.toLocaleString();
  return String(n);
}

function pct(curr, prev) {
  if (!prev) return null;
  const v = ((curr - prev) / prev * 100).toFixed(1);
  return (Number(v) >= 0 ? '+' : '') + v + '%';
}

function buildKpiCards(d) {
  if (!d) return [];
  const reqPerMin = d.minutesElapsedToday ? Math.round(d.apiRequestsToday / d.minutesElapsedToday) : 0;
  const apiChange = pct(d.apiRequestsToday, d.apiRequestsYesterday);
  const userChange = pct(d.newUsersThisMonth, d.newUsersLastMonth);
  const errRate = d.apiRequestsToday ? ((d.errors4xx / d.apiRequestsToday) * 100).toFixed(2) + '% Rate' : '0.00% Rate';
  return [
    { title: 'API Requests Today', value: fmt(d.apiRequestsToday), subtitle: apiChange ? `${apiChange} vs yesterday` : 'No prior data', subtitleColor: apiChange?.startsWith('+') ? '#1E8E54' : '#E75A4C', icon: <Mobile size={16} /> },
    { title: 'Requests / Min', value: fmt(reqPerMin), subtitle: "Today's avg rate", icon: <Stats size={16} /> },
    { title: '4XX Errors', value: fmt(d.errors4xx), subtitle: errRate, subtitleColor: '#F2C94C', icon: <Notification size={16} /> },
    { title: '5XX Errors', value: fmt(d.errors5xx), subtitle: d.errors5xx > 0 ? 'Critical Check' : 'All Clear', subtitleColor: d.errors5xx > 0 ? '#E75A4C' : '#1E8E54', icon: <Notification size={16} />, highlighted: d.errors5xx > 0 },
    { title: 'Avg Response Time', value: d.avgResponseMs + 'ms', subtitle: d.avgResponseMs < 200 ? 'Optimal (<200ms)' : d.avgResponseMs < 500 ? 'Moderate' : 'High latency', subtitleColor: d.avgResponseMs < 200 ? '#1E8E54' : d.avgResponseMs < 500 ? '#F2C94C' : '#E75A4C', icon: <Stats size={16} /> },
    { title: 'New Users', value: fmt(d.newUsersThisMonth), subtitle: userChange ? `${userChange} vs last month` : 'This month', subtitleColor: userChange?.startsWith('+') ? '#1E8E54' : '#E75A4C', icon: <People size={16} /> },
    { title: 'Failed Login Attempts', value: fmt(d.failedLoginsToday), subtitle: d.failedLoginsToday > 50 ? 'Security Check' : 'Normal range', subtitleColor: d.failedLoginsToday > 50 ? '#F2C94C' : '#1E8E54', icon: <Notification size={16} />, highlighted: d.failedLoginsToday > 100 },
    { title: 'Active Users Today', value: fmt(d.activeUsersToday), subtitle: 'All roles combined', subtitleColor: '#1E8E54', icon: <People size={16} /> },
  ];
}

const INTERVAL_FOR_RANGE = { today: '5m', week: '1h', month: '1h', custom: '1h' };

function formatLabel(isoStr, range) {
    const d = new Date(isoStr);
    if (range === 'today') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    if (range === 'week') return d.toLocaleDateString([], { weekday: 'short' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function toChartData(rows, range) {
    return (rows || []).map(r => ({ label: formatLabel(r.bucket, range), value: r.value }));
}

function AdminDashboard() {
const { isDarkTheme } = ThemeStore();
const [isEditingEscalation, setIsEditingEscalation] = useState(false);
const [activeFilter, setActiveFilter] = useState("today");
const [showDatePicker, setShowDatePicker] = useState(false);
const [customLabel, setCustomLabel] = useState(null);
const [customRange, setCustomRange] = useState(null);
const [kpis, setKpis] = useState(null);
const [kpisLoading, setKpisLoading] = useState(true);
const [chartData, setChartData] = useState({ traffic: [], errors4xx: [], errors5xx: [] });
const [escalationConfig, setEscalationConfig] = useState([
    { role: "Resident", timing: "Trigger", isTrigger: true, editable: false },
    { role: "Supervisor", timing: "24h", editable: true },
    { role: "Sanitary Inspector", timing: "48h", editable: true },
    { role: "MHO", timing: "72h", editable: true },
    { role: "Commissioner", timing: "Final", isFinal: true, editable: false },
]);

useEffect(() => {
    setKpisLoading(true);
    getDashboardKpis()
        .then(res => { if (res?.data) setKpis(res.data); })
        .catch(console.error)
        .finally(() => setKpisLoading(false));
}, []);

useEffect(() => {
    const interval = INTERVAL_FOR_RANGE[activeFilter] || '5m';
    const params = activeFilter === 'custom' && customRange
        ? { start: customRange.from.toISOString(), end: customRange.to.toISOString(), interval }
        : { range: activeFilter === 'custom' ? 'today' : activeFilter, interval };

    async function fetchAll() {
        try {
            const [traffic, errors4xx, errors5xx] = await Promise.all([
                getMetrics({ ...params, metricType: 'API_TRAFFIC' }),
                getMetrics({ ...params, metricType: 'HTTP_4XX' }),
                getMetrics({ ...params, metricType: 'HTTP_5XX' }),
            ]);
            console.log('[metrics] raw traffic:', traffic?.data);
            const labelRange = activeFilter === 'custom' ? 'week' : activeFilter;
            setChartData({
                traffic: toChartData(traffic?.data, labelRange),
                errors4xx: toChartData(errors4xx?.data, labelRange),
                errors5xx: toChartData(errors5xx?.data, labelRange),
            });
        } catch (err) {
            console.error('Failed to fetch metrics:', err);
        }
    }

    fetchAll();
}, [activeFilter, customRange]);

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
        setCustomRange(null);
        setShowDatePicker(false);
    }
}

function handleDateApply(from, to) {
    const fmt = (d) =>
        `${d.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]}`;
    setCustomLabel(`${fmt(from)} – ${fmt(to)}`);
    setCustomRange({ from, to });
    setActiveFilter("custom");
    setShowDatePicker(false);
}

return (
<div className={isDarkTheme ? "dark" : ""}>
    <div className="min-h-screen bg-background transition-all duration-200">
    <div className="p-6 space-y-6">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {kpisLoading
            ? Array.from({ length: 8 }).map((_, i) => <AdminKpiCard key={i} loading />)
            : buildKpiCards(kpis).map((card, idx) => (
                <AdminKpiCard key={idx} title={card.title} value={card.value} subtitle={card.subtitle} subtitleColor={card.subtitleColor} icon={card.icon} highlighted={card.highlighted} />
            ))
        }
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div  className="lg:col-span-2">
                <div>
                    <AreaChart
                    title="API Traffic Volume"
                    subtitle="Requests per minute trend"
                    data={chartData.traffic}
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
                    data={chartData.errors4xx}
                    showFilters={false}
                    syncId="apiCharts"
                    />
                    <AreaChart 
                    title="5xx Errors Trend"
                    subtitle="Server errors over time"
                    data={chartData.errors5xx}
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