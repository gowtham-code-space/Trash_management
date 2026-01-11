import React from "react";
import { Check } from "../../../assets/icons/icons";

function TaskAssignedModal({ onClose }) {

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

    <h2 className="text-xl font-bold text-primary mb-2 tracking-tight">Task assigned</h2>
    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        The task has been successfully assigned to the selected workers.
    </p>

    <div className="flex gap-3">
        <button 
        onClick={onClose}
        className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95"
        >
        Close
        </button>
    </div>
    </div>
</div>
);
}

export default TaskAssignedModal;
