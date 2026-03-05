import React from "react";
import { Check, X } from "../../../assets/icons/icons";
import { useTranslation } from "react-i18next";

function AttendanceConfirmationModal({ isOpen, worker, action, onConfirm, onClose }) {
  const { t } = useTranslation(["modals", "common"]);
  if (!isOpen || !worker) return null;

  const isVerify = action === "verify";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-large max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${isVerify ? 'bg-success/10' : 'bg-error/10'}`}>
            {isVerify ? (
              <Check size={24} defaultColor="#1E8E54" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-error flex items-center justify-center">
                <span className="text-error text-lg font-bold">!</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-secondaryDark mb-1">
              {isVerify ? t('modals:attendance_confirmation.verify_title') : t('modals:attendance_confirmation.reject_title')}
            </h3>
            <p className="text-sm text-secondaryDark">
              {isVerify 
                ? `${t('modals:attendance_confirmation.verify_message')} ${worker.name}?`
                : `${t('modals:attendance_confirmation.reject_message')} ${worker.name}? ${t('modals:attendance_confirmation.reject_suffix')}`
              }
            </p>
          </div>
        </div>

        <div className="bg-secondary p-4 rounded-medium space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-secondaryDark">{t('modals:attendance_confirmation.name')}</span>
            <span className="font-medium text-secondaryDark">{worker.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondaryDark">{t('modals:attendance_confirmation.employee_id')}</span>
            <span className="font-medium text-secondaryDark">{worker.empId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondaryDark">{t('modals:attendance_confirmation.check_in_time')}</span>
            <span className="font-medium text-secondaryDark">{worker.checkInTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondaryDark">{t('modals:attendance_confirmation.location')}</span>
            <span className="font-medium text-secondaryDark">{worker.location}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-secondary text-secondaryDark text-sm font-medium rounded-medium
                    hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                    transition-all duration-200 ease-in-out"
          >
            {t('modals:attendance_confirmation.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-white text-sm font-medium rounded-medium
                    hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                    transition-all duration-200 ease-in-out ${
                      isVerify ? 'bg-success' : 'bg-error'
                    }`}
          >
            {isVerify ? t('modals:attendance_confirmation.verify') : t('modals:attendance_confirmation.reject')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceConfirmationModal;