import React, { useState } from "react";
import ThemeStore from "../../../../store/ThemeStore";
import { X } from "../../../../assets/icons/icons";

function StreetFilterModal({ wards, selectedWards, onClose, onApply }) {
  const { isDarkTheme } = ThemeStore();
  const [tempSelectedWards, setTempSelectedWards] = useState([...selectedWards]);

  function handleWardToggle(wardName) {
    if (tempSelectedWards.includes(wardName)) {
      setTempSelectedWards(tempSelectedWards.filter(function(w) { return w !== wardName; }));
    } else {
      setTempSelectedWards([...tempSelectedWards, wardName]);
    }
  }

  function handleApply() {
    onApply(tempSelectedWards);
  }

  function handleClear() {
    setTempSelectedWards([]);
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div onClick={onClose} className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-large p-6 max-w-md w-full mx-4 border border-secondary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-secondaryDark">
              Filter by Ward
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

          <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
            {wards.map(function(ward) {
              return (
                <label
                  key={ward}
                  className="flex items-center gap-3 p-3 rounded-medium border border-secondary cursor-pointer
                           hover:bg-secondary hover:scale-[0.99] active:scale-[0.99]
                           transition-all duration-200 ease-in-out"
                >
                  <input
                    type="checkbox"
                    checked={tempSelectedWards.includes(ward)}
                    onChange={function() { handleWardToggle(ward); }}
                    className="w-4 h-4 text-primary border-secondary rounded
                             focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-secondaryDark font-bold">
                    {ward}
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
              Apply Filter ({tempSelectedWards.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreetFilterModal;
