import React from "react";
import ThemeStore from "../../../store/ThemeStore";
import { Check, X, Info } from "../../../assets/icons/icons";

function ConfirmModal({ isOpen, title, message, onConfirm, onClose, confirmText = "Confirm", cancelText = "Cancel", type = "submit" }) {
  const { isDarkTheme } = ThemeStore();
  
  if (!isOpen) return null;

  const getIconColor = () => {
    if (type === "submit") return "bg-success/10";
    if (type === "exit") return "bg-error/10";
    return "bg-primaryLight/10";
  };

  const getIcon = () => {
    if (type === "submit") {
      return <Check size={24} defaultColor="#1E8E54" />;
    }
    if (type === "exit") {
      return <X size={24} defaultColor="#E75A4C" />;
    }
    return <Info size={24} defaultColor="#1E8E54" />;
  };

  const getButtonColor = () => {
    if (type === "submit") return "bg-success";
    if (type === "exit") return "bg-error";
    return "bg-primary";
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={`rounded-large max-w-md w-full p-6 space-y-4 border-2
          ${isDarkTheme 
            ? "bg-darkSurface border-darkBorder" 
            : "bg-white border-gray-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${getIconColor()}`}>
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <h3 className={`text-lg font-bold mb-1 ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
              {title}
            </h3>
            <p className={`text-sm ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-medium
              hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
              transition-all duration-200 ease-in-out
              ${isDarkTheme 
                ? "bg-darkBackground text-darkTextPrimary border-2 border-darkBorder" 
                : "bg-secondary text-secondaryDark"}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-white text-sm font-medium rounded-medium
              hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
              transition-all duration-200 ease-in-out ${getButtonColor()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
