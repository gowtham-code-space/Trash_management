import React from "react";
import ThemeStore from "../../../store/ThemeStore";

function AdminKpiCard({ title, value, subtitle, subtitleColor, icon, highlighted = false }) {
  const { isDarkTheme } = ThemeStore();

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
