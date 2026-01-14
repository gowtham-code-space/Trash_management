import React, { useState } from "react";
import Pagination from "../../utils/Pagination";
import { useNavigate } from "react-router-dom";

import {
  Location,
  ZoomIn,
  ZoomOut,
  Search,
} from "../../assets/icons/icons";

const zoneData = {
  name: "North Zone",
  administrator: "Senior SI",
  divisionsActive: 5,
  healthScore: 92,
  supervisors: 12,
  sanitaryInspectors: 3,
  urgentTasks: 14,
  escalations: 0
};

const allDivisions = [
  {
    id: 1,
    name: "Division 1 (Fairlands)",
    divisionId: "NZ-01",
    wards: 3,
    health: 95,
    team: {
      supervisors: 3,
      sanitaryInspectors: 1
    },
    urgent: 0,
    urgentStatus: "Pending",
    rating: 4.8,
    maxRating: 5
  },
  {
    id: 2,
    name: "Division 2 (Hasthampatti)",
    divisionId: "NZ-02",
    wards: 4,
    health: 88,
    team: {
      supervisors: 2,
      sanitaryInspectors: 0
    },
    urgent: 3,
    urgentStatus: "Active",
    rating: 4.2,
    maxRating: 5
  },
  {
    id: 3,
    name: "Division 3 (Ammapet)",
    divisionId: "NZ-03",
    wards: 3,
    health: 91,
    team: {
      supervisors: 3,
      sanitaryInspectors: 1
    },
    urgent: 1,
    urgentStatus: "Pending",
    rating: 4.6,
    maxRating: 5
  },
  {
    id: 4,
    name: "Division 4 (Suramangalam)",
    divisionId: "NZ-04",
    wards: 5,
    health: 76,
    team: {
      supervisors: 4,
      sanitaryInspectors: 1
    },
    urgent: 5,
    urgentStatus: "Active",
    rating: 3.9,
    maxRating: 5
  },
  {
    id: 5,
    name: "Division 5 (Edappadi)",
    divisionId: "NZ-05",
    wards: 4,
    health: 84,
    team: {
      supervisors: 3,
      sanitaryInspectors: 0
    },
    urgent: 2,
    urgentStatus: "Pending",
    rating: 4.3,
    maxRating: 5
  },
  {
    id: 6,
    name: "Division 6 (Krishnapuram)",
    divisionId: "NZ-06",
    wards: 3,
    health: 90,
    team: {
      supervisors: 2,
      sanitaryInspectors: 1
    },
    urgent: 1,
    urgentStatus: "Pending",
    rating: 4.5,
    maxRating: 5
  },
  {
    id: 7,
    name: "Division 7 (Kamaraj Nagar)",
    divisionId: "NZ-07",
    wards: 4,
    health: 78,
    team: {
      supervisors: 3,
      sanitaryInspectors: 1
    },
    urgent: 4,
    urgentStatus: "Active",
    rating: 4.0,
    maxRating: 5
  }
];

function ViewZone() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredDivisions = allDivisions.filter(function (division) {
        const matchesSearch = 
        division.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        division.divisionId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    function getHealthColor(health) {
        if (health >= 90) return "text-success";
        if (health >= 75) return "text-warning";
        return "text-error";
    }

    function getHealthBgColor(health) {
        if (health >= 90) return "bg-success/10";
        if (health >= 75) return "bg-warning/10";
        return "bg-error/10";
    }

    function renderDivisionCard(division) {
        return (
        <div
            key={division.id}
            className="bg-white rounded-large border border-gray-300 p-4 my-2 transition-all duration-200 hover:shadow-md"
        >
            <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
                <h3 className="text-sm font-bold text-secondaryDark mb-1">
                {division.name}
                </h3>
                <p className="text-xs text-secondaryDark/60">
                ID: {division.divisionId} • {division.wards} Wards
                </p>
            </div>
            <div className={`${getHealthBgColor(division.health)} px-3 py-1 rounded-medium`}>
                <span className={`text-xs font-bold ${getHealthColor(division.health)}`}>
                {division.health}% Health
                </span>
            </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-background rounded-medium p-2">
                <p className="text-xs text-secondaryDark/60 mb-1">Supervisors</p>
                <p className="text-xs font-semibold text-secondaryDark">
                {division.team.supervisors}
                </p>
            </div>
            <div className="bg-background rounded-medium p-2">
                <p className="text-xs text-secondaryDark/60 mb-1">Sanitary Inspectors</p>
                <p className="text-xs font-semibold text-secondaryDark">
                {division.team.sanitaryInspectors}
                </p>
            </div>
            </div>

            <button
            onClick={()=>navigate("/view-division")}
            className="w-full bg-primary text-white py-2 rounded-medium text-xs font-bold hover:bg-primaryLight hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
            View Details
            </button>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
        <div>
            {/* Zone Header */}
            <div className="mb-6 bg-white border border-secondary rounded-large p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                <h1 className="text-2xl font-bold text-primary mb-1">
                    {zoneData.name}
                </h1>
                <p className="text-sm text-secondaryDark/60">
                    Administered by {zoneData.administrator} • {zoneData.divisionsActive} Divisions Active
                </p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="text-center">
                <p className="text-xs text-secondaryDark/60 mb-1">HEALTH SCORE</p>
                <p className="text-2xl font-bold text-success">{zoneData.healthScore}%</p>
                </div>
                <div className="text-center">
                <p className="text-xs text-secondaryDark/60 mb-1">SUPERVISORS</p>
                <p className="text-2xl font-bold text-secondaryDark">{zoneData.supervisors}</p>
                </div>
                <div className="text-center">
                <p className="text-xs text-secondaryDark/60 mb-1">SANITARY INSP.</p>
                <p className="text-2xl font-bold text-secondaryDark">{zoneData.sanitaryInspectors}</p>
                </div>
                <div className="text-center">
                <p className="text-xs text-secondaryDark/60 mb-1">URGENT TASKS</p>
                <p className="text-2xl font-bold text-warning">{zoneData.urgentTasks}</p>
                </div>
                <div className="text-center">
                <p className="text-xs text-secondaryDark/60 mb-1">ESCALATIONS</p>
                <p className="text-2xl font-bold text-secondaryDark">{zoneData.escalations}</p>
                </div>
            </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
            {/* Map Section */}
            <div className="relative flex-1 bg-secondary overflow-hidden min-h-96 lg:h-scsreen rounded-medium">
                <img
                src="https://tile.openstreetmap.org/14/4824/6156.png"
                alt="Zone Map"
                className="w-full h-full object-cover"
                />

                <div className="absolute top-4 left-4 bg-white rounded-medium shadow-md px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-xs font-bold text-secondaryDark">North Zone View</span>
                </div>

                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 lg:bottom-6 lg:right-6 flex flex-col gap-1.5 sm:gap-2">
                <button
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-medium shadow-md flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                    <ZoomIn size={18} defaultColor="#145B47" />
                </button>
                <button
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-medium shadow-md flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                    <ZoomOut size={18} defaultColor="#145B47" />
                </button>
                <button
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-medium shadow-md flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                    <Location size={18} defaultColor="#145B47" />
                </button>
                </div>
            </div>

            {/* Divisions Overview Section */}
            <div className="w-full lg:w-96 bg-white border border-secondary rounded-medium">
                <div className="p-4 sm:p-5 lg:p-6">
                <div className="mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-secondaryDark">
                    Divisions Overview ({allDivisions.length})
                    </h2>
                    <p className="text-xs sm:text-sm text-secondaryDark/60 mt-1">
                    View all divisions in this zone
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={16} defaultColor="#316F5D" />
                    </div>
                    <input
                    type="text"
                    placeholder="Search divisions..."
                    value={searchQuery}
                    onChange={function (e) {
                        setSearchQuery(e.target.value);
                    }}
                    className="w-full bg-background border border-secondary rounded-medium py-2 pl-10 pr-4
                                text-sm text-secondaryDark placeholder:text-secondaryDark/60
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                transition-all duration-200"
                    />
                </div>

                {filteredDivisions.length > 0 ? (
                    <Pagination
                    data={filteredDivisions}
                    itemsPerPage={3}
                    renderItem={renderDivisionCard}
                    gridDisplay={false}
                    />
                ) : (
                    <div className="text-center py-8">
                    <p className="text-sm text-secondaryDark">No divisions found</p>
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default ViewZone;
