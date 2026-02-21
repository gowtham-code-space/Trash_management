import React, { useState, useEffect, useRef } from "react";
import { LeftArrow, RightArrow, Calendar, UpArrow, DownArrow } from "../../../assets/icons/icons";

function DateRangePicker({ onApply, onClose, isDarkTheme }) {
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectingFor, setSelectingFor] = useState('from');
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    
    const monthDropdownRef = useRef(null);
    const yearDropdownRef = useRef(null);

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
                setShowMonthDropdown(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
                setShowYearDropdown(false);
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function getDaysInMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        return { daysInMonth, startingDayOfWeek };
    }

    function handlePrevMonth() {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    }

    function handleNextMonth() {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    }

    function handleMonthSelect(monthIndex) {
        setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
        setShowMonthDropdown(false);
    }

    function handleYearSelect(year) {
        setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
        setShowYearDropdown(false);
    }

    function handleDateClick(day) {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        
        if (selectingFor === 'from') {
            setFromDate(selected);
            setToDate(null);
            setSelectingFor('to');
        } else {
            if (selected < fromDate) {
                setFromDate(selected);
                setToDate(null);
            } else {
                setToDate(selected);
            }
        }
    }

    function handleApplyClick() {
        if (fromDate && toDate) {
            onApply(fromDate, toDate);
        }
    }

    function formatDate(date) {
        if (!date) return 'Select Date';
        return `${date.getDate()} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
    }

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

    return (
        <div className={`absolute top-full left-0 mt-2 w-80 rounded-large shadow-lg border z-50 ${
            isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"
        }`}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-4 gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className={`p-1.5 rounded-medium hover:scale-[0.99] active:scale-[0.99] transition-all ${
                            isDarkTheme ? "bg-darkBackground" : "bg-secondary"
                        }`}
                    >
                        <LeftArrow size={16} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} />
                    </button>
                    
                    <div className="flex gap-2 flex-1 justify-center">
                        <div className="relative" ref={monthDropdownRef}>
                            <button
                                onClick={() => {
                                    setShowMonthDropdown(!showMonthDropdown);
                                    setShowYearDropdown(false);
                                }}
                                className={`px-3 py-1 rounded-medium text-xs font-semibold hover:scale-[0.99] active:scale-[0.99] transition-all flex items-center gap-1 ${
                                    isDarkTheme ? "bg-darkBackground text-darkTextPrimary" : "bg-secondary text-primary"
                                }`}
                            >
                                {monthNames[currentMonth.getMonth()]}
                                <DownArrow size={10} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} />
                            </button>
                            
                            {showMonthDropdown && (
                                <div className={`absolute top-full left-0 mt-1 w-32 max-h-48 overflow-y-auto rounded-medium shadow-lg border z-50 ${
                                    isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"
                                }`}>
                                    {monthNames.map((month, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleMonthSelect(index)}
                                            className={`w-full px-3 py-2 text-left text-xs hover:scale-[0.99] active:scale-[0.99] transition-all ${
                                                currentMonth.getMonth() === index
                                                    ? isDarkTheme ? "bg-primaryLight/20 text-darkTextPrimary" : "bg-primaryLight/10 text-primary"
                                                    : isDarkTheme ? "text-darkTextPrimary hover:bg-darkBackground" : "text-secondaryDark hover:bg-background"
                                            }`}
                                        >
                                            {month}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="relative" ref={yearDropdownRef}>
                            <button
                                onClick={() => {
                                    setShowYearDropdown(!showYearDropdown);
                                    setShowMonthDropdown(false);
                                }}
                                className={`px-3 py-1 rounded-medium text-xs font-semibold hover:scale-[0.99] active:scale-[0.99] transition-all flex items-center gap-1 ${
                                    isDarkTheme ? "bg-darkBackground text-darkTextPrimary" : "bg-secondary text-primary"
                                }`}
                            >
                                {currentMonth.getFullYear()}
                                <DownArrow size={10} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} />
                            </button>
                            
                            {showYearDropdown && (
                                <div className={`absolute top-full left-0 mt-1 w-24 max-h-48 overflow-y-auto rounded-medium shadow-lg border z-50 ${
                                    isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"
                                }`}>
                                    {years.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => handleYearSelect(year)}
                                            className={`w-full px-3 py-2 text-left text-xs hover:scale-[0.99] active:scale-[0.99] transition-all ${
                                                currentMonth.getFullYear() === year
                                                    ? isDarkTheme ? "bg-primaryLight/20 text-darkTextPrimary" : "bg-primaryLight/10 text-primary"
                                                    : isDarkTheme ? "text-darkTextPrimary hover:bg-darkBackground" : "text-secondaryDark hover:bg-background"
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleNextMonth}
                        className={`p-1.5 rounded-medium hover:scale-[0.99] active:scale-[0.99] transition-all ${
                            isDarkTheme ? "bg-darkBackground" : "bg-secondary"
                        }`}
                    >
                        <RightArrow size={16} defaultColor={isDarkTheme ? "#1E8E54" : "#145B47"} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                        <div key={idx} className={`text-center text-[10px] font-semibold py-1 ${
                            isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"
                        }`}>
                            {day}
                        </div>
                    ))}
                    
                    {blanks.map((blank) => (
                        <div key={`blank-${blank}`} className="aspect-square" />
                    ))}
                    
                    {days.map((day) => {
                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                        const isFromDate = fromDate && date.toDateString() === fromDate.toDateString();
                        const isToDate = toDate && date.toDateString() === toDate.toDateString();
                        const isInRange = fromDate && toDate && date > fromDate && date < toDate;
                        const today = new Date();
                        const isToday = date.toDateString() === today.toDateString();
                        
                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`aspect-square flex items-center justify-center rounded-medium text-[11px] font-medium hover:scale-[0.99] active:scale-[0.99] transition-all ${
                                    isFromDate || isToDate
                                        ? "bg-primary text-white"
                                        : isInRange
                                        ? isDarkTheme ? "bg-primaryLight/20 text-darkTextPrimary" : "bg-primaryLight/20 text-primary"
                                        : isToday
                                        ? isDarkTheme ? "bg-darkBackground text-primaryLight border border-primaryLight" : "bg-secondary text-primary border border-primary"
                                        : isDarkTheme 
                                        ? "bg-darkBackground text-darkTextPrimary hover:bg-darkSurfaceHover" 
                                        : "bg-background text-secondaryDark hover:bg-secondary"
                                }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium w-12 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>From:</span>
                        <button
                            onClick={() => setSelectingFor('from')}
                            className={`flex-1 px-3 py-1.5 rounded-medium text-xs font-medium text-left cursor-pointer hover:scale-[0.99] active:scale-[0.99] transition-all ${
                                selectingFor === 'from'
                                    ? isDarkTheme ? "bg-primaryLight/20 text-darkTextPrimary border border-primaryLight" : "bg-primaryLight/10 text-primary border border-primary"
                                    : isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-background text-secondaryDark border border-secondary"
                            }`}
                        >
                            {formatDate(fromDate)}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium w-12 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>To:</span>
                        <button
                            onClick={() => setSelectingFor('to')}
                            className={`flex-1 px-3 py-1.5 rounded-medium text-xs font-medium text-left cursor-pointer hover:scale-[0.99] active:scale-[0.99] transition-all ${
                                selectingFor === 'to'
                                    ? isDarkTheme ? "bg-primaryLight/20 text-darkTextPrimary border border-primaryLight" : "bg-primaryLight/10 text-primary border border-primary"
                                    : isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-background text-secondaryDark border border-secondary"
                            }`}
                        >
                            {formatDate(toDate)}
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className={`flex-1 px-4 py-2 rounded-medium text-xs font-medium hover:scale-[0.99] active:scale-[0.99] transition-all ${
                            isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-secondary text-primary"
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApplyClick}
                        disabled={!fromDate || !toDate}
                        className="flex-1 bg-primary text-white px-4 py-2 rounded-medium text-xs font-medium hover:scale-[0.99] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DateRangePicker;
