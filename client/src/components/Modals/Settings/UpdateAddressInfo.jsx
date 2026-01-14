import React from "react";
import { X, Check ,Info } from "../../../assets/icons/icons";

function UpdateAddressInfo({ onClose, onConfirm }) {
    return (
        <div onClick={onClose} className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-veryLarge shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-secondary">
            <div>
                <h3 className="text-lg font-bold text-primary">Address Change Notice</h3>
                <p className="text-xs text-secondaryDark/60 mt-1">
                Important information about address updates
                </p>
            </div>
            <button
                onClick={onClose}
                className="w-9 h-9 rounded-medium flex items-center justify-center hover:bg-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
                <X size={18} defaultColor="#316F5D" />
            </button>
            </div>

            <div className="p-6 space-y-6">
            <div className="bg-warning/10 border border-warning/30 rounded-large p-4">
                <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Info defaultColor="white" size={20}/>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-secondaryDark mb-2">
                    Monthly Update Limit
                    </p>
                    <p className="text-sm text-secondaryDark/80 leading-relaxed">
                    Address changes can be done only once a month. Please ensure all the information you enter is accurate before saving.
                    </p>
                </div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                onClick={onClose}
                className="flex-1 bg-secondary text-primary py-3.5 rounded-large text-sm font-bold hover:bg-secondary/80 hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                Cancel
                </button>
                <button
                onClick={onConfirm}
                className="flex-1 bg-primary text-white py-3.5 rounded-large text-sm font-bold flex items-center justify-center gap-2 hover:bg-primaryLight hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                <Check size={16} isDarkTheme={true} />
                I Agree
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default UpdateAddressInfo;