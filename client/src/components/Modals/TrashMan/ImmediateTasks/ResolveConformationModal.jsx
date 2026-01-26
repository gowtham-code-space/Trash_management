import React from "react";
import { Info } from "../../../../assets/icons/icons";

function ResolveConfirmationModal({ isOpen, onClose, onConfirm, task }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      <div className="relative bg-white border border-secondary rounded-xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        <div className="mx-auto w-14 h-14 bg-warning rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-warning/30">
          <Info size={32} isPressed={false} isDarkTheme={true} />
        </div>

        <h2 className="text-xl font-bold text-primary mb-2 tracking-tight">Confirm Resolution</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Are you sure you want to mark this task as resolved? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-secondary text-secondaryDark py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 bg-success text-white py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResolveConfirmationModal;