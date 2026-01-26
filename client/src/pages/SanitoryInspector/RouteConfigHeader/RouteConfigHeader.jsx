import React, { useState } from "react";
import { Download } from "../../../assets/icons/icons";
import ConfigRoute from "./Tabs/ConfigRoute";
import AddStreet from "./Tabs/AddStreet";
import AssignTrashMen from "./Tabs/AssignTrashMen";

function RouteConfigHeader() {
  const [selectedTab, setSelectedTab] = useState("Routes");

  const tabs = ["Routes", "Streets", "Assign Trashman"];

  function handleTabClick(tab) {
    setSelectedTab(tab);
  }

  return (
    <div className="w-full">
      <div className="-mt-8 sticky z-10 -top-8 py-5 bg-background flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-1 mb-2 sm:gap-2 bg-white p-1 rounded-large w-full sm:w-fit overflow-x-auto">
            {tabs.map(function (tab) {
              const isActive = selectedTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-3 sm:px-6 py-2 rounded-medium text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap
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
          <button className="text-white bg-primaryLight text-xs sm:text-sm flex flex-row rounded-medium py-2 px-3 sm:px-2 items-center whitespace-nowrap w-full sm:w-auto justify-center
                            hover:scale-[0.99] active:scale-[0.99]
                            focus:outline-none focus:ring-2 focus:ring-primary/20
                            transition-all duration-200 ease-in-out">
            <div className="mr-1">
                <Download size={20} defaultColor="white"/>
            </div>
              Download
          </button>
      </div>

      <div className="mt-4">
        {selectedTab === "Routes" ? <ConfigRoute/> : selectedTab === "Streets" ? <AddStreet/> : <AssignTrashMen/>}
      </div>
    </div>
  );
}

export default RouteConfigHeader;
