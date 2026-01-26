import React, { useState } from "react";
import ThemeStore from "../../../../store/ThemeStore";
import { X } from "../../../../assets/icons/icons";

function TrashManFilterModal({ routes, selectedRoutes, onClose, onApply }) {
    const { isDarkTheme } = ThemeStore();
    const [tempSelectedRoutes, setTempSelectedRoutes] = useState([...selectedRoutes]);

    function handleRouteToggle(routeName) {
        if (tempSelectedRoutes.includes(routeName)) {
        setTempSelectedRoutes(tempSelectedRoutes.filter(function(r) { return r !== routeName; }));
        } else {
        setTempSelectedRoutes([...tempSelectedRoutes, routeName]);
        }
    }

    function handleApply() {
        onApply(tempSelectedRoutes);
    }

    function handleClear() {
        setTempSelectedRoutes([]);
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div onClick={onClose} className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-large p-6 max-w-md w-full mx-4 border border-secondary">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondaryDark">
                Filter by Route
                </h3>
                
                <button
                onClick={onClose}
                className="p-1.5 hover:bg-secondary rounded-medium active:scale-[0.99]
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                        transition-all duration-200 ease-in-out"
                >
                <X size={18} />
                </button>
            </div>

            <div className="space-y-2 mb-6">
                {routes.map(function(route) {
                return (
                    <label
                    key={route}
                    className="flex items-center gap-3 p-3 rounded-medium border border-secondary cursor-pointer
                            hover:bg-secondary hover:scale-[0.99] active:scale-[0.99]
                            transition-all duration-200 ease-in-out"
                    >
                    <input
                        type="checkbox"
                        checked={tempSelectedRoutes.includes(route)}
                        onChange={function() { handleRouteToggle(route); }}
                        className="w-4 h-4 text-primary border-secondary rounded
                                focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-secondaryDark font-bold">
                        {route}
                    </span>
                    </label>
                );
                })}
            </div>

            <div className="flex items-center justify-between gap-3">
                <button
                onClick={handleClear}
                className="px-4 py-2 border border-secondary rounded-medium text-sm font-bold text-secondaryDark bg-white
                        hover:scale-[0.99] active:scale-[0.99]
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                        transition-all duration-200 ease-in-out"
                >
                Clear All
                </button>
                
                <button
                onClick={handleApply}
                className="px-4 py-2 bg-primary text-white rounded-medium text-sm font-bold
                        hover:scale-[0.99] active:scale-[0.99]
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                        transition-all duration-200 ease-in-out"
                >
                Apply Filter ({tempSelectedRoutes.length})
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default TrashManFilterModal;
