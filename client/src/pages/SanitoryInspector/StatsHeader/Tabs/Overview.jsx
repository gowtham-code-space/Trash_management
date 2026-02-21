import { useState } from "react";
import PieChart from "../../../../components/Statistics/PieChart";
import BarChart from "../../../../components/Statistics/BarChart";
import ProgressBar from "../../../../components/Statistics/ProgressBar";
import ToastNotification from "../../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";

function Overview() {
    const [selectedMonth, setSelectedMonth] = useState("January");
    const [selectedYear, setSelectedYear] = useState("2026");

    // Sample data for Attendance Health (PieChart)
    const attendanceData = [
        { name: "Present", value: 92, color: "#1E8E54" },
        { name: "Absent", value: 8, color: "#E5E7EB" },
    ];

    // Sample data for Avg Task Completion Time (BarChart)
    const taskCompletionData = [
        { week: "Week 1", complaints: 45 },
        { week: "Week 2", complaints: 48 },
        { week: "Week 3", complaints: 40 },
        { week: "Week 4", complaints: 42 },
    ];

    const monthDropDown = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const yearDropDown = ["2024", "2025", "2026"];

    function handleMonthChange(event) {
        const newMonth = event.target.value;
        setSelectedMonth(newMonth);
        ToastNotification(`Loading tasks data for ${newMonth} ${selectedYear}`, "info");
    }

    function handleYearChange(event) {
        const newYear = event.target.value;
        setSelectedYear(newYear);
        ToastNotification(`Loading tasks data for ${selectedMonth} ${newYear}`, "info");
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Attendance Health Card - Using PieChart */}
            <PieChart data={attendanceData} yearDropDown={yearDropDown} />

            {/* Total Tasks Assigned Card - Using ProgressBar */}
            <div className="bg-secondary p-6 rounded-large border border-secondary shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-secondaryDark">
                        Total Tasks Assigned
                    </h2>
                    
                    {/* Dropdowns */}
                    <div className="flex gap-2">
                        <select
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="px-3 py-2 text-sm bg-background text-secondaryDark border border-secondary rounded-medium hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                            {monthDropDown.map(function(month) {
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
                            {yearDropDown.map(function(year) {
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Total number */}
                <div className="mb-4">
                    <h3 className="text-5xl font-bold text-secondaryDark mb-2">1,248</h3>
                    <p className="text-sm text-gray-500">Tasks this month</p>
                </div>

                {/* Progress Bar using ProgressBar component */}
                <div className="space-y-2">
                    <ProgressBar item={{ stars: 5, percentage: 75 }} defaultColor={"bg-primaryLight"}/>
                    
                    <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Resolved: 936</span>
                        <span className="font-semibold text-secondaryDark">75% Completion</span>
                    </div>
                </div>
            </div>

            {/* Avg Task Completion Time Card - Using BarChart */}
            <BarChart 
                data={taskCompletionData} 
                monthDropDown={monthDropDown} 
                yearDropDown={yearDropDown}
                Heading="Avg Task Completion Time"
            />

            <ToastContainer />
        </div>
    );
}

export default Overview;