import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../../../utils/Pagination";
import LogDetailsModal from "../../../../components/Modals/Admin/LogDetailsModal";
import { RightArrow, DownArrow, Search } from "../../../../assets/icons/icons";
import { getLogs, getLogFilters } from "../../../../services/features/adminService";
import { SkeletonLine } from "../../../../components/skeleton";

const LIMIT = 20;
const SKELETON_ROWS = 8;

export default function ApiRequestLogs({ searchQuery = "", dateRange, onFiltersChange }) {
  const { t } = useTranslation(["pages", "common"]);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ http_method: [], user_id: [] });
  const [filters, setFilters] = useState({ method: "", status: "", userId: "" });
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    getLogFilters("api").then(res => { if (res?.data) setFilterOptions(res.data); });
  }, []);

  useEffect(() => { setPage(1); }, [searchQuery, dateRange, filters]);

  useEffect(() => {
    if (onFiltersChange) onFiltersChange({
      method: filters.method || undefined,
      status: filters.status || undefined,
      user_id: filters.userId || undefined,
    });
  }, [filters]); // eslint-disable-line

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLogs({
      type: "api", page, limit: LIMIT,
      search: searchQuery || undefined,
      method: filters.method || undefined,
      status: filters.status || undefined,
      user_id: filters.userId || undefined,
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
    setFilters({ method: "", status: "", userId: "" });
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

  function StatusBadge({ code }) {
    const cls = code >= 500 ? "bg-error/10 text-error" : code >= 400 ? "bg-warning/10 text-warning" : "bg-success/10 text-success";
    return <span className={`px-2 py-1 rounded-small text-xs font-medium ${cls}`}>{code}</span>;
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
            : t('pages:admin.api_logs.no_api_logs')}
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
            <SkeletonLine variant="small" width="1/2" />
            <SkeletonLine variant="small" width="full" className="col-span-2" />
            <SkeletonLine variant="small" width="1/2" />
            <SkeletonLine variant="small" width="3/4" />
            <SkeletonLine variant="small" width="full" />
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
          {filters.method && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {t('pages:admin.api_logs.filter_method')} {filters.method}
              <button onClick={() => setFilters(p => ({ ...p, method: "" }))} className="hover:text-error transition-colors leading-none">×</button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
              {t('pages:admin.api_logs.filter_status')} {filters.status}
              <button onClick={() => setFilters(p => ({ ...p, status: "" }))} className="hover:opacity-60 transition-opacity leading-none">×</button>
            </span>
          )}
          {filters.userId && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {t('pages:admin.api_logs.filter_user')} {filters.userId}
              <button onClick={() => setFilters(p => ({ ...p, userId: "" }))} className="hover:text-error transition-colors leading-none">×</button>
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
          <div className="text-xs font-bold text-secondaryDark">{t('pages:admin.api_logs.column_log_id')}</div>
          <ColumnHeader label={t('pages:admin.api_logs.column_method')} col="method" options={filterOptions.http_method} />
          <div className="col-span-2 text-xs font-bold text-secondaryDark">{t('pages:admin.api_logs.column_endpoint')}</div>
          <ColumnHeader label={t('pages:admin.api_logs.column_status')} col="status" options={["2xx", "4xx", "5xx"]} />
          <div className="text-xs font-bold text-secondaryDark">{t('pages:admin.api_logs.column_resp_time')}</div>
          <ColumnHeader label={t('pages:admin.api_logs.column_user')} col="userId" options={filterOptions.user_id} />
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
                <div key={log.api_log_id} className="grid grid-cols-8 gap-4 p-4 text-sm hover:bg-secondary/50 border-b border-secondary last:border-0 transition-all">
                  <div className="font-medium text-primary text-xs truncate">{String(log.api_log_id)}</div>
                  <div><span className="bg-secondary px-2 py-1 rounded-small text-xs">{log.http_method}</span></div>
                  <div className="col-span-2 text-secondaryDark truncate text-xs">{log.endpoint}</div>
                  <div><StatusBadge code={log.status_code} /></div>
                  <div className="text-secondaryDark text-xs">{log.response_time_ms}ms</div>
                  <div className="text-secondaryDark truncate text-xs">{String(log.user_id ?? "-")}</div>
                  <div className="flex items-center justify-end">
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
      <LogDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} logData={selectedLog} logType="api" />
    </div>
  );
}
