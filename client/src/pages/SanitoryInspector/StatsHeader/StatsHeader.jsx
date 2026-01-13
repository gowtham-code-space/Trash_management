import React, { useState } from "react";

function StatsHeader() {
    const [activeTab, setActiveTab] = useState("Overview");

    const stats = [
        {
        label: "Total Active Workers",
        value: "32",
        subtext: "98% Compliance",
        subtextColor: "text-success"
        },
        {
        label: "Tasks Assigned",
        value: "145",
        subtext: "Avg 4.5/worker",
        subtextColor: "text-secondaryDark"
        },
        {
        label: "Active Complaints",
        value: "12",
        subtext: "Needs Review",
        subtextColor: "text-error"
        },
        {
        label: "Escalations",
        value: "3",
        subtext: "Needs Attention",
        subtextColor: "text-error"
        }
    ];

    const tabs = ["Overview", "Environment"];

    function handleTabClick(tab) {
        setActiveTab(tab);
    }

    return (
        <div className="space-y-6">
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
                    {tab}
                </button>
                );
            })}
            </div>
        </div>

        <div className="bg-secondary p-8 rounded-large border border-secondary text-center">
            <h3 className="text-lg font-bold text-primary">{activeTab}</h3>
        </div>
        </div>
    );
}

export default StatsHeader;