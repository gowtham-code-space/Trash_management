import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../../../utils/Pagination";
import LogDetailsModal from "../../../../components/Modals/Admin/LogDetailsModal";
import { RightArrow, DownArrow, Search } from "../../../../assets/icons/icons";
import { getLogs, getLogFilters } from "../../../../services/features/adminService";
import { SkeletonLine } from "../../../../components/skeleton";

const LIMIT = 20;
const SKELETON_ROWS = 8;

export default function EventLogs({ searchQuery = "", dateRange, onFiltersChange }) {
  const { t } = useTranslation(["pages", "common"]);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ event_type: [], entity_type: [] });
  const [filters, setFilters] = useState({ eventType: "", entityType: "", severity: "" });
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    getLogFilters("event").then(res => { if (res?.data) setFilterOptions(res.data); });
  }, []);

  useEffect(() => { setPage(1); }, [searchQuery, dateRange, filters]);

  useEffect(() => {
    if (onFiltersChange) onFiltersChange({
      event_type: filters.eventType || undefined,
      entity_type: filters.entityType || undefined,
      severity: filters.severity || undefined,
    });
  }, [filters]); // eslint-disable-line

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLogs({
      type: "event", page, limit: LIMIT,
      search: searchQuery || undefined,
      event_type: filters.eventType || undefined,
      entity_type: filters.entityType || undefined,
      severity: filters.severity || undefined,
      start: dateRange?.start, end: dateRange?.end,
    }).then(res => {
      if (!cancelled) { setLogs(res?.data?.rows || []); setTotal(res?.data?.total || 0); }
    }).catch(console.error).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [searchQuery, dateRange, filters, page]);

  // Close dropdown on outside click — single ref on the entire header row
  useEffect(() => {
    function h(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpenDropdown(null);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function clearAllFilters() {
    setFilters({ eventType: "", entityType: "", severity: "" });
  }

  function ColumnHeader({ label, col, options }) {
    const active = filters[col] || "";
    const isOpen = openDropdown === col;
    return (
      <div className="relative">
        <button
          onClick={() => col && setOpenDropdown(isOpen ? null : col)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors duration-200
            ${active ? "text-primary" : "text-secondaryDark hover:text-primary"}`}
        >
          <span>{label}</span>
          {active && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white leading-none">
              {active.length > 8 ? active.slice(0, 8) + "…" : active}
            </span>
          )}
          {col && (
            <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
              <DownArrow size={10} defaultColor={active ? "#316F5D" : "#6B7280"} />
            </span>
          )}
        </button>
        {col && isOpen && (
          <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-large border border-secondary shadow-xl z-50 overflow-hidden">
            {["All", ...options].map(opt => (
              <button
                key={opt}
                onClick={() => { setFilters(p => ({ ...p, [col]: opt === "All" ? "" : opt })); setOpenDropdown(null); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all hover:bg-background border-b border-secondary last:border-0
                  ${(!active && opt === "All") || active === opt ? "bg-primary/10 text-primary font-bold" : "text-secondaryDark"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function SeverityBadge({ severity }) {
    const cls = severity === "CRITICAL" ? "bg-error/10 text-error" : severity === "WARNING" ? "bg-warning/10 text-warning" : "bg-success/10 text-success";
    return <span className={`px-2 py-1 rounded-small text-xs font-medium ${cls}`}>{severity}</span>;
  }

  function NoRecords() {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="p-4 bg-secondary rounded-full">
          <Search size={28} defaultColor="#9CA3AF" />
        </div>
        <p className="text-sm font-semibold text-secondaryDark">{t('pages:admin.logs.no_records_found')}</p>
        <p className="text-xs text-secondaryDark/60">
          {Object.values(filters).some(Boolean)
            ? t('pages:admin.logs.try_adjusting_filters')
            : t('pages:admin.event_logs.no_event_logs')}
        </p>
      </div>
    );
  }

  function TableSkeleton() {
    return (
      <>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-4 p-4 border-b border-secondary last:border-0">
            <SkeletonLine variant="small" width="3/4" />
            <SkeletonLine variant="small" width="full" />
            <SkeletonLine variant="small" width="full" />
            <SkeletonLine variant="small" width="1/2" />
            <SkeletonLine variant="small" width="1/3" />
            <SkeletonLine variant="small" width="3/4" />
            <div className="flex justify-end"><SkeletonLine variant="small" width="1/4" /></div>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="bg-secondary rounded-large p-4">
      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-secondaryDark font-medium">{t('pages:admin.logs.active_filters')}</span>
          {filters.eventType && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {t('pages:admin.event_logs.filter_event')} {filters.eventType}
              <button onClick={() => setFilters(p => ({ ...p, eventType: "" }))} className="hover:text-error transition-colors leading-none">×</button>
            </span>
          )}
          {filters.entityType && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {t('pages:admin.event_logs.filter_entity')} {filters.entityType}
              <button onClick={() => setFilters(p => ({ ...p, entityType: "" }))} className="hover:text-error transition-colors leading-none">×</button>
            </span>
          )}
          {filters.severity && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
              ${filters.severity === "CRITICAL" ? "bg-error/10 text-error border-error/20" : filters.severity === "WARNING" ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"}`}>
              {t('pages:admin.event_logs.filter_severity')} {filters.severity}
              <button onClick={() => setFilters(p => ({ ...p, severity: "" }))} className="hover:opacity-60 transition-opacity leading-none">×</button>
            </span>
          )}
          {activeFilterCount > 1 && (
            <button onClick={clearAllFilters} className="text-xs text-error hover:underline font-medium transition-colors">
              {t('pages:admin.logs.clear_all')}
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        {/* Header row — single ref wraps all column headers for correct outside-click detection */}
        <div
          ref={headerRef}
          className="grid grid-cols-7 gap-4 px-4 py-3 bg-white rounded-medium mb-2 text-xs font-bold text-secondaryDark border border-secondary min-w-200"
        >
          <div className="text-xs font-bold text-secondaryDark">{t('pages:admin.event_logs.column_event_id')}</div>
          <ColumnHeader label={t('pages:admin.event_logs.column_event_type')} col="eventType" options={filterOptions.event_type} />
          <ColumnHeader label={t('pages:admin.event_logs.column_entity_type')} col="entityType" options={filterOptions.entity_type} />
          <div className="text-xs font-bold text-secondaryDark">{t('pages:admin.event_logs.column_entity_id')}</div>
          <ColumnHeader label={t('pages:admin.event_logs.column_severity')} col="severity" options={["CRITICAL", "WARNING", "INFO"]} />
          <div className="text-xs font-bold text-secondaryDark">{t('pages:admin.event_logs.column_date')}</div>
          <div className="text-xs font-bold text-secondaryDark text-right">{t('common:actions')}</div>
        </div>

        <div className="bg-white rounded-large overflow-hidden border border-secondary min-w-200">
          {loading ? (
            <TableSkeleton />
          ) : logs.length === 0 ? (
            <NoRecords />
          ) : (
            <Pagination
              data={logs} itemsPerPage={LIMIT} serverSide={true}
              totalItems={total} currentPage={page} onPageChange={setPage}
              renderItem={(log) => (
                <div key={log.event_log_id} className="grid grid-cols-7 gap-4 p-4 text-sm hover:bg-secondary/50 border-b border-secondary last:border-0 transition-all">
                  <div className="font-medium text-primary text-xs truncate">{String(log.event_log_id)}</div>
                  <div className="text-secondaryDark text-xs truncate">{log.event_type}</div>
                  <div className="text-secondaryDark text-xs truncate">{log.entity_type}</div>
                  <div className="text-secondaryDark text-xs truncate">{String(log.entity_id)}</div>
                  <div><SeverityBadge severity={log.severity} /></div>
                  <div className="text-secondaryDark text-xs">{new Date(log.created_at).toLocaleString()}</div>
                  <div className="flex justify-end">
                    <button onClick={() => { setSelectedLog(log); setIsModalOpen(true); }}
                      className="p-1.5 hover:bg-secondary rounded-small transition-all hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <RightArrow size={14} />
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>
      <LogDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} logData={selectedLog} logType="event" />
    </div>
  );
}
