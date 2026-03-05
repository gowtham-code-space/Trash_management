import React from "react";
import { useTranslation } from "react-i18next";
import { X } from "../../../../assets/icons/icons";
import ThemeStore from "../../../../store/ThemeStore";

function ConfigRouteModal({ isOpen, onClose, mode, data, onSubmit }) {
  const { isDarkTheme } = ThemeStore();
  const { t } = useTranslation(["modals", "common"]);

  if (!isOpen) return null;

  function handleConfirm() {
    onSubmit();
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div  onClick={onClose} className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div onClick={(e)=>e.stopPropagation()}  className="bg-white rounded-large w-full max-w-md shadow-lg">
          <div className="flex items-center justify-between p-6 border-b border-secondary">
            <h2 className="text-lg font-bold text-secondaryDark">
              {t('modals:config_route.delete_title')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-medium hover:bg-background transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
            >
              <X size={20} isDarkTheme={isDarkTheme} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-secondaryDark">
              {t('modals:config_route.delete_confirm_prefix')}{" "}
              <span className="font-bold text-primary">{data?.name}</span>
              {t('modals:config_route.delete_confirm_suffix')}
            </p>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-secondary rounded-medium text-secondaryDark hover:bg-background transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 rounded-medium text-white bg-error transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
              >
                {t('common:delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigRouteModal;
