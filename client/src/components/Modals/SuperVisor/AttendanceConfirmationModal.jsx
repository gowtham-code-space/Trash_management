import React from "react";
import { Check, X } from "../../../assets/icons/icons";

function AttendanceConfirmationModal({ isOpen, worker, action, onConfirm, onClose }) {
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
              {isVerify ? "Verify Attendance" : "Reject Attendance"}
            </h3>
            <p className="text-sm text-secondaryDark">
              {isVerify 
                ? `Are you sure you want to verify attendance for ${worker.name}?`
                : `Are you sure you want to reject attendance for ${worker.name}? This will mark them as absent.`
              }
            </p>
          </div>
        </div>

        <div className="bg-secondary p-4 rounded-medium space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-secondaryDark">Name:</span>
            <span className="font-medium text-secondaryDark">{worker.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondaryDark">Employee ID:</span>
            <span className="font-medium text-secondaryDark">{worker.empId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondaryDark">Check-in Time:</span>
            <span className="font-medium text-secondaryDark">{worker.checkInTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondaryDark">Location:</span>
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
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-white text-sm font-medium rounded-medium
                     hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                     transition-all duration-200 ease-in-out ${
                       isVerify ? 'bg-success' : 'bg-error'
                     }`}
          >
            {isVerify ? "Verify" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceConfirmationModal;