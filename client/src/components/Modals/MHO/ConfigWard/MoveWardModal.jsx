import React, { useState } from "react";
import ThemeStore from "../../../../store/ThemeStore";
import { X, Check } from "../../../../assets/icons/icons";

function MoveWardModal({ ward, divisions, onConfirm, onCancel }) {
  const { isDarkTheme } = ThemeStore();
  const [selectedDivision, setSelectedDivision] = useState(ward?.division || "");

  function handleConfirm() {
    if (selectedDivision && selectedDivision !== ward?.division) {
      onConfirm(ward.id, selectedDivision);
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
              Move Ward
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
              <p className="text-xs text-secondaryDark/60 mb-1">Ward</p>
              <p className="text-sm font-bold text-secondaryDark">
                {ward?.ward_number}
              </p>
              <p className="text-xs text-secondaryDark mt-1">
                {ward?.ward_name}
              </p>
              <p className="text-xs text-secondaryDark mt-2">
                {ward?.streets} Streets
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondaryDark mb-3">
                Current Division: <span className="text-primary">{ward?.division}</span>
              </label>
              
              <p className="text-sm font-bold text-secondaryDark mb-2">
                Select New Division
              </p>
              
              <div className="space-y-2">
                {divisions.map(function(division) {
                  const isCurrentDivision = division.name === ward?.division;
                  const isSelected = selectedDivision === division.name;
                  
                  return (
                    <button
                      key={division.id}
                      onClick={function() { setSelectedDivision(division.name); }}
                      disabled={isCurrentDivision}
                      className={`w-full p-3 rounded-medium border-2 text-left
                                transition-all duration-200 ease-in-out
                                ${isCurrentDivision 
                                  ? "border-secondary bg-secondary/30 cursor-not-allowed opacity-60" 
                                  : isSelected
                                    ? "border-primary bg-secondary hover:scale-[0.99] active:scale-[0.99]"
                                    : "border-secondary bg-white hover:bg-secondary hover:scale-[0.99] active:scale-[0.99]"}
                                ${!isCurrentDivision && "focus:outline-none focus:ring-2 focus:ring-primary/20"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-secondaryDark">
                            {division.name}
                          </p>
                          <p className="text-xs text-secondaryDark/60 mt-1">
                            {division.wards.length} Ward{division.wards.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {isSelected && !isCurrentDivision && (
                          <div className="bg-primary rounded-full p-1">
                            <Check size={14} isDarkTheme={true} />
                          </div>
                        )}
                        {isCurrentDivision && (
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
              disabled={!selectedDivision || selectedDivision === ward?.division}
              className={`px-4 py-2 rounded-medium text-sm font-bold
                        transition-all duration-200 ease-in-out
                        ${!selectedDivision || selectedDivision === ward?.division
                          ? "bg-secondary text-secondaryDark/40 cursor-not-allowed"
                          : "bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20"}`}
            >
              Move Ward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoveWardModal;
