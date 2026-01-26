import React from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "../../../assets/icons/icons";

function AttendanceSubmittedModal({ isOpen, onClose, isDarkTheme, workerData }) {
    const navigate = useNavigate();

    function handleViewHistory() {
        onClose();
        navigate("/upload-attendance");
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-white border border-secondary rounded-xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                <div className="mx-auto w-14 h-14 bg-primaryLight rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-primaryLight/30">
                    <Check size={32} isPressed={false} isDarkTheme={true} />
                </div>

                <h2 className="text-xl font-bold text-primary mb-2 tracking-tight">Attendance submitted</h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    Your attendance has been recorded. Check your history to track the status.
                </p>

                <div className="flex gap-3">
                    <button 
                        onClick={handleViewHistory}
                        className="flex-1 bg-primaryLight text-white py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                    >
                        View history
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AttendanceSubmittedModal;