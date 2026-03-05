import React, { useState } from "react";

//tabs
import Overview from "./Tabs/Overview";
import Environment from "./Tabs/Environment";
import { useTranslation } from "react-i18next";

function StatsHeader({ ShowInspectorDetails = true }) {
    const { t } = useTranslation(["pages", "common"]);
    const [activeTab, setActiveTab] = useState("Overview");

    const stats = [
        {
        label: t('pages:inspector.stats.total_active_workers'),
        value: "32",
        subtext: t('pages:inspector.stats.compliance'),
        subtextColor: "text-success"
        },
        {
        label: t('pages:inspector.stats.tasks_assigned_stat'),
        value: "145",
        subtext: t('pages:inspector.stats.avg_per_worker'),
        subtextColor: "text-secondaryDark"
        },
        {
        label: t('pages:inspector.stats.active_complaints'),
        value: "12",
        subtext: t('pages:inspector.stats.needs_review'),
        subtextColor: "text-error"
        },
        {
        label: t('pages:inspector.stats.escalations'),
        value: "3",
        subtext: t('pages:inspector.stats.needs_attention'),
        subtextColor: "text-error"
        }
    ];

    const tabs = ["Overview", "Environment"];
    const tabLabels = {
        "Overview": t('pages:inspector.stats.overview'),
        "Environment": t('pages:inspector.stats.environment')
    };

    function handleTabClick(tab) {
        setActiveTab(tab);
    }

    return (
        <div className="space-y-6">
        {ShowInspectorDetails && (
            <div className="bg-secondary p-6 rounded-large border border-secondary">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Profile Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primaryLight rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">G</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-primary">Gowtham CD</h3>
                            <p className="text-sm text-secondaryDark">TM-2024-001</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">{t('pages:inspector.stats.sanitary_inspector')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Zone */}
                    <div>
                        <p className="text-xs text-secondaryDark mb-1">{t('pages:shared.assigned_zone')}</p>
                        <p className="text-base font-medium text-success">Zone A - Block 5</p>
                    </div>

                    {/* Joined Date */}
                    <div>
                        <p className="text-xs text-secondaryDark mb-1">{t('pages:shared.joined')}</p>
                        <p className="text-base font-medium text-primary">Jan 2024</p>
                    </div>

                    {/* Attendance */}
                    <div>
                        <p className="text-xs text-secondaryDark mb-1">{t('common:attendance')}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-success">92%</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4 pt-4 border-t border-secondary">
                    {/* Tasks Completed */}
                    <div>
                        <p className="text-xs text-secondaryDark mb-1">{t('pages:shared.tasks_completed')}</p>
                        <p className="text-base font-medium text-success">142</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <p className="text-xs text-secondaryDark mb-1">{t('common:phone')}</p>
                        <p className="text-base font-medium text-primary">+91 98765 43210</p>
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                        <p className="text-xs text-secondaryDark mb-1">{t('common:email')}</p>
                        <p className="text-base font-medium text-primary">gowtham.cd@trashmanagement.com</p>
                    </div>
                </div>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(function (stat, index) {
            return (
                <div
                key={index}
                className="bg-secondary p-6 rounded-large border border-secondary"
                >
                <p className="text-sm text-secondaryDark mb-2">{stat.label}</p>
                <h2 className="text-xl font-bold text-primary mb-2">
                    {stat.value}
                </h2>
                <p className={`text-xs ${stat.subtextColor}`}>{stat.subtext}</p>
                </div>
            );
            })}
        </div>

        <div className="bg-secondary rounded-large p-2 border border-secondary relative max-w-xl">
            <div className="flex gap-2 relative">
            <div
                className="absolute top-0 left-0 h-full bg-primaryLight rounded-medium transition-all duration-200 ease-in-out"
                style={{
                width: "calc(50% - 4px)",
                transform: activeTab === "Environment" ? "translateX(calc(100% + 8px))" : "translateX(0)"
                }}
            />
            {tabs.map(function (tab) {
                const isActive = activeTab === tab;
                return (
                <button
                    key={tab}
                    onClick={function () {
                    handleTabClick(tab);
                    }}
                    className={`flex-1 px-6 py-2 rounded-medium text-sm font-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none relative z-10 ${
                    isActive
                        ? "text-white"
                        : "text-secondaryDark"
                    }`}
                >
                    {tabLabels[tab]}
                </button>
                );
            })}
            </div>
        </div>
        {activeTab === "Overview" ? <Overview/> :<Environment/>}
        </div>
    );
}

export default StatsHeader;