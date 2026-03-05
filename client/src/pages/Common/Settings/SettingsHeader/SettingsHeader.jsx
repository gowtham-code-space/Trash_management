import React, { useState } from "react";
import { useTranslation } from "react-i18next";

//tabs
import AboutMe from "./Tabs/AboutMe";
import Address from "./Tabs/Address";
import Preference from "./Tabs/Preference";

function SettingsHeader() {
  const [activeTab, setActiveTab] = useState("about");
  const { t } = useTranslation('settings');

  const tabs = [
    { id: "about", label: t('tab_about') },
    { id: "address", label: t('tab_address') },
    { id: "preference", label: t('tab_preference') }
  ];

  function handleTabClick(tabId) {
    setActiveTab(tabId);
  }

  return (
    <div className="bg-background">
      <h1 className="text-2xl font-bold text-secondaryDark mb-8">{t('title')}</h1>

      <div className="flex gap-12 mb-0">
        {tabs.map(function (tab) {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={function () {
                handleTabClick(tab.id);
              }}
              className={`pb-3 text-base font-medium transition-all duration-200 relative ${
                isActive
                  ? "text-primary"
                  : "text-secondaryDark/60 hover:text-primary"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="w-full h-px bg-secondary mb-6"></div>
      
      {activeTab === "about" && <AboutMe/>}
      {activeTab === "address" && <Address/>}
      {activeTab === "preference" && <Preference/>}
    </div>
  );
}

export default SettingsHeader;