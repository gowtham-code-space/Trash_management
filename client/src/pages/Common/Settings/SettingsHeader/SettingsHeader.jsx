import React, { useState } from "react";

//tabs
import AboutMe from "./Tabs/AboutMe";
import Address from "./Tabs/Address";
import Preference from "./Tabs/Preference";

function SettingsHeader() {
  const [activeTab, setActiveTab] = useState("about");

  const tabs = [
    { id: "about", label: "About me" },
    { id: "address", label: "Address" },
    { id: "preference", label: "Preference & Logout" }
  ];

  function handleTabClick(tabId) {
    setActiveTab(tabId);
  }

  return (
    <div className="bg-background">
      <h1 className="text-2xl font-bold text-secondaryDark mb-8">Settings</h1>

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