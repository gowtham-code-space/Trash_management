import { useState } from "react";
import ToastNotification from "../Notification/ToastNotification";
import {
    RadarChart as RechartsRadar,
    LineChart as RechartsLine,
    Line,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPie,
} from "recharts";
import { ToastContainer } from "react-toastify";
function LineChart({ data ,monthDropDown, yearDropDown}) {
    const [selectedMonth, setSelectedMonth] = useState(monthDropDown[0] || null);
    const [selectedYear, setSelectedYear] = useState(yearDropDown[0] || null);

//   const months = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];
//   const years = ["2024", "2025", "2026"];

    function handleMonthChange(event) {
        const newMonth = event.target.value;
        setSelectedMonth(newMonth);
        ToastNotification(`Loading Monthly Trend data for ${newMonth} ${selectedYear}`, "info");
    }
    
    function handleYearChange(event) {
        const newYear = event.target.value;
        setSelectedYear(newYear);
        ToastNotification(`Loading Monthly Trend data for ${selectedMonth} ${newYear}`, "info");
    }

    return (
        <div className="bg-secondary p-6 rounded-large border border-secondary">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-secondaryDark">
            Monthly Trend
            </h2>
            
            <div className="flex gap-2">
            <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="px-3 py-2 text-sm bg-background text-secondaryDark border border-secondary rounded-medium hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
                {monthDropDown?.map(function(month) {
                return (
                    <option key={month} value={month}>
                    {month}
                    </option>
                );
                })}
            </select>
            
            <select
                value={selectedYear}
                onChange={handleYearChange}
                className="px-3 py-2 text-sm bg-background text-secondaryDark border border-secondary rounded-medium hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
                {yearDropDown?.map(function(year) {
                return (
                    <option key={year} value={year}>
                    {year}
                    </option>
                );
                })}
            </select>
            </div>
        </div>

        <div className="relative">
            <ResponsiveContainer width="100%" height={280}>
            <RechartsLine data={data}>
                <CartesianGrid strokeDasharray="0" stroke="#ECF7F0" vertical={false} />
                <Tooltip
                contentStyle={{
                    backgroundColor: "#ECF7F0",
                    border: "1px solid #145B47",
                    borderRadius: "8px",
                    fontSize: "14px",
                }}
                labelStyle={{ color: "#145B47", fontWeight: 600 }}
                />
                <Line
                type="monotone"
                dataKey="complaints"
                stroke="#1E8E54"
                strokeWidth={3}
                dot={{ fill: "#145B47", r: 6, strokeWidth: 0 }}
                activeDot={{ r: 8, fill: "#1E8E54" }}
                />
            </RechartsLine>
            </ResponsiveContainer>
        </div>

        <div className="flex justify-around gap-2 mt-4 pt-4 border-t border-secondary">
            {data?.map(function (item, index) {
            return (
                <div key={index} className="text-center">
                <p className="text-xs text-secondaryDark">{item.week.replace("Week ", "W")}</p>
                </div>
            );
            })}
        </div>
        <ToastContainer/>
        </div>
    );
}
export default LineChart;