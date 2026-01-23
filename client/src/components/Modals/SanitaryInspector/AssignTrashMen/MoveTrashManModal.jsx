import React, { useState } from "react";
import ThemeStore from "../../../../store/ThemeStore";
import { X, Check } from "../../../../assets/icons/icons";

function MoveTrashManModal({ trashman, routes, onConfirm, onCancel }) {
    const { isDarkTheme } = ThemeStore();
    const [selectedRoute, setSelectedRoute] = useState(trashman?.route || "");

    function handleConfirm() {
        if (selectedRoute && selectedRoute !== trashman?.route) {
        onConfirm(trashman.id, selectedRoute);
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
                Reassign Trashman
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
                <div className="flex items-center gap-3">
                    <img
                    src={trashman?.profile_pic || "https://via.placeholder.com/50"}
                    alt={trashman?.name}
                    className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                    <p className="text-sm font-bold text-secondaryDark">
                        {trashman?.name}
                    </p>
                    <p className="text-xs text-secondaryDark/60">
                        {trashman?.employee_id}
                    </p>
                    </div>
                </div>
                </div>

                <div>
                <label className="block text-sm font-bold text-secondaryDark mb-3">
                    Current Route: <span className="text-primary">{trashman?.route}</span>
                </label>
                
                <p className="text-sm font-bold text-secondaryDark mb-2">
                    Select New Route
                </p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {routes.map(function(route) {
                    const isCurrentRoute = route.name === trashman?.route;
                    const isSelected = selectedRoute === route.name;
                    
                    return (
                        <button
                        key={route.id}
                        onClick={function() { setSelectedRoute(route.name); }}
                        disabled={isCurrentRoute}
                        className={`w-full p-3 rounded-medium border-2 text-left
                                    transition-all duration-200 ease-in-out
                                    ${isCurrentRoute 
                                    ? "border-secondary bg-secondary/30 cursor-not-allowed opacity-60" 
                                    : isSelected
                                        ? "border-primary bg-secondary hover:scale-[0.99] active:scale-[0.99]"
                                        : "border-secondary bg-white hover:bg-secondary hover:scale-[0.99] active:scale-[0.99]"}
                                    ${!isCurrentRoute && "focus:outline-none focus:ring-2 focus:ring-primary/20"}`}
                        >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                            <p className="text-sm font-bold text-secondaryDark">
                                {route.name}
                            </p>
                            <p className="text-xs text-secondaryDark/60 mt-1">
                                {route.trashmen?.length || 0} Trashm{(route.trashmen?.length || 0) !== 1 ? 'en' : 'an'}
                            </p>
                            </div>
                            {isSelected && !isCurrentRoute && (
                            <div className="bg-primary rounded-full p-1">
                                <Check size={14} isDarkTheme={true} />
                            </div>
                            )}
                            {isCurrentRoute && (
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
                disabled={!selectedRoute || selectedRoute === trashman?.route}
                className={`px-4 py-2 rounded-medium text-sm font-bold
                            transition-all duration-200 ease-in-out
                            ${!selectedRoute || selectedRoute === trashman?.route
                            ? "bg-secondary text-secondaryDark/40 cursor-not-allowed"
                            : "bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20"}`}
                >
                Reassign
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default MoveTrashManModal;
