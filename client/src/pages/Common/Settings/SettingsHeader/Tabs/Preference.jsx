import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Language, Brightness, LogOut } from "../../../../../assets/icons/icons";
import ThemeStore from "../../../../../store/ThemeStore";
import ToastNotification from "../../../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";

function Preference() {
  const navigate = useNavigate();
  const { isDarkTheme, toggleTheme } = ThemeStore();
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    "English",
    "Tamil",
    "Hindi",
    "Malayalam",
    "Telugu",
    "Kannada"
  ];

  function handleLanguageChange(e) {
    setSelectedLanguage(e.target.value);
    ToastNotification(`Language changed to ${e.target.value}`, "success");
  }

  function handleThemeToggle() {
    toggleTheme();
    ToastNotification(
      isDarkTheme ? "Switched to Light Mode" : "Switched to Dark Mode",
      "success"
    );
  }

  function handleLogout() {
    ToastNotification("Logging out...", "info");
    setTimeout(function () {
      navigate("/login");
    }, 1000);
  }

  return (
    <div className="bg-background py-5">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-secondary rounded-large shadow-sm p-6 space-y-6">
          {/* Preferred Language */}
          <div>
            <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
              Preferred Language
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Language size={18} defaultColor="#316F5D" />
              </div>
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="w-full pl-10 pr-10 py-3 bg-background border border-secondary rounded-medium text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer appearance-none"
              >
                {languages.map(function (language) {
                  return (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-secondaryDark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brightness size={18} defaultColor="#316F5D" />
                  <label className="text-xs font-semibold text-secondaryDark/60">
                    Dark Mode
                  </label>
                </div>
                <p className="text-xs text-secondaryDark/60 ml-6">
                  Switch between light and dark themes
                </p>
              </div>

              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
                  isDarkTheme ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                    isDarkTheme ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-error/10 text-error py-3 rounded-large text-sm font-bold flex items-center justify-center gap-2 hover:bg-error/20 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-error/20 transition-all duration-200 ease-in-out"
        >
          <LogOut size={18} defaultColor="#E75A4C" />
          Log Out
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Preference;
