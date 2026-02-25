import React from "react";
import { X } from "../../../assets/icons/icons";
import ThemeStore from "../../../store/ThemeStore";

export default function LogDetailsModal({ isOpen, onClose, logData, logType }) {
  const { isDarkTheme } = ThemeStore();

  if (!isOpen || !logData) return null;

  function renderApiDetails() {
    return (
      <div className="space-y-3">
        <DetailRow label="Log ID" value={logData.api_log_id || logData.LogID} />
        <DetailRow label="User ID" value={logData.user_id} />
        <DetailRow label="Role ID" value={logData.role_id} />
        <DetailRow label="Endpoint" value={logData.endpoint} />
        <DetailRow label="HTTP Method" value={logData.http_method} />
        <DetailRow label="Status Code" value={logData.status_code} />
        <DetailRow label="Response Time" value={`${logData.response_time_ms}ms`} />
        <DetailRow label="IP Address" value={logData.ip_address} />
        <DetailRow label="User Agent" value={logData.user_agent} />
        <DetailRow label="Request Body" value={logData.request_body} isJson />
        <DetailRow label="Response Body" value={logData.response_body} isJson />
        <DetailRow label="Created At" value={logData.created_at} />
      </div>
    );
  }

  function renderAuditDetails() {
    return (
      <div className="space-y-3">
        <DetailRow label="Audit ID" value={logData.audit_log_id || logData.AuditID} />
        <DetailRow label="Entity Type" value={logData.entity_type} />
        <DetailRow label="Entity ID" value={logData.entity_id} />
        <DetailRow label="Action Type" value={logData.action_type} />
        <DetailRow label="Old Value" value={logData.old_value} isJson />
        <DetailRow label="New Value" value={logData.new_value} isJson />
        <DetailRow label="Performed By" value={logData.performed_by} />
        <DetailRow label="Performed Role" value={logData.performed_role_id} />
        <DetailRow label="IP Address" value={logData.ip_address} />
        <DetailRow label="User Agent" value={logData.user_agent} />
        <DetailRow label="Remarks" value={logData.remarks} />
        <DetailRow label="Created At" value={logData.created_at} />
      </div>
    );
  }

  function renderEventDetails() {
    return (
      <div className="space-y-3">
        <DetailRow label="Event ID" value={logData.event_log_id || logData.EventID} />
        <DetailRow label="Event Type" value={logData.event_type} />
        <DetailRow label="Entity Type" value={logData.entity_type} />
        <DetailRow label="Entity ID" value={logData.entity_id} />
        <DetailRow label="User ID" value={logData.user_id} />
        <DetailRow label="Severity" value={logData.severity} />
        <DetailRow label="Metadata" value={logData.metadata} isJson />
        <DetailRow label="Created At" value={logData.created_at} />
      </div>
    );
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div onClick={onClose} className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div onClick={(e) => e.stopPropagation()} className={`rounded-veryLarge w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border transition-all duration-200
          ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b
            ${isDarkTheme ? "border-darkBorder bg-darkBackground" : "border-secondary bg-background"}`}>
            <div>
              <h2 className={`text-lg font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
                Log Details
              </h2>
              <p className={`text-xs mt-0.5 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                {logType === "api" ? "API Request Log" : logType === "audit" ? "Audit Trail Log" : "Event Log"}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-medium transition-all duration-200 ease-in-out 
                       hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                       ${isDarkTheme ? "bg-darkSurface hover:bg-darkSurfaceHover" : "bg-secondary hover:bg-background"}`}
            >
              <X size={20} isDarkTheme={isDarkTheme} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {logType === "api" && renderApiDetails()}
            {logType === "audit" && renderAuditDetails()}
            {logType === "event" && renderEventDetails()}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isJson }) {
  const { isDarkTheme } = ThemeStore();
  if (value === null || value === undefined) return null;

  return (
    <div className={`pb-3 mb-3 border-b last:border-0 ${isDarkTheme ? "border-darkBorder" : "border-secondary"}`}>
      <span className={`text-xs font-bold uppercase tracking-wide block mb-1.5
        ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark/60"}`}>
        {label}
      </span>
      <div>
        {isJson && typeof value === "object" ? (
          <pre className={`text-xs p-3 rounded-medium overflow-x-auto font-mono
            ${isDarkTheme ? "bg-darkBackground text-darkTextPrimary" : "bg-secondary text-secondaryDark"}`}>
            {JSON.stringify(value, null, 2)}
          </pre>
        ) : (
          <span className={`text-sm font-medium ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
            {String(value)}
          </span>
        )}
      </div>
    </div>
  );
}