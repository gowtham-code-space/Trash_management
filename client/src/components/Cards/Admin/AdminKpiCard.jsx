import React from "react";
import ThemeStore from "../../../store/ThemeStore";
import { SkeletonLine } from "../../skeleton";

function AdminKpiCard({ title, value, subtitle, subtitleColor, icon, highlighted = false, loading = false }) {
  const { isDarkTheme } = ThemeStore();

  if (loading) {
    return (
      <div className={`rounded-large p-4 border ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}>
        <div className="flex items-start justify-between mb-3">
          <SkeletonLine variant="small" width="3/4" />
          <SkeletonLine variant="small" width="1/4" />
        </div>
        <SkeletonLine variant="heading" width="1/2" className="mb-2" />
        <SkeletonLine variant="small" width="3/4" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-large p-4 border transition-all duration-200 hover:scale-[0.99] cursor-default
        ${highlighted
          ? "border-error bg-error/10"
          : isDarkTheme
          ? "bg-darkSurface border-darkBorder"
          : "bg-white border-gray-200"
        }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-xs font-semibold uppercase tracking-wide
            ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}
        >
          {title}
        </span>
        {icon && (
          <span className={isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}>
            {icon}
          </span>
        )}
      </div>

      <div
        className={`text-xl font-bold mb-1
          ${highlighted ? "text-error" : isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}
      >
        {value}
      </div>

      {subtitle && (
        <div
          className="text-xs font-medium"
          style={{ color: subtitleColor || undefined }}
        >
          {!subtitleColor && (
            <span className={isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}>
              {subtitle}
            </span>
          )}
          {subtitleColor && subtitle}
        </div>
      )}
    </div>
  );
}

export default AdminKpiCard;
