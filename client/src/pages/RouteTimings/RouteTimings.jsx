import React, { useState } from "react";
import ToastNotification from "../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import {
  Location,
  Add,
  ZoomIn,
  ZoomOut,
} from "../../assets/icons/icons";

function TrashRoute() {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const routes = [
    {
      id: "4A",
      division: "DIVISION A",
      name: "Route 4A - North Ward",
      location: "Sector 7 to Disposal Unit",
      status: "ACTIVE",
      time: "09:00 AM",
      statusColor: "bg-success",
      team: [
        { name: "Rajesh", image: null },
        { name: "Amit", image: null },
        { name: "Suresh", image: null },
      ],
    },
    {
      id: "2B",
      division: "DIVISION A",
      name: "Route 2B - Market Loop",
      location: "Central Market Area",
      status: "ACTIVE",
      time: "08:15 AM",
      statusColor: "bg-success",
      team: [
        { name: "Vikram", image: null },
        { name: "Rohan", image: "https://picsum.photos/seed/picsum/200/300" },
        { name: "Manoj", image: null },
      ],
    },
    {
      id: "5C",
      division: "DIVISION A",
      name: "Route 5C - Green Park",
      location: "Residential Zone B",
      status: "ACTIVE",
      time: "09:00 AM",
      statusColor: "bg-success",
      team: [
        { name: "Anita", image: "https://picsum.photos/seed/picsum/200/300" },
        { name: "Priya", image: null },
        { name: "Sunita", image: null },
      ],
    },
        {
      id: "5C",
      division: "DIVISION A",
      name: "Route 5C - Green Park",
      location: "Residential Zone B",
      status: "INACTIVE",
      time: "09:00 AM",
      statusColor: "bg-error",
      team: [
        { name: "Anita", image: null },
        { name: "Priya", image: null },
        { name: "Sunita", image: null },
      ],
    },
  ];

  const groupedRoutes = routes.reduce(function (acc, route) {
    if (!acc[route.division]) {
      acc[route.division] = [];
    }
    acc[route.division].push(route);
    return acc;
  }, {});

  function getWorkerInitial(name) {
    return name.charAt(0).toUpperCase();
  }

  function handleRouteClick(routeId) {
    setSelectedRoute(selectedRoute === routeId ? null : routeId);
    ToastNotification(`Route ${routeId} ${selectedRoute === routeId ? 'collapsed' : 'expanded'}`, "info");
  }

  function handleZoomInClick() {
    ToastNotification("Zooming in", "success");
  }

  function handleZoomOutClick() {
    ToastNotification("Zooming out", "success");
  }

  function handleRecenterClick() {
    ToastNotification("Map recentered", "success");
  }

  function handleAddRoute() {
    ToastNotification("Add new route", "info");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row">
        <div className="relative flex-1 bg-secondary overflow-hidden min-h-75 lg:h-screen rounded-medium">
          <img
            src="https://tile.openstreetmap.org/14/4824/6156.png"
            alt="Map"
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 lg:bottom-6 lg:right-6 flex flex-col gap-1.5 sm:gap-2">
            <button
              onClick={handleZoomInClick}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-medium shadow-md flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
              <ZoomIn size={18} defaultColor="#145B47" />
            </button>
            <button
              onClick={handleZoomOutClick}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-medium shadow-md flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
              <ZoomOut size={18} defaultColor="#145B47" />
            </button>
            <button
              onClick={handleRecenterClick}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-medium shadow-md flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
              <Location size={18} defaultColor="#145B47" />
            </button>
          </div>

          <button
            onClick={handleAddRoute}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 bg-primary text-white p-2.5 sm:p-3 rounded-large shadow-md hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
          >
            <Add size={18} isDarkTheme={true} />
          </button>
        </div>

        <div className="mt-2 lg:mt-0 lg:ml-2 rounded-medium w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-secondary p-4 sm:p-5 lg:p-6">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-secondaryDark">Trash Routes</h2>
            <p className="text-xs sm:text-sm text-secondaryDark mt-1">
              {routes.length} active routes
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {Object.keys(groupedRoutes).map(function (division) {
              const divisionRoutes = groupedRoutes[division];
              
              return (
                <div key={division}>
                  <h3 className="text-xs sm:text-sm font-bold text-primary mb-3 sm:mb-4 tracking-wide">
                    {division}
                  </h3>

                  <div className="relative pl-4 sm:pl-6">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-secondary"></div>

                    {divisionRoutes.map(function (route, index) {
                      const isExpanded = selectedRoute === route.id;
                      
                      return (
                        <div key={route.id} className="relative mb-4 sm:mb-6">
                          <div className="absolute left-[-1.06rem] sm:left-[-1.56rem] top-4 w-3 sm:w-4 h-0.5 bg-secondary"></div>
                          <div className="absolute left-[-1.31rem] sm:left-[-1.81rem] top-3.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-primary border-2 border-white"></div>

                          <div
                            className="bg-background rounded-large p-3 sm:p-4 cursor-pointer hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                            onClick={() => handleRouteClick(route.id)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0 pr-2">
                                <h4 className="text-sm sm:text-base font-semibold text-secondaryDark mb-1 truncate">
                                  {route.name}
                                </h4>
                                <p className="text-xs text-secondaryDark">
                                  {route.location}
                                </p>
                              </div>
                              <span
                                className={`${route.statusColor} text-white text-xs px-2 sm:px-3 py-1 rounded-medium font-medium whitespace-nowrap`}
                              >
                                {route.status}
                              </span>
                            </div>

                            <div>
                              <p className="text-xs text-secondaryDark mb-2 font-medium">
                                Assigned Team
                              </p>
                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                {route.team.map(function (member, idx) {
                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-1">
                                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                                        {member.image ? (
                                          <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full rounded-full object-cover"
                                          />
                                        ) : (
                                          getWorkerInitial(member.name)
                                        )}
                                      </div>
                                      <span className="text-xs text-secondaryDark">
                                        {member.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-secondary">
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                  <div>
                                    <p className="text-xs text-secondaryDark font-semibold mb-1">
                                      Status
                                    </p>
                                    <p className="text-xs text-secondaryDark">
                                      {route.status}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-secondaryDark font-semibold mb-1">
                                      Time
                                    </p>
                                    <p className="text-xs text-secondaryDark">
                                      {route.time}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:mt-3">
                                  <p className="text-xs text-secondaryDark font-semibold mb-1">
                                    Route ID
                                  </p>
                                  <p className="text-xs text-secondaryDark">
                                    {route.id}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}

export default TrashRoute;