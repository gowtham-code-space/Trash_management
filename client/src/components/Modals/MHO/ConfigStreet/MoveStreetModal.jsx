import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ThemeStore from "../../../../store/ThemeStore";
import { X, Check } from "../../../../assets/icons/icons";

function MoveStreetModal({ street, wards, onConfirm, onCancel }) {
  const { isDarkTheme } = ThemeStore();
  const { t } = useTranslation(["modals", "common"]);
  const [selectedWard, setSelectedWard] = useState(street?.ward || "");

  function handleConfirm() {
    if (selectedWard && selectedWard !== street?.ward) {
      onConfirm(street.id, selectedWard);
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
              {t('modals:mho_move_street.title')}
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
              <p className="text-xs text-secondaryDark/60 mb-1">{t('modals:mho_move_street.street_name_label')}</p>
              <p className="text-sm font-bold text-secondaryDark">
                {street?.street_name}
              </p>
              <p className="text-xs text-secondaryDark mt-2">
                {t('modals:mho_move_street.households_count', { count: street?.households })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondaryDark mb-3">
                {t('modals:mho_move_street.current_ward')} <span className="text-primary">{street?.ward}</span>
              </label>
              
              <p className="text-sm font-bold text-secondaryDark mb-2">
                {t('modals:mho_move_street.select_new_ward')}
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {wards.map(function(ward) {
                  const isCurrentWard = ward.name === street?.ward;
                  const isSelected = selectedWard === ward.name;
                  
                  return (
                    <button
                      key={ward.id}
                      onClick={function() { setSelectedWard(ward.name); }}
                      disabled={isCurrentWard}
                      className={`w-full p-3 rounded-medium border-2 text-left
                                transition-all duration-200 ease-in-out
                                ${isCurrentWard 
                                  ? "border-secondary bg-secondary/30 cursor-not-allowed opacity-60" 
                                  : isSelected
                                    ? "border-primary bg-secondary hover:scale-[0.99] active:scale-[0.99]"
                                    : "border-secondary bg-white hover:bg-secondary hover:scale-[0.99] active:scale-[0.99]"}
                                ${!isCurrentWard && "focus:outline-none focus:ring-2 focus:ring-primary/20"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-secondaryDark">
                            {ward.name}
                          </p>
                          <p className="text-xs text-secondaryDark/60 mt-1">
                            {t('modals:mho_move_street.street_count', { count: ward.streets.length })}
                          </p>
                        </div>
                        {isSelected && !isCurrentWard && (
                          <div className="bg-primary rounded-full p-1">
                            <Check size={14} isDarkTheme={true} />
                          </div>
                        )}
                        {isCurrentWard && (
                          <span className="text-xs text-secondaryDark/60 font-bold">
                            {t('common:current')}
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
              {t('common:cancel')}
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={!selectedWard || selectedWard === street?.ward}
              className={`px-4 py-2 rounded-medium text-sm font-bold
                        transition-all duration-200 ease-in-out
                        ${!selectedWard || selectedWard === street?.ward
                          ? "bg-secondary text-secondaryDark/40 cursor-not-allowed"
                          : "bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20"}`}
            >
              {t('modals:mho_move_street.move_street')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoveStreetModal;
