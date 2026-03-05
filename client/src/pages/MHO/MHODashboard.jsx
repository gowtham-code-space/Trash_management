import React from "react";
import { useTranslation } from "react-i18next";
import ProgressBar from "../../components/Statistics/ProgressBar";
import Pagination from "../../utils/Pagination";
import { useNavigate } from "react-router-dom";

function MHODashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation('pages');

  const zoneData = [
    {
      id: 1,
      name: "North Zone",
      healthPercent: "92% Health",
      healthColor: "text-success",
      active: 5,
      resolved: 12,
      pending: 3,
      complaintsRaised: 8,
      complaintsResolved: 0,
      resolvedPercentage: 0
    },
    {
      id: 2,
      name: "South Zone",
      healthPercent: "78% Health",
      healthColor: "text-warning",
      active: 6,
      resolved: 14,
      pending: 4,
      complaintsRaised: 32,
      complaintsResolved: 5,
      resolvedPercentage: 15.6
    },
    {
      id: 3,
      name: "East Zone",
      healthPercent: "88% Health",
      healthColor: "text-success",
      active: 4,
      resolved: 10,
      pending: 2,
      complaintsRaised: 9,
      complaintsResolved: 1,
      resolvedPercentage: 11.1
    },
    {
      id: 4,
      name: "West Zone",
      healthPercent: "82% Health",
      healthColor: "text-warning",
      active: 5,
      resolved: 11,
      pending: 3,
      complaintsRaised: 21,
      complaintsResolved: 3,
      resolvedPercentage: 14.3
    }
  ];

  const districtPerformance = [
    {
      label: t('mho.dashboard.total_active_complaints_label'),
      value: "1,248",
      change: t('mho.dashboard.change_week'),
      changeColor: "text-error"
    },
    {
      label: t('mho.dashboard.total_resolved_label'),
      value: "12.5k",
      change: t('mho.dashboard.resolution_rate'),
      changeColor: "text-success"
    },
    {
      label: t('mho.dashboard.avg_resolution_time_label'),
      value: "26 Hrs",
      change: t('mho.dashboard.resolution_target'),
      changeColor: "text-secondaryDark"
    },
    {
      label: t('mho.dashboard.workforce_attendance_label'),
      value: "94%",
      change: t('mho.dashboard.high_turnout'),
      changeColor: "text-success"
    }
  ];

  function renderZoneCard(zone) {
    const progressItem = {
      stars: zone.complaintsResolved,
      percentage: zone.resolvedPercentage
    };

    return (
      <div
        onClick={()=>navigate("view-zone")}
        key={zone.id}
        className="bg-white p-4 rounded-large border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-secondaryDark">
            {zone.name}
          </h3>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              zone.healthColor === "text-success"
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning"
            }`}
          >
            {zone.healthPercent}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-xs text-secondaryDark mb-1">{t('shared.active')}</p>
            <p className="text-lg font-bold text-primary">{zone.active}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-secondaryDark mb-1">{t('shared.resolved')}</p>
            <p className="text-lg font-bold text-primary">{zone.resolved}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-secondaryDark mb-1">{t('shared.pending')}</p>
            <p className="text-lg font-bold text-primary">{zone.pending}</p>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-secondary">
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondaryDark">
              {t('shared.complaints_raised')}
            </span>
            <span className="text-sm font-bold text-warning">
              {zone.complaintsRaised}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondaryDark">
              {t('shared.complaints_resolved')}
            </span>
            <span className="text-sm font-bold text-success">
              {zone.complaintsResolved}
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar item={progressItem} defaultColor="bg-success" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-bold text-secondaryDark mb-4">
          {t('shared.district_performance')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {districtPerformance.map(function (item, index) {
            return (
              <div
                key={index}
                className="bg-white p-4 rounded-large border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
              >
                <p className="text-sm text-secondaryDark mb-2">{item.label}</p>
                <p className="text-xl font-bold text-primary mb-1">
                  {item.value}
                </p>
                <p className={`text-xs font-semibold ${item.changeColor}`}>
                  {item.change}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-secondaryDark mb-4">
          {t('shared.zone_overview')}
        </h2>
        <Pagination
          data={zoneData}
          itemsPerPage={6}
          gridDisplay={true}
          renderItem={renderZoneCard}
        />
      </div>
    </div>
  );
}

export default MHODashboard;