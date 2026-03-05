import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, DownArrow } from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";

function TransferEmployeeModal({ employee, onClose, isDarkTheme }) {
    const { t } = useTranslation(["modals", "common"]);
    const [selectedZone, setSelectedZone] = useState("");
    const [selectedDivision, setSelectedDivision] = useState("");

    const zones = ["North Zone", "South Zone", "East Zone", "West Zone"];
    const divisions = ["Division 1 (North)", "Division 2 (South)", "Division 3 (East)", "Division 4 (West)"];

    function handleTransfer() {
        if (!selectedZone) {
        ToastNotification(t('modals:transfer_employee.toast_select_zone'), "error");
        return;
        }
        
        if (employee.role !== "MHO" && !selectedDivision) {
        ToastNotification(t('modals:transfer_employee.toast_select_division'), "error");
        return;
        }

        ToastNotification(t('modals:transfer_employee.toast_transfer_success', { name: `${employee.first_name} ${employee.last_name}` }), "success");
        onClose();
    }

    return (
        <div onClick={onClose} className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-veryLarge p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondaryDark">{t('modals:transfer_employee.title')}</h2>
            <button 
                onClick={onClose}
                className="p-1 hover:scale-[0.99] transition-all duration-200 ease-in-out"
            >
                <X size={20} isDarkTheme={isDarkTheme} />
            </button>
            </div>

            <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-secondary">
                <img 
                src={employee.profile_pic || "https://via.placeholder.com/48"} 
                alt={employee.first_name}
                className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                <h3 className="text-base font-bold text-secondaryDark">
                    {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-xs text-secondaryDark">{employee.role}</p>
                </div>
            </div>

            <div>
                <p className="text-sm text-secondaryDark mb-2">{t('modals:transfer_employee.current_zone')} <span className="font-bold">{employee.zone}</span></p>
                {employee.role !== "MHO" && (
                <p className="text-sm text-secondaryDark">{t('modals:transfer_employee.current_division')} <span className="font-bold">{employee.division}</span></p>
                )}
            </div>

            <div className="space-y-4 mt-6">
                <div>
                <label className="block text-sm font-medium text-secondaryDark mb-2">{t('modals:transfer_employee.transfer_to_zone')}</label>
                <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                    <option value="">{t('modals:transfer_employee.select_zone')}</option>
                    {zones.map(function(zone) {
                    return (
                        <option key={zone} value={zone}>
                        {zone}
                        </option>
                    );
                    })}
                </select>
                </div>

                {employee.role !== "MHO" && (
                <div>
                    <label className="block text-sm font-medium text-secondaryDark mb-2">{t('modals:transfer_employee.transfer_to_division')}</label>
                    <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    >
                    <option value="">{t('modals:transfer_employee.select_division')}</option>
                    {divisions.map(function(division) {
                        return (
                        <option key={division} value={division}>
                            {division}
                        </option>
                        );
                    })}
                    </select>
                </div>
                )}
            </div>

            <div className="flex gap-3 mt-6">
                <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-secondary text-secondaryDark rounded-large font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                {t('modals:transfer_employee.cancel')}
                </button>
                <button
                onClick={handleTransfer}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-large font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                {t('modals:transfer_employee.transfer')}
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default TransferEmployeeModal;