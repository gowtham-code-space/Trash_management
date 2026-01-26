import React, { useState } from "react";
import { X, LeftArrow, RightArrow } from "../../../assets/icons/icons";

function CalendarModal({ isOpen, onClose, onDateSelect, isDarkTheme }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    if (!isOpen) return null;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

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
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    }

    function handleNextMonth() {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    }

    function handleDateClick(day) {
        const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(selected);
    }

    function handleApply() {
        if (selectedDate) {
        onDateSelect(selectedDate);
        onClose();
        }
    }

    function handleClear() {
        setSelectedDate(null);
        onDateSelect(null);
        onClose();
    }

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

    return (
        <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        >
        <div
            className="w-full max-w-md bg-white rounded-veryLarge shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary">Select Date</h2>
            <button
                onClick={onClose}
                className="text-secondaryDark hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
                <X size={20} defaultColor="#316F5D" />
            </button>
            </div>

            <div className="flex items-center justify-between mb-4">
            <button
                onClick={handlePrevMonth}
                className="p-2 bg-secondary rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
                <LeftArrow size={20} defaultColor="#145B47" />
            </button>
            <span className="text-base font-semibold text-primary">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
                onClick={handleNextMonth}
                className="p-2 bg-secondary rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
                <RightArrow size={20} defaultColor="#145B47" />
            </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-secondaryDark py-2">
                {day}
                </div>
            ))}
            
            {blanks.map((blank) => (
                <div key={`blank-${blank}`} className="aspect-square" />
            ))}
            
            {days.map((day) => {
                const today = new Date();
                const isToday = 
                today.getDate() === day &&
                today.getMonth() === currentDate.getMonth() &&
                today.getFullYear() === currentDate.getFullYear();
                
                const isSelected = selectedDate && 
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentDate.getMonth() &&
                selectedDate.getFullYear() === currentDate.getFullYear();
                
                return (
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square flex items-center justify-center rounded-medium text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out ${
                    isSelected
                        ? "bg-primary text-white"
                        : isToday
                        ? "bg-primaryLight text-white"
                        : "bg-secondary text-secondaryDark hover:bg-primary hover:text-white"
                    }`}
                >
                    {day}
                </button>
                );
            })}
            </div>

            <div className="flex gap-3">
            <button
                onClick={handleClear}
                className="flex-1 bg-secondary text-primary px-4 py-2 rounded-medium text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
                Clear
            </button>
            <button
                onClick={handleApply}
                disabled={!selectedDate}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-medium text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Apply
            </button>
            </div>
        </div>
        </div>
    );
}

export default CalendarModal;