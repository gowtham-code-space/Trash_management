import React, { useState, useRef, useEffect } from "react";
import Pagination from "../../../../utils/Pagination";
import LogDetailsModal from "../../../../components/Modals/Admin/LogDetailsModal";
import { RightArrow, DownArrow } from "../../../../assets/icons/icons";

const mockEventLogs = [
  {
    event_log_id: "EVT-3823",
    event_type: "SYSTEM_CRASH",
    entity_type: "Server_Node",
    entity_id: "NODE-83",
    user_id: "System_Kernel",
    severity: "CRITICAL",
    metadata: { error: "Out of memory", pid: 1234 },
    created_at: "Oct 24, 09:55 AM"
  },
  {
    event_log_id: "EVT-3828",
    event_type: "HIGH_LATENCY",
    entity_type: "API_Gateway",
    entity_id: "GW-EAST-1",
    user_id: "Load_Balancer",
    severity: "WARNING",
    metadata: { latency_ms: 2500, threshold: 1000 },
    created_at: "Oct 24, 09:48 AM"
  },
  {
    event_log_id: "EVT-3819",
    event_type: "AUTH_FAILURE",
    entity_type: "User_Session",
    entity_id: "USR-8821",
    user_id: "Admin_01",
    severity: "WARNING",
    metadata: { attempts: 3, reason: "Invalid password" },
    created_at: "Oct 24, 09:42 AM"
  },
  {
    event_log_id: "EVT-3818",
    event_type: "DATA_EXPORT",
    entity_type: "Report_Module",
    entity_id: "RPT-CSV-99",
    user_id: "MHO_Salem",
    severity: "INFO",
    metadata: { records: 1500, format: "CSV" },
    created_at: "Oct 24, 09:30 AM"
  },
  {
    event_log_id: "EVT-3817",
    event_type: "SERVICE_RESTART",
    entity_type: "Notif_Service",
    entity_id: "SVC-NTF-01",
    user_id: "Auto_Heal_Bot",
    severity: "INFO",
    metadata: { reason: "Unresponsive", downtime: "30s" },
    created_at: "Oct 24, 09:15 AM"
  }
];

export default function EventLogs({ searchQuery = "" }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filters, setFilters] = useState({
    eventType: "All",
    severity: "All",
    entityType: "All"
  });

  const dropdownRef = useRef(null);

  useEffect(function () {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return function () { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  const filteredLogs = mockEventLogs.filter(log => {
    const matchesSearch = log.event_log_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEventType = filters.eventType === "All" || log.event_type === filters.eventType;
    const matchesSeverity = filters.severity === "All" || log.severity === filters.severity;
    const matchesEntityType = filters.entityType === "All" || log.entity_type === filters.entityType;

    return matchesSearch && matchesEventType && matchesSeverity && matchesEntityType;
  });

  function handleDetailsClick(log) {
    setSelectedLog(log);
    setIsModalOpen(true);
  }

  function toggleDropdown(column) {
    setOpenDropdown(openDropdown === column ? null : column);
  }

  function handleFilterChange(column, value) {
    setFilters(function (prev) {
      return { ...prev, [column]: value };
    });
    setOpenDropdown(null);
  }

  function ColumnHeader({ label, column, options }) {
    return (
      <div className="relative" ref={column ? dropdownRef : null}>
        <button
          onClick={() => column && toggleDropdown(column)}
          className="flex items-center gap-1.5 text-xs font-bold hover:text-primary transition-colors duration-200"
        >
          <span>{label}</span>
          {column && <DownArrow size={10} defaultColor="#316F5D" />}
        </button>
        
        {column && openDropdown === column && (
          <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-large border border-secondary shadow-xl z-50 overflow-hidden">
            {options.map(function (option) {
              const isActive = filters[column] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleFilterChange(column, option)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all duration-200
                    hover:bg-background border-b border-secondary last:border-0
                    ${isActive ? "bg-primary/10 text-primary font-bold" : "text-secondaryDark"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function SeverityBadge({ severity }) {
    let colorClass = "";
    if (severity === "CRITICAL") colorClass = "bg-error/10 text-error";
    else if (severity === "WARNING") colorClass = "bg-warning/10 text-warning";
    else colorClass = "bg-success/10 text-success";

    return (
      <span className={`px-2 py-1 rounded-small text-xs font-medium ${colorClass}`}>
        {severity}
      </span>
    );
  }

  return (
    <div className="bg-secondary rounded-large p-4">
      {/* Table Container - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        {/* Table Header - Always visible */}
        <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-white rounded-medium mb-2 text-xs font-bold text-secondaryDark border border-secondary min-w-200">
          <div>Event ID</div>
          <ColumnHeader label="Event Type" column="eventType" options={["All", ...Array.from(new Set(mockEventLogs.map(l => l.event_type)))]} />
          <ColumnHeader label="Entity Type" column="entityType" options={["All", ...Array.from(new Set(mockEventLogs.map(l => l.entity_type)))]} />
          <div>Entity ID</div>
          <ColumnHeader label="Severity" column="severity" options={["All", "CRITICAL", "WARNING", "INFO"]} />
          <div>Date</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-large overflow-hidden border border-secondary min-w-200">
          <Pagination
            data={filteredLogs}
            itemsPerPage={8}
            renderItem={(log) => (
              <div key={log.event_log_id} className="border-b border-secondary last:border-0">
                <div className="grid grid-cols-7 gap-4 p-4 text-sm hover:bg-secondary/50 transition-all duration-200 ease-in-out">
                  <div className="font-medium text-primary">{log.event_log_id}</div>
                  <div className="text-secondaryDark">{log.event_type}</div>
                  <div className="text-secondaryDark">{log.entity_type}</div>
                  <div className="text-secondaryDark">{log.entity_id}</div>
                  <div><SeverityBadge severity={log.severity} /></div>
                  <div className="text-secondaryDark text-xs">{log.created_at}</div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDetailsClick(log)}
                      className="p-1.5 hover:bg-secondary rounded-small transition-all duration-200 ease-in-out
                               hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
                    >
                      <RightArrow size={14} className="text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Details Modal */}
      <LogDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        logData={selectedLog}
        logType="event"
      />
    </div>
  );
}