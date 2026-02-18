import React from "react";
import { X } from "../../../assets/icons/icons";

function ViewProfileModal({ imageUrl, onClose }) {
    return (
        <div onClick={onClose} className="fixed inset-0 bg-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white rounded-veryLarge shadow-2xl max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-secondary">
                    <h3 className="text-lg font-bold text-primary">Profile Picture</h3>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-medium flex items-center justify-center hover:bg-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    >
                        <X size={18} defaultColor="#316F5D" />
                    </button>
                </div>
                <div className="p-6 flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt="Profile"
                        className="max-w-full max-h-[80vh] object-contain rounded-large"
                    />
                </div>
            </div>
        </div>
    );
}

export default ViewProfileModal;