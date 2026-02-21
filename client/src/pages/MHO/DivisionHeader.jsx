import React, { useState, useEffect } from "react";
import SearchWorkers from "../Common/SearchWorkers/SearchWorkers";
import StatsHeader from "../SanitoryInspector/StatsHeader/StatsHeader";
import TrashRoute from "../Common/RouteTimings/RouteTimings";

function DivisionHeader() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [divisionData, setDivisionData] = useState(null);

    const tabs = ["Overview", "Workers", "Statistics"];

    const mockData = {
        id: "NZ-01",
        name: "Division 1 (Fairlands)",
        wards: 3,
        healthScore: 95,
        stats: {
            supervisors: 3,
            sanitaryInspectors: 1,
            urgentTasks: 0,
            rating: 4.8
        }
    };

    useEffect(function () {
        setDivisionData(mockData);
    }, []);

    if (!divisionData) {
        return (
        <div className="bg-white p-6 rounded-large border border-secondary">
            <p className="text-sm text-secondaryDark">Loading...</p>
        </div>
        );
    }

    const statsData = [
        { value: divisionData.stats.supervisors, label: "SUPERVISORS" },
        { value: divisionData.stats.sanitaryInspectors, label: "SANITARY INSP." },
        { 
        value: divisionData.stats.urgentTasks, 
        label: "URGENT TASKS", 
        color: "text-success" 
        },
        { value: divisionData.stats.rating, label: "RATING (5)" }
    ];

    return (
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-large border border-secondary">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-secondaryDark mb-2">
                        {divisionData.name}
                        </h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-secondaryDark">
                                ID: {divisionData.id}
                            </span>
                            <span className="text-sm text-secondaryDark">
                                {divisionData.wards} Wards
                            </span>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-success/10 text-success">
                                {divisionData.healthScore}% Health Score
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statsData.map(function (stat, index) {
                        return (
                            <div key={index} className="text-center">
                            <p
                                className={`text-xl font-bold ${
                                stat.color ? stat.color : "text-secondaryDark"
                                } mb-1`}
                            >
                                {stat.value}
                            </p>
                            <p className="text-xs text-secondaryDark">{stat.label}</p>
                            </div>
                        );
                        })}
                    </div>
                </div>

                <div className="flex gap-6 border-b border-secondary">
                {tabs.map(function (tab) {
                    const isActive = activeTab === tab;
                    return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-semibold transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none ${
                        isActive
                            ? "text-primary border-b-2 border-primary"
                            : "text-secondaryDark"
                        }`}
                    >
                        {tab}
                    </button>
                    );
                })}
                </div>
            </div>

            {activeTab === "Overview" ? <TrashRoute/> : activeTab === "Workers" ? <SearchWorkers/> : <StatsHeader ShowInspectorDetails={false}/> }

        </div>
    );
}

export default DivisionHeader;