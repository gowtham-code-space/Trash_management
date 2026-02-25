import React, { useState, useRef, useEffect } from "react";
import Pagination from "../../../../utils/Pagination";
import LogDetailsModal from "../../../../components/Modals/Admin/LogDetailsModal";
import { RightArrow, DownArrow } from "../../../../assets/icons/icons";

const mockApiLogs = [
  {
    api_log_id: "API-5021",
    user_id: "Admin_01",
    role_id: "SUPER_ADMIN",
    endpoint: "/api/v1/complaints",
    http_method: "GET",
    status_code: 200,
    response_time_ms: 120,
    ip_address: "192.168.1.42",
    user_agent: "Mozilla/5.0",
    request_body: null,
    response_body: { count: 45 },
    created_at: "Oct 24, 09:42:12"
  },
  {
    api_log_id: "API-5020",
    user_id: "MiHO_Salem",
    role_id: "MHO",
    endpoint: "/api/v1/auth/login",
    http_method: "POST",
    status_code: 200,
    response_time_ms: 85,
    ip_address: "10.0.0.12",
    user_agent: "PostmanRuntime/7.26.8",
    request_body: { username: "mh_salem" },
    response_body: { token: "***" },
    created_at: "Oct 24, 09:30:45"
  },
  {
    api_log_id: "API-5019",
    user_id: "Supervisor_04",
    role_id: "SUPERVISOR",
    endpoint: "/api/v1/zones/NZ-01/config",
    http_method: "PUT",
    status_code: 403,
    response_time_ms: 20,
    ip_address: "192.168.4.101",
    user_agent: "Mozilla/5.0",
    request_body: { zone_config: {} },
    response_body: { error: "Forbidden" },
    created_at: "Oct 24, 09:15:22"
  },
  {
    api_log_id: "API-5018",
    user_id: "Commissioner_01",
    role_id: "COMMISSIONER",
    endpoint: "/api/v1/dashboard/status",
    http_method: "GET",
    status_code: 200,
    response_time_ms: 340,
    ip_address: "172.16.0.5",
    user_agent: "Mozilla/5.0",
    request_body: null,
    response_body: { status: "healthy" },
    created_at: "Oct 24, 08:55:10"
  },
  {
    api_log_id: "API-5017",
    user_id: "Admin_02",
    role_id: "ADMIN",
    endpoint: "/api/v1/employees/EMP-99",
    http_method: "DELETE",
    status_code: 500,
    response_time_ms: 512,
    ip_address: "192.168.1.45",
    user_agent: "Mozilla/5.0",
    request_body: null,
    response_body: { error: "Internal Server Error" },
    created_at: "Oct 24, 08:45:33"
  },
  {
    api_log_id: "API-5016",
    user_id: "Guest_User",
    role_id: "GUEST",
    endpoint: "/api/v1/public/map",
    http_method: "GET",
    status_code: 200,
    response_time_ms: 45,
    ip_address: "45.22.19.112",
    user_agent: "Mozilla/5.0",
    request_body: null,
    response_body: { map_data: "***" },
    created_at: "Oct 24, 08:30:11"
  },
  {
    api_log_id: "API-5015",
    user_id: "Supervisor_05",
    role_id: "SUPERVISOR",
    endpoint: "/api/v1/complaints/COM-22/assign",
    http_method: "POST",
    status_code: 201,
    response_time_ms: 110,
    ip_address: "192.168.4.105",
    user_agent: "Mozilla/5.0",
    request_body: { assignee: "EMP-88" },
    response_body: { success: true },
    created_at: "Oct 24, 08:15:00"
  },
  {
    api_log_id: "API-5014",
    user_id: "Admin_01",
    role_id: "SUPER_ADMIN",
    endpoint: "/api/v1/logs/export",
    http_method: "GET",
    status_code: 200,
    response_time_ms: 1200,
    ip_address: "192.168.1.42",
    user_agent: "Mozilla/5.0",
    request_body: null,
    response_body: { export_url: "/exports/logs.csv" },
    created_at: "Oct 24, 08:05:00"
  }
];

export default function ApiRequestLogs({ searchQuery = "" }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filters, setFilters] = useState({
    method: "All",
    status: "All",
    user: "All"
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

  const filteredLogs = mockApiLogs.filter(log => {
    const matchesSearch = log.api_log_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = filters.method === "All" || log.http_method === filters.method;
    const matchesStatus = filters.status === "All" || 
      (filters.status === "2xx" && log.status_code >= 200 && log.status_code < 300) ||
      (filters.status === "4xx" && log.status_code >= 400 && log.status_code < 500) ||
      (filters.status === "5xx" && log.status_code >= 500);
    const matchesUser = filters.user === "All" || log.user_id === filters.user;

    return matchesSearch && matchesMethod && matchesStatus && matchesUser;
  });

  function handleDetailsClick(log) {
    setSelectedLog(log);
    setIsModalOpen(true);
  }

  function toggleExpand(logId) {
    setExpandedRow(expandedRow === logId ? null : logId);
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

  function StatusBadge({ code }) {
    let bgColor = "";
    if (code >= 200 && code < 300) bgColor = "bg-success/10 text-success";
    else if (code >= 400 && code < 500) bgColor = "bg-warning/10 text-warning";
    else if (code >= 500) bgColor = "bg-error/10 text-error";
    else bgColor = "bg-secondary text-secondaryDark";

    return (
      <span className={`px-2 py-1 rounded-small text-xs font-medium ${bgColor}`}>
        {code}
      </span>
    );
  }

  return (
    <div className="bg-secondary rounded-large p-4">
      {/* Table Container - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        {/* Table Header - Always visible */}
        <div className="grid grid-cols-8 gap-4 px-4 py-3 bg-white rounded-medium mb-2 text-xs font-bold text-secondaryDark border border-secondary min-w-200">
          <div>Log ID</div>
          <ColumnHeader label="Method" column="method" options={["All", "GET", "POST", "PUT", "DELETE"]} />
          <div className="col-span-2">Endpoint</div>
          <ColumnHeader label="Status" column="status" options={["All", "2xx", "4xx", "5xx"]} />
          <div>Time</div>
          <ColumnHeader label="User" column="user" options={["All", ...Array.from(new Set(mockApiLogs.map(l => l.user_id)))]} />
          <div className="text-right">Actions</div>
        </div>

        <div className="bg-white rounded-large overflow-hidden border border-secondary min-w-200">
          <Pagination
            data={filteredLogs}
            itemsPerPage={8}
            renderItem={(log) => (
              <div key={log.api_log_id}>
                <div className="grid grid-cols-8 gap-4 p-4 text-sm hover:bg-secondary/50 transition-all duration-200 ease-in-out border-b border-secondary last:border-0">
                  <div className="font-medium text-primary">{log.api_log_id}</div>
                  <div className="text-secondaryDark">
                    <span className="bg-secondary px-2 py-1 rounded-small text-xs">{log.http_method}</span>
                  </div>
                  <div className="col-span-2 text-secondaryDark truncate">{log.endpoint}</div>
                  <div><StatusBadge code={log.status_code} /></div>
                  <div className="text-secondaryDark">{log.response_time_ms}ms</div>
                  <div className="text-secondaryDark truncate">{log.user_id}</div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDetailsClick(log)}
                      className="p-1.5 hover:bg-secondary rounded-small transition-all duration-200 ease-in-out
                               hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
                    >
                      <RightArrow size={14} className="text-primary" />
                    </button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedRow === log.api_log_id && (
                  <div className="px-4 py-3 bg-background border-t border-secondary">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-secondaryDark">IP Address:</span>
                        <span className="text-xs text-primary font-medium">{log.ip_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-secondaryDark">Date:</span>
                        <span className="text-xs text-primary font-medium">{log.created_at}</span>
                      </div>
                    </div>
                  </div>
                )}
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
        logType="api"
      />
    </div>
  );
}