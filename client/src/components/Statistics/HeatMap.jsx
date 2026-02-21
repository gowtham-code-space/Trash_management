import React, { useState } from "react";

function HeatMap({ year = new Date().getFullYear(), data = {} }) {
  // Default sample data if no data is provided


  const complaintData = data;
  
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    date: "",
    complaints: 0,
  });

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function getHeatColor(complaints) {
    if (!complaints || complaints === 0) return "#F5F5F5";
    if (complaints < 5) return "#D1F4E0";
    if (complaints < 10) return "#7ECDA3";
    if (complaints < 15) return "#1E8E54";
    return "#145B47";
  }

  function handleHover(e, dateStr, complaints) {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString("en-US", { month: "short" });

    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      date: `${dayName}, ${monthName} ${dayNum}`,
      complaints: complaints,
    });
  }

  function handleMove(e) {
    if (tooltip.visible) {
      setTooltip(function (prev) {
        return { ...prev, x: e.clientX, y: e.clientY };
      });
    }
  }

  function handleLeave() {
    setTooltip({
      visible: false,
      x: 0,
      y: 0,
      date: "",
      complaints: 0,
    });
  }

  return (
    <>
      <div className="bg-white p-6 rounded-large border border-secondary shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-base font-semibold text-secondaryDark">
            Complaint Activity Heatmap
          </h3>
          <select
            value={year}
            className="px-3 py-2 text-sm bg-background text-secondaryDark border border-secondary rounded-medium hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value={new Date().getFullYear()}>
              {new Date().getFullYear()}
            </option>
            <option value={new Date().getFullYear() - 1}>
              {new Date().getFullYear() - 1}
            </option>
          </select>
        </div>

        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3">
          {months.map(function (month, mIdx) {
            const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
            return (
              <div key={month} className="flex flex-col gap-2">
                <div className="grid grid-rows-7 grid-flow-col gap-1">
                  {[...Array(daysInMonth)].map(function (_, d) {
                    const dateStr = `${year}-${String(mIdx + 1).padStart(
                      2,
                      "0"
                    )}-${String(d + 1).padStart(2, "0")}`;
                    const complaints = complaintData[dateStr] || 0;

                    return (
                      <div
                        key={d}
                        onMouseEnter={function (e) {
                          handleHover(e, dateStr, complaints);
                        }}
                        onMouseMove={handleMove}
                        onMouseLeave={handleLeave}
                        style={{ backgroundColor: getHeatColor(complaints) }}
                        className="w-4 h-4 rounded-sm cursor-pointer border border-gray-200"
                        title={`${complaints} complaint${complaints !== 1 ? "s" : ""}`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-secondaryDark font-medium text-center">
                  {month}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-secondary">
          <span className="text-xs font-medium text-gray-600">
            Less
          </span>
          <div className="flex gap-1.5">
            <div 
              className="w-3 h-3 rounded-sm border border-gray-200" 
              style={{ backgroundColor: "#F5F5F5" }}
            />
            <div 
              className="w-3 h-3 rounded-sm border border-gray-200" 
              style={{ backgroundColor: "#D1F4E0" }}
            />
            <div 
              className="w-3 h-3 rounded-sm border border-gray-200" 
              style={{ backgroundColor: "#7ECDA3" }}
            />
            <div 
              className="w-3 h-3 rounded-sm border border-gray-200" 
              style={{ backgroundColor: "#1E8E54" }}
            />
            <div 
              className="w-3 h-3 rounded-sm border border-gray-200" 
              style={{ backgroundColor: "#145B47" }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600">
            More
          </span>
        </div>
      </div>

      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 30}px`,
            pointerEvents: "none",
            zIndex: 9999,
          }}
          className="bg-secondaryDark text-white px-3 py-2 rounded-md text-xs font-medium shadow-lg"
        >
          <div className="font-semibold">{tooltip.date}</div>
          <div className="mt-1">
            {tooltip.complaints} complaint{tooltip.complaints !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </>
  );
}

export default HeatMap;