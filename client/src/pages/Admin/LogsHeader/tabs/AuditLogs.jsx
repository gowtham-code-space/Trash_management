import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../../../utils/Pagination";
import LogDetailsModal from "../../../../components/Modals/Admin/LogDetailsModal";
import { RightArrow, DownArrow, Search } from "../../../../assets/icons/icons";
import { getLogs, getLogFilters } from "../../../../services/features/adminService";
import { SkeletonLine } from "../../../../components/skeleton";

const LIMIT = 20;
const SKELETON_ROWS = 8;

export default function AuditLogs({ searchQuery = "", dateRange, onFiltersChange }) {
  const { t } = useTranslation(["pages", "common"]);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ action_type: [], entity_type: [], performed_by: [] });
  const [filters, setFilters] = useState({ action: "", entityType: "", performedBy: "" });
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    getLogFilters("audit").then(res => { if (res?.data) setFilterOptions(res.data); });
  }, []);

  useEffect(() => { setPage(1); }, [searchQuery, dateRange, filters]);

  useEffect(() => {
    if (onFiltersChange) onFiltersChange({
      action: filters.action || undefined,
      entity_type: filters.entityType || undefined,
      performed_by: filters.performedBy || undefined,
    });
  }, [filters]); // eslint-disable-line

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLogs({
      type: "audit", page, limit: LIMIT,
      search: searchQuery || undefined,
      action: filters.action || undefined,
      entity_type: filters.entityType || undefined,
      performed_by: filters.performedBy || undefined,
      start: dateRange?.start, end: dateRange?.end,
    }).then(res => {
      if (!cancelled) { setLogs(res?.data?.rows || []); setTotal(res?.data?.total || 0); }
    }).catch(console.error).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [searchQuery, dateRange, filters, page]);

  useEffect(() => {
    function h(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpenDropdown(null);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function clearAllFilters() {
    setFilters({ action: "", entityType: "", performedBy: "" });
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

  function ActionBadge({ action }) {
    const cls = ["DELETE", "REVOKE"].includes(action) ? "bg-error/10 text-error" : action === "CREATE" ? "bg-success/10 text-success" : "bg-primary/10 text-primary";
    return <span className={`px-2 py-1 rounded-small text-xs font-medium ${cls}`}>{action}</span>;
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
            : t('pages:admin.audit_logs.no_audit_logs')}
        </p>
      </div>
    );
  }

  function TableSkeleton() {
    return (
      <>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div key={i} className="grid grid-cols-8 gap-4 p-4 border-b border-secondary last:border-0">
            <SkeletonLine variant="small" width="3/4" />
            <SkeletonLine variant="small" width="full" />
            <SkeletonLine variant="small" width="1/2" />
            <SkeletonLine variant="small" width="1/3" />
            <SkeletonLine variant="small" width="3/4" />
            <SkeletonLine variant="small" width="1/2" />
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
          {filters.entityType && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {t('pages:admin.audit_logs.filter_entity')} {filters.entityType}
              <button onClick={() => setFilters(p => ({ ...p, entityType: "" }))} className="hover:text-error transition-colors leading-none">×</button>
            </span>
          )}
          {filters.action && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
              ${["DELETE", "REVOKE"].includes(filters.action) ? "bg-error/10 text-error border-error/20" : filters.action === "CREATE" ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary border-primary/20"}`}>
              {t('pages:admin.audit_logs.filter_action')} {filters.action}
              <button onClick={() => setFilters(p => ({ ...p, action: "" }))} className="hover:opacity-60 transition-opacity leading-none">×</button>
            </span>
          )}
          {filters.performedBy && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {t('pages:admin.audit_logs.filter_performed_by')} {filters.performedBy}
              <button onClick={() => setFilters(p => ({ ...p, performedBy: "" }))} className="hover:text-error transition-colors leading-none">×</button>
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
        <div
          ref={headerRef}
          className="grid grid-cols-8 gap-4 px-4 py-3 bg-white rounded-medium mb-2 text-xs font-bold text-secondaryDark border border-secondary min-w-200"
        >
          <div className="text-xs font-bold text-secondaryDark">{t('pages:admin.audit_logs.column_audit_id')}</div>
          <ColumnHeader label={t('pages:admin.audit_logs.column_entity_type')} col="entityType" options={filterOptions.entity_type} />
          <div className="text-xs font-bold text-secondaryDark">{t('pages:admin.audit_logs.column_entity_id')}</div>
          <ColumnHeader label={t('pages:admin.audit_logs.column_action')} col="action" options={filterOptions.action_type} />
          <ColumnHeader label={t('pages:admin.audit_logs.column_performed_by')} col="performedBy" options={filterOptions.performed_by} />
          <div className="text-xs font-bold text-secondaryDark">{t('pages:admin.audit_logs.column_role')}</div>
          <div className="text-xs font-bold text-secondaryDark">{t('pages:admin.audit_logs.column_date')}</div>
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
                <div key={log.audit_log_id} className="grid grid-cols-8 gap-4 p-4 text-sm hover:bg-secondary/50 border-b border-secondary last:border-0 transition-all">
                  <div className="font-medium text-primary text-xs truncate">{String(log.audit_log_id)}</div>
                  <div className="text-secondaryDark text-xs truncate">{log.entity_type}</div>
                  <div className="text-secondaryDark text-xs truncate">{String(log.entity_id)}</div>
                  <div><ActionBadge action={log.action_type} /></div>
                  <div className="text-secondaryDark text-xs truncate">{String(log.performed_by)}</div>
                  <div className="text-secondaryDark text-xs">{String(log.performed_role_id ?? "-")}</div>
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
      <LogDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} logData={selectedLog} logType="audit" />
    </div>
  );
}

