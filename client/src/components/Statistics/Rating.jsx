import { useState } from "react";
import { Star } from "../../assets/icons/icons";
import ToastNotification from "../Notification/ToastNotification";
import { ToastContainer } from "react-toastify";

function Rating({ averageRating = 4.8, totalReviews = 142, ratingBreakdown = [], yearDropDown = [], monthDropDown = [] }) {
    const [selectedYear, setSelectedYear] = useState(yearDropDown[0] || "2025");
    const [selectedMonth, setSelectedMonth] = useState(monthDropDown[0] || "January");

    // const defaultBreakdown = [
    //     { stars: 5, count: 90, percentage: 63 },
    //     { stars: 4, count: 35, percentage: 25 },
    //     { stars: 3, count: 10, percentage: 7 },
    //     { stars: 2, count: 5, percentage: 3 },
    //     { stars: 1, count: 2, percentage: 2 },
    // ];

    const breakdown = ratingBreakdown.length > 0 ? ratingBreakdown : defaultBreakdown;

    function handleYearChange(event) {
        const newYear = event.target.value;
        setSelectedYear(newYear);
        ToastNotification(`Loading ratings data for ${selectedMonth} ${newYear}`, "info");
    }

    function handleMonthChange(event) {
        const newMonth = event.target.value;
        setSelectedMonth(newMonth);
        ToastNotification(`Loading ratings data for ${newMonth} ${selectedYear}`, "info");
    }

    // Function to render stars
    function renderStars() {
        const stars = [];
        const fullStars = Math.floor(averageRating);
        const hasHalfStar = averageRating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <div key={i}>
                        <Star size={16} defaultColor="#F59E0B" />
                    </div>
                );
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(
                    <div key={i} className="relative">
                        <Star size={16} defaultColor="#E5E7EB" />
                        <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                            <Star size={16} defaultColor="#F59E0B" />
                        </div>
                    </div>
                );
            } else {
                stars.push(
                    <div key={i}>
                        <Star size={16} defaultColor="#E5E7EB" />
                    </div>
                );
            }
        }
        return stars;
    }

    // Function to get bar color based on star rating
    function getBarColor(stars) {
        if (stars === 5) return "bg-warning";
        if (stars === 4) return "bg-warning/75";
        if (stars === 3) return "bg-warning/50";
        if (stars === 2) return "bg-warning/30";
        return "bg-warning/15";
    }

    return (
        <div className="bg-secondary p-6 rounded-large border border-secondary shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-secondaryDark">
                    Resident Feedback
                </h2>
                <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center">
                    <Star size={18} defaultColor="#F59E0B" />
                </div>
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-2 mb-6">
                {monthDropDown.length > 0 && (
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
                )}
                
                {yearDropDown.length > 0 && (
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
                )}
            </div>

            {/* Average Rating Display */}
            <div className="mb-8 pb-6 border-b border-secondary/50">
                <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-6xl font-bold text-secondaryDark leading-none">
                        {averageRating.toFixed(1)}
                    </span>
                </div>
                
                <div className="flex items-center gap-1.5 mb-2">
                    {renderStars()}
                </div>
                
                <p className="text-xs text-gray-500 font-medium">
                    Based on {totalReviews} reviews
                </p>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="space-y-3">
                {breakdown.map(function(item) {
                    return (
                        <div key={item.stars} className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-secondaryDark w-3 text-center">
                                {item.stars}
                            </span>
                            
                            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className={`h-full ${getBarColor(item.stars)} transition-all duration-500 ease-out rounded-full`}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            <ToastContainer />
        </div>
    );
}

export default Rating;
