import React, { useState, useRef, useEffect } from "react";
import Pagination from "../../../../utils/Pagination";
import LogDetailsModal from "../../../../components/Modals/Admin/LogDetailsModal";
import { RightArrow, DownArrow } from "../../../../assets/icons/icons";

const mockAuditLogs = [
  {
    audit_log_id: "AUD-9821",
    entity_type: "User_Profile",
    entity_id: "EMP-8821",
    action_type: "UPDATE",
    old_value: { role: "MHO" },
    new_value: { role: "Supervisor" },
    performed_by: "Admin_01",
    performed_role_id: "SUPER_ADMIN",
    ip_address: "192.168.1.42",
    user_agent: "Mozilla/5.0",
    remarks: "Role updated",
    created_at: "Oct 24, 09:42 AM"
  },
  {
    audit_log_id: "AUD-9828",
    entity_type: "Escalation_Rule",
    entity_id: "RULE-ESC-04",
    action_type: "MODIFY",
    old_value: { threshold: 3 },
    new_value: { threshold: 5 },
    performed_by: "Sys_Config_Bot",
    performed_role_id: "SYSTEM",
    ip_address: "10.0.0.1",
    user_agent: "System",
    remarks: "Auto-update",
    created_at: "Oct 24, 09:30 AM"
  },
  {
    audit_log_id: "AUD-9819",
    entity_type: "Employee",
    entity_id: "EMP-9932",
    action_type: "CREATE",
    old_value: null,
    new_value: { name: "John Doe", role: "Supervisor" },
    performed_by: "Commissioner_01",
    performed_role_id: "COMMISSIONER",
    ip_address: "172.16.0.5",
    user_agent: "Mozilla/5.0",
    remarks: "New hire",
    created_at: "Oct 24, 09:15 AM"
  },
  {
    audit_log_id: "AUD-9818",
    entity_type: "Auth_Token",
    entity_id: "TOK-X99",
    action_type: "REVOKE",
    old_value: { valid: true },
    new_value: { valid: false },
    performed_by: "Security_System",
    performed_role_id: "AUTO_GUARD",
    ip_address: "10.0.0.45",
    user_agent: "Security Bot",
    remarks: "Suspicious activity",
    created_at: "Oct 24, 08:55 AM"
  },
  {
    audit_log_id: "AUD-9817",
    entity_type: "Zone_Config",
    entity_id: "ZN-NORTH-01",
    action_type: "UPDATE",
    old_value: { status: "active" },
    new_value: { status: "maintenance" },
    performed_by: "MHO_Salem",
    performed_role_id: "MHO",
    ip_address: "10.0.0.12",
    user_agent: "Mozilla/5.0",
    remarks: "Scheduled maintenance",
    created_at: "Oct 24, 08:45 AM"
  },
  {
    audit_log_id: "AUD-9816",
    entity_type: "Complaint",
    entity_id: "COM-7721",
    action_type: "DELETE",
    old_value: { status: "resolved" },
    new_value: null,
    performed_by: "Admin_02",
    performed_role_id: "ADMIN",
    ip_address: "192.168.1.45",
    user_agent: "Mozilla/5.0",
    remarks: "Duplicate entry",
    created_at: "Oct 24, 08:30 AM"
  },
  {
    audit_log_id: "AUD-9815",
    entity_type: "Shift_Roster",
    entity_id: "SHF-MK-42",
    action_type: "DELETE",
    old_value: { shifts: ["morning", "evening"] },
    new_value: null,
    performed_by: "Supervisor_05",
    performed_role_id: "SUPERVISOR",
    ip_address: "192.168.4.105",
    user_agent: "Mozilla/5.0",
    remarks: "Roster cancelled",
    created_at: "Oct 24, 08:15 AM"
  }
];

export default function AuditLogs({ searchQuery = "" }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filters, setFilters] = useState({
    action: "All",
    entityType: "All",
    performedBy: "All"
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

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = log.audit_log_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performed_by.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = filters.action === "All" || log.action_type === filters.action;
    const matchesEntityType = filters.entityType === "All" || log.entity_type === filters.entityType;
    const matchesPerformedBy = filters.performedBy === "All" || log.performed_by === filters.performedBy;

    return matchesSearch && matchesAction && matchesEntityType && matchesPerformedBy;
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

  function ActionBadge({ action }) {
    let colorClass = "";
    if (action === "CREATE") colorClass = "bg-success/10 text-success";
    else if (action === "UPDATE" || action === "MODIFY") colorClass = "bg-primary/10 text-primary";
    else if (action === "DELETE" || action === "REVOKE") colorClass = "bg-error/10 text-error";
    else colorClass = "bg-secondary text-secondaryDark";

    return (
      <span className={`px-2 py-1 rounded-small text-xs font-medium ${colorClass}`}>
        {action}
      </span>
    );
  }

  return (
    <div className="bg-secondary rounded-large p-4">
      {/* Table Container - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        {/* Table Header - Always visible */}
        <div className="grid grid-cols-8 gap-4 px-4 py-3 bg-white rounded-medium mb-2 text-xs font-bold text-secondaryDark border border-secondary min-w-200">
          <div>Audit ID</div>
          <ColumnHeader label="Entity Type" column="entityType" options={["All", ...Array.from(new Set(mockAuditLogs.map(l => l.entity_type)))]} />
          <div>Entity ID</div>
          <ColumnHeader label="Action" column="action" options={["All", "CREATE", "UPDATE", "MODIFY", "DELETE", "REVOKE"]} />
          <ColumnHeader label="Performed By" column="performedBy" options={["All", ...Array.from(new Set(mockAuditLogs.map(l => l.performed_by)))]} />
          <div>Role</div>
          <div>Date</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-large overflow-hidden border border-secondary min-w-200">
          <Pagination
            data={filteredLogs}
            itemsPerPage={8}
            renderItem={(log) => (
              <div key={log.audit_log_id} className="border-b border-secondary last:border-0">
                <div className="grid grid-cols-8 gap-4 p-4 text-sm hover:bg-secondary/50 transition-all duration-200 ease-in-out">
                  <div className="font-medium text-primary">{log.audit_log_id}</div>
                  <div className="text-secondaryDark">{log.entity_type}</div>
                  <div className="text-secondaryDark">{log.entity_id}</div>
                  <div><ActionBadge action={log.action_type} /></div>
                  <div className="text-secondaryDark truncate">{log.performed_by}</div>
                  <div className="text-secondaryDark">{log.performed_role_id}</div>
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
        logType="audit"
      />
    </div>
  );
}