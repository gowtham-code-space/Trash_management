import React, { useState } from "react";
import { Download } from "../../../assets/icons/icons";
import ConfigZone from "./Tabs/ConfigZone";
import ConfigDivision from "./Tabs/ConfigDivision";

function ConfigHeader() {
  const [selectedTab, setSelectedTab] = useState("Zones");

  const tabs = ["Zones", "Divisions", "Wards", "Streets"];

  function handleTabClick(tab) {
    setSelectedTab(tab);
  }

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between">
          <div className="flex items-center gap-2 bg-white p-1 rounded-large w-fit">
            {tabs.map(function (tab) {
              const isActive = selectedTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-6 py-2 rounded-medium text-sm font-medium transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? "bg-primaryLight text-white"
                        : "text-secondaryDark hover:bg-background"
                    }
                    hover:scale-[0.99] active:scale-[0.99]
                  `}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <button className="text-white bg-primaryLight text-sm flex flex-row rounded-medium py-1 px-2 items-center">
            <div className="mr-1">
                <Download size={20} defaultColor="white"/>
            </div>
              Download
          </button>
      </div>

      <div className="mt-4">
        {selectedTab === "Zones" ? <ConfigZone/> : selectedTab === "Divisions" ? <ConfigDivision/> : ""}
      </div>
    </div>
  );
}

export default ConfigHeader;