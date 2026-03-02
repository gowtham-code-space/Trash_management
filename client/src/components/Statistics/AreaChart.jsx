import React, { useState, useRef, useEffect } from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ThemeStore from "../../store/ThemeStore";
import DateRangePicker from "../../components/Modals/Calendar/DateRangePicker";

const TIME_FILTERS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Custom", value: "custom" },
];

function AreaChart({ 
  title, 
  subtitle, 
  data, 
  showFilters = true,
  activeFilter: externalActiveFilter,
  customLabel: externalCustomLabel,
  showDatePicker: externalShowDatePicker,
  onFilterClick,
  onDateApply,
  onCloseDatePicker,
  syncId
}) {
  const { isDarkTheme } = ThemeStore();
  const [activeFilter, setActiveFilter] = useState("today");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customLabel, setCustomLabel] = useState(null);
  const pickerRef = useRef(null);

  // Use external state if provided, otherwise use internal state
  const currentActiveFilter = showFilters && externalActiveFilter !== undefined ? externalActiveFilter : activeFilter;
  const currentCustomLabel = showFilters && externalCustomLabel !== undefined ? externalCustomLabel : customLabel;
  const currentShowDatePicker = showFilters && externalShowDatePicker !== undefined ? externalShowDatePicker : showDatePicker;

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        if (onCloseDatePicker) {
          onCloseDatePicker();
        } else {
          setShowDatePicker(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCloseDatePicker]);

  function handleFilterClick(value) {
    if (onFilterClick) {
      onFilterClick(value);
    } else {
      if (value === "custom") {
        setShowDatePicker(!showDatePicker);
      } else {
        setActiveFilter(value);
        setCustomLabel(null);
        setShowDatePicker(false);
      }
    }
  }

  function handleDateApply(from, to) {
    if (onDateApply) {
      onDateApply(from, to);
    } else {
      const fmt = (d) =>
        `${d.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]}`;
      setCustomLabel(`${fmt(from)} – ${fmt(to)}`);
      setActiveFilter("custom");
      setShowDatePicker(false);
    }
  }

  const chartData = data || [];

  const gridColor = isDarkTheme ? "#254C40" : "#ECF7F0";
  const textColor = isDarkTheme ? "#B7D6C9" : "#316F5D";
  const tooltipBg = isDarkTheme ? "#162E26" : "#ffffff";
  const tooltipBorder = isDarkTheme ? "#254C40" : "#ECF7F0";

  return (
    <div
      className={`rounded-large border p-4 transition-all duration-200
        ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}
    >
      <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
        <div>
          <h3 className={`text-sm font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-xs mt-0.5 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
              {subtitle}
            </p>
          )}
        </div>

        {showFilters && (
          <div className="relative flex items-center gap-1 flex-wrap" ref={pickerRef}>
            {TIME_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterClick(filter.value)}
                className={`px-3 py-1 rounded-medium text-xs font-semibold hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
                  ${currentActiveFilter === filter.value
                    ? "bg-primary text-white"
                    : isDarkTheme
                    ? "bg-darkBackground text-darkTextSecondary hover:bg-darkSurfaceHover"
                    : "bg-secondary text-secondaryDark hover:bg-secondary"
                  }`}
              >
                {filter.value === "custom" && currentCustomLabel ? currentCustomLabel : filter.label}
              </button>
            ))}

            {currentShowDatePicker && (
              <DateRangePicker
                onApply={handleDateApply}
                onClose={onCloseDatePicker || (() => setShowDatePicker(false))}
                isDarkTheme={isDarkTheme}
              />
            )}
          </div>
        )}
      </div>

      <div className="h-56 mt-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className={`text-xs ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/60'}`}>No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart 
              data={chartData} 
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              syncId={syncId}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#145B47" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#145B47" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: textColor }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: textColor }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: textColor,
                }}
                cursor={{ stroke: "#145B47", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#145B47"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#145B47", stroke: "#fff", strokeWidth: 2 }}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        )}
        </div>
    </div>
  );
}

export default AreaChart;
