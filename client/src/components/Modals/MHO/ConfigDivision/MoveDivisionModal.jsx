import React, { useState } from "react";
import ThemeStore from "../../../../store/ThemeStore";
import { X, Check } from "../../../../assets/icons/icons";

function MoveDivisionModal({ division, zones, onConfirm, onCancel }) {
    const { isDarkTheme } = ThemeStore();
    const [selectedZone, setSelectedZone] = useState(division?.zone || "");

    function handleConfirm() {
        if (selectedZone && selectedZone !== division?.zone) {
        onConfirm(division.id, selectedZone);
        } else {
        onCancel();
        }
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div onClick={onCancel} className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-large p-6 max-w-lg w-full mx-4 border border-secondary">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondaryDark">
                Move Division
                </h3>
                <button
                onClick={onCancel}
                className="p-1 hover:bg-secondary rounded-medium
                            hover:scale-[0.99] active:scale-[0.99]
                            focus:outline-none focus:ring-2 focus:ring-primary/20
                            transition-all duration-200 ease-in-out"
                >
                <X size={20} />
                </button>
            </div>
            
            <div className="mb-6">
                <div className="bg-background rounded-medium p-4 mb-4">
                <p className="text-xs text-secondaryDark/60 mb-1">Division Name</p>
                <p className="text-sm font-bold text-secondaryDark">
                    {division?.name}
                </p>
                <p className="text-xs text-secondaryDark mt-2">
                    {division?.wards} Wards • {division?.streets} Streets
                </p>
                </div>

                <div>
                <label className="block text-sm font-bold text-secondaryDark mb-3">
                    Current Zone: <span className="text-primary">{division?.zone}</span>
                </label>
                
                <p className="text-sm font-bold text-secondaryDark mb-2">
                    Select New Zone
                </p>
                
                <div className="space-y-2">
                    {zones.map(function(zone) {
                    const isCurrentZone = zone.name === division?.zone;
                    const isSelected = selectedZone === zone.name;
                    
                    return (
                        <button
                        key={zone.id}
                        onClick={function() { setSelectedZone(zone.name); }}
                        disabled={isCurrentZone}
                        className={`w-full p-3 rounded-medium border-2 text-left
                                    transition-all duration-200 ease-in-out
                                    ${isCurrentZone 
                                    ? "border-secondary bg-secondary/30 cursor-not-allowed opacity-60" 
                                    : isSelected
                                        ? "border-primary bg-secondary hover:scale-[0.99] active:scale-[0.99]"
                                        : "border-secondary bg-white hover:bg-secondary hover:scale-[0.99] active:scale-[0.99]"}
                                    ${!isCurrentZone && "focus:outline-none focus:ring-2 focus:ring-primary/20"}`}
                        >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                            <p className="text-sm font-bold text-secondaryDark">
                                {zone.name}
                            </p>
                            <p className="text-xs text-secondaryDark/60 mt-1">
                                {zone.divisions.length} Division{zone.divisions.length !== 1 ? 's' : ''}
                            </p>
                            </div>
                            {isSelected && !isCurrentZone && (
                            <div className="bg-primary rounded-full p-1">
                                <Check size={14} isDarkTheme={true} />
                            </div>
                            )}
                            {isCurrentZone && (
                            <span className="text-xs text-secondaryDark/60 font-bold">
                                Current
                            </span>
                            )}
                        </div>
                        </button>
                    );
                    })}
                </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <button
                onClick={onCancel}
                className="px-4 py-2 border border-secondary rounded-medium text-sm font-bold text-secondaryDark bg-white
                            hover:scale-[0.99] active:scale-[0.99]
                            focus:outline-none focus:ring-2 focus:ring-primary/20
                            transition-all duration-200 ease-in-out"
                >
                Cancel
                </button>
                
                <button
                onClick={handleConfirm}
                disabled={!selectedZone || selectedZone === division?.zone}
                className={`px-4 py-2 rounded-medium text-sm font-bold
                            transition-all duration-200 ease-in-out
                            ${!selectedZone || selectedZone === division?.zone
                            ? "bg-secondary text-secondaryDark/40 cursor-not-allowed"
                            : "bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20"}`}
                >
                Move Division
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default MoveDivisionModal;
