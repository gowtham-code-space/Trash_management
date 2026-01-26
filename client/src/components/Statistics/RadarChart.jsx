import { useState } from "react";
import ToastNotification from "../Notification/ToastNotification";
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
import { ToastContainer } from "react-toastify";

function RadarChart({ data , yearDropDown}) {
    const [selectedYear, setSelectedYear] = useState("2025");
    
    // const years = ["2024", "2025", "2026"];
    
    function handleYearChange(event) {
        const newYear = event.target.value;
        setSelectedYear(newYear);
        ToastNotification(`Loading Complaints Distribution data for ${newYear}`, "info");
    }

    return (
        <div className="bg-secondary p-6 rounded-large border border-secondary">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-secondaryDark">
            Complaints Distribution
            </h2>
            
            <select
            value={selectedYear}
            onChange={handleYearChange}
            className="px-3 py-2 text-sm bg-background text-secondaryDark border border-secondary rounded-medium hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
            {yearDropDown.map(function(year) {
                return (
                <option key={year} value={year}>
                    {year}
                </option>
                );
            })}
            </select>
        </div>

        <div className="relative">
            <ResponsiveContainer width="100%" height={280}>
            <RechartsRadar data={data}>
                <PolarGrid strokeDasharray="3 3" stroke="#145B47" opacity={0.3} />
                <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "#316F5D", fontSize: 13, fontWeight: 500 }}
                />
                <Radar
                name="Distribution"
                dataKey="value"
                stroke="#1E8E54"
                fill="#1E8E54"
                fillOpacity={0.5}
                strokeWidth={2}
                />
            </RechartsRadar>
            </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-secondary">
            <p className="text-sm text-secondaryDark">
            Overall resolution performance for {selectedYear}
            </p>
        </div>
        <ToastContainer/>
        </div>
    );
}
export default RadarChart