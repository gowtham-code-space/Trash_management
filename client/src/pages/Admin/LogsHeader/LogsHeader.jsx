import React, { useState } from "react";
import ThemeStore from "../../../store/ThemeStore";
import { Download, Search, Calendar, DownArrow } from "../../../assets/icons/icons";
import DateRangePicker from "../../../components/Modals/Calendar/DateRangePicker";
import ApiRequestLogs from "./tabs/ApiRequestLogs";
import AuditLogs from "./tabs/AuditLogs";
import EventLogs from "./tabs/EventLogs";

export default function LogsHeader() {
  const { isDarkTheme } = ThemeStore();
  const [selectedTab, setSelectedTab] = useState("API Requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("Today");
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  const tabs = ["API Requests", "Audit Logs", "Event Logs"];
  const dateFilters = ["Today", "This Week", "This Month", "Custom"];

  function handleTabClick(tab) {
    setSelectedTab(tab);
  }

  function handleDateFilterClick(filter) {
    setDateFilter(filter);
    if (filter === "Custom") {
      setShowDateRangePicker(true);
    } else {
      setShowDateRangePicker(false);
    }
  }

  function handleDateRangeApply(fromDate, toDate) {
    console.log("Date range selected:", fromDate, toDate);
    setShowDateRangePicker(false);
  }

  function handleDateRangeClose() {
    setShowDateRangePicker(false);
    setDateFilter("Today");
  }

  const tabComponents = {
    "API Requests": ApiRequestLogs,
    "Audit Logs": AuditLogs,
    "Event Logs": EventLogs,
  };

  const ActiveTabComponent = tabComponents[selectedTab];

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="w-full">
        {/* Sticky Header */}
        <div className="-mt-8 sticky z-10 -top-8 py-5 bg-background">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
            {/* Tabs */}
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
                      hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                    `}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Export Button */}
            <button className="text-white bg-primaryLight text-xs sm:text-sm flex flex-row rounded-medium py-2 px-3 sm:px-4 items-center whitespace-nowrap w-full sm:w-auto justify-center
                              hover:scale-[0.99] active:scale-[0.99]
                              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                              transition-all duration-200 ease-in-out">
              <div className="mr-1">
                <Download size={20} defaultColor="white" isDarkTheme={true} />
              </div>
              Export Logs
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 border-t border-secondary pt-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute top-1/2 left-3 -translate-y-1/2">
                <Search size={18} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
              </div>
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-medium text-sm border
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                        transition-all duration-200 ease-in-out
                        ${isDarkTheme
                          ? "bg-darkBackground border-darkBorder text-darkTextPrimary placeholder:text-darkTextSecondary"
                          : "bg-white border-secondary text-secondaryDark placeholder:text-gray-400"}`}
              />
            </div>

            {/* Date Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap relative">
              {dateFilters.map(function (filter) {
                const isActive = dateFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => handleDateFilterClick(filter)}
                    className={`px-4 py-2.5 rounded-medium text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5
                      transition-all duration-200 ease-in-out border
                      hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                      ${isActive
                        ? "bg-primary text-white border-primary"
                        : isDarkTheme
                        ? "bg-darkBackground border-darkBorder text-darkTextPrimary hover:bg-darkSurfaceHover"
                        : "bg-white border-secondary text-secondaryDark hover:bg-background"
                      }`}
                  >
                    {filter === "Custom" && <Calendar size={14} defaultColor={isActive ? "#fff" : isDarkTheme ? "#B7D6C9" : "#316F5D"} />}
                    {filter}
                  </button>
                );
              })}
              
              {/* DateRangePicker */}
              {showDateRangePicker && (
                <DateRangePicker
                  onApply={handleDateRangeApply}
                  onClose={handleDateRangeClose}
                  isDarkTheme={isDarkTheme}
                />
              )}
            </div>
          </div>
        </div>

        {/* Render Active Tab Component */}
        <div className="mt-4">
          <ActiveTabComponent searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}