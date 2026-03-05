import React, { useState, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ThemeStore from "../../../store/ThemeStore";
import { Download, Search, Calendar } from "../../../assets/icons/icons";
import DateRangePicker from "../../../components/Modals/Calendar/DateRangePicker";
import ApiRequestLogs from "./tabs/ApiRequestLogs";
import AuditLogs from "./tabs/AuditLogs";
import EventLogs from "./tabs/EventLogs";
import { exportLogs } from "../../../services/features/adminService";
import { exportToExcel } from "../../../utils/excelExport";

const TYPE_MAP = { "API Requests": "api", "Audit Logs": "audit", "Event Logs": "event" };
const tabs = ["API Requests", "Audit Logs", "Event Logs"];
const dateFilters = ["Today", "This Week", "This Month", "Custom"];
const TAB_LABELS = { "API Requests": "tab_api_requests", "Audit Logs": "tab_audit_logs", "Event Logs": "tab_event_logs" };
const DATE_FILTER_LABELS = { "Today": "filter_today", "This Week": "filter_this_week", "This Month": "filter_this_month", "Custom": "filter_custom" };

export default function LogsHeader() {
  const { isDarkTheme } = ThemeStore();
  const { t } = useTranslation(["pages", "common"]);
  const [selectedTab, setSelectedTab] = useState("API Requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("Today");
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState(null);
  const [exporting, setExporting] = useState(false);
  const tabFiltersRef = useRef({});

  const dateRange = useMemo(() => {
    const now = new Date();
    if (dateFilter === "Today") {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      return { start: start.toISOString(), end: now.toISOString() };
    }
    if (dateFilter === "This Week") return { start: new Date(now - 7 * 86400000).toISOString(), end: now.toISOString() };
    if (dateFilter === "This Month") return { start: new Date(now - 30 * 86400000).toISOString(), end: now.toISOString() };
    if (dateFilter === "Custom" && customDateRange) return { start: customDateRange.from.toISOString(), end: customDateRange.to.toISOString() };
    return null;
  }, [dateFilter, customDateRange]);

  const handleFiltersChange = useCallback((filters) => {
    tabFiltersRef.current = filters;
  }, []);

  const tabComponents = { "API Requests": ApiRequestLogs, "Audit Logs": AuditLogs, "Event Logs": EventLogs };
  const ActiveTabComponent = tabComponents[selectedTab];

  function handleDateFilterClick(filter) {
    setDateFilter(filter);
    if (filter === "Custom") setShowDateRangePicker(true);
    else setShowDateRangePicker(false);
  }

  function handleDateRangeApply(from, to) {
    setCustomDateRange({ from, to });
    setShowDateRangePicker(false);
  }

  function handleDateRangeClose() {
    setShowDateRangePicker(false);
    setDateFilter("Today");
  }

  async function handleExport() {
    const type = TYPE_MAP[selectedTab];
    setExporting(true);
    try {
      const res = await exportLogs({ type, ...tabFiltersRef.current, start: dateRange?.start, end: dateRange?.end });
      if (res?.data) exportToExcel(res.data, `${type}_logs`);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="w-full">
        <div className="-mt-8 sticky z-10 -top-8 py-5 bg-background">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-1 mb-2 sm:gap-2 bg-white p-1 rounded-large w-full sm:w-fit overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setSelectedTab(tab)}
                  className={`px-3 sm:px-6 py-2 rounded-medium text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap
                    ${selectedTab === tab ? "bg-primaryLight text-white" : "text-secondaryDark hover:bg-background"}
                    hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]`}>
                  {t(`pages:admin.logs.${TAB_LABELS[tab]}`)}
                </button>
              ))}
            </div>
            <button onClick={handleExport} disabled={exporting}
              className="text-white bg-primaryLight text-xs sm:text-sm flex flex-row rounded-medium py-2 px-3 sm:px-4 items-center whitespace-nowrap w-full sm:w-auto justify-center
                        hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                        transition-all duration-200 ease-in-out disabled:opacity-60 disabled:pointer-events-none">
              <div className="mr-1"><Download size={20} defaultColor="white" isDarkTheme={true} /></div>
              {exporting ? t('pages:admin.logs.exporting') : t('pages:admin.logs.export_logs')}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 border-t border-secondary pt-4">
            <div className="relative flex-1">
              <div className="absolute top-1/2 left-3 -translate-y-1/2">
                <Search size={18} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
              </div>
              <input type="text" placeholder={t('pages:admin.logs.search_placeholder')} value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-medium text-sm border
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                        transition-all duration-200 ease-in-out
                        ${isDarkTheme
                          ? "bg-darkBackground border-darkBorder text-darkTextPrimary placeholder:text-darkTextSecondary"
                          : "bg-white border-secondary text-secondaryDark placeholder:text-gray-400"}`} />
            </div>

            <div className="flex items-center gap-2 flex-wrap relative">
              {dateFilters.map(filter => (
                <button key={filter} onClick={() => handleDateFilterClick(filter)}
                  className={`px-4 py-2.5 rounded-medium text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5
                    transition-all duration-200 ease-in-out border
                    hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                    ${dateFilter === filter
                      ? "bg-primary text-white border-primary"
                      : isDarkTheme
                      ? "bg-darkBackground border-darkBorder text-darkTextPrimary hover:bg-darkSurfaceHover"
                      : "bg-white border-secondary text-secondaryDark hover:bg-background"
                    }`}>
                  {filter === "Custom" && <Calendar size={14} defaultColor={dateFilter === filter ? "#fff" : isDarkTheme ? "#B7D6C9" : "#316F5D"} />}
                  {t(`pages:admin.logs.${DATE_FILTER_LABELS[filter]}`)}
                </button>
              ))}
              {showDateRangePicker && (
                <DateRangePicker onApply={handleDateRangeApply} onClose={handleDateRangeClose} isDarkTheme={isDarkTheme} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ActiveTabComponent searchQuery={searchQuery} dateRange={dateRange} onFiltersChange={handleFiltersChange} />
        </div>
      </div>
    </div>
  );
}

