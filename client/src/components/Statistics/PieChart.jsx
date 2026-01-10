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
function PieChart({ data , yearDropDown}) {
    const [selectedYear, setSelectedYear] = useState("2025");
    //role for testing: "Resident", "TrashMan", "SuperVisor", "SanittaryInspector", "MHO"
    const role = "TrashMan"
    function handleYearChange(event) {
        const newYear = event.target.value;
        setSelectedYear(newYear);
        ToastNotification(`Loading Community Response data for ${newYear}`, "info");
    }
    
    return (
        <div className="bg-secondary p-6 rounded-large border border-secondary">
        <div className="flex items-center justify-between mb-2">
            {role === "Resident" ? 
            <h2 className="text-base font-semibold text-secondaryDark">
            Community Response
            </h2>

            : role === "TrashMan" ?
            <h2 className="text-base font-semibold text-secondaryDark">
            Attendance
            </h2> : ""
            }
            
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
        
        {role === "Resident" ?
            <p className="text-sm text-secondaryDark mb-6">Neighbor votes for {selectedYear}</p>

        : role === "TrashMan" ?
        <p className="text-sm text-secondaryDark mb-6">Attendance for {selectedYear}</p>
        
        : ""
        }

        <ResponsiveContainer width="100%" height={220}>
            <RechartsPie>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
            >
                {data.map(function (entry, index) {
                return <Cell key={index} fill={entry.color} />;
                })}
            </Pie>
            <Tooltip />
            </RechartsPie>
        </ResponsiveContainer>

        <div className="space-y-3 mt-6 pt-4 border-t border-secondary">
            {data.map(function (item, index) {
            return (
                <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                    className="w-4 h-4 rounded-small"
                    style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-secondaryDark">
                    {item.name}
                    </span>
                </div>
                <span className="text-base font-semibold text-secondaryDark">
                    {item.value}%
                </span>
                </div>
            );
            })}
        </div>
        <ToastContainer/>
        </div>
    );
}
export default PieChart;