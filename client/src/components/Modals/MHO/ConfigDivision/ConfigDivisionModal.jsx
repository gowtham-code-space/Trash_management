import React from "react";
import ThemeStore from "../../../../store/ThemeStore";

function ConfigDivisionModal({ title, message, onConfirm, onCancel }) {
  const { isDarkTheme } = ThemeStore();

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-large p-6 max-w-md w-full mx-4 border border-secondary">
          <h3 className="text-lg font-bold text-secondaryDark mb-3">
            {title}
          </h3>
          
          <p className="text-sm text-secondaryDark mb-6">
            {message}
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-secondary rounded-medium text-sm font-bold text-secondaryDark bg-white
                        hover:scale-[0.99] active:scale-[0.99]
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                        transition-all duration-200 ease-in-out"
              >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-error text-white rounded-medium text-sm font-bold
                        hover:scale-[0.99] active:scale-[0.99]
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                        transition-all duration-200 ease-in-out"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigDivisionModal;