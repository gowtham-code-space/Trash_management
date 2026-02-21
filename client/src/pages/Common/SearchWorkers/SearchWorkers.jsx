import React, { useState, useEffect } from "react";
import { Search } from "../../../assets/icons/icons";
import ThemeStore from "../../../store/ThemeStore";
import WorkerInfoCard from "../../../components/Cards/Workers/WorkersInfoCard";
import Pagination from "../../../utils/Pagination";

function SearchWorkers() {
  const { isDarkTheme } = ThemeStore();
  
  const [userRole] = useState("MHO");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(function() {
    const timer = setTimeout(function() {
      setIsLoading(false);
    }, 800);
    return function() {
      clearTimeout(timer);
    };
  }, []);
  
  useEffect(function() {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(function() {
        setIsSearching(false);
      }, 300);
      return function() {
        clearTimeout(timer);
      };
    }
  }, [searchQuery]);

  const allWorkers = [
    {
      id: 1,
      profile_pic:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      name: "Gowtham CD",
      role: "TrashMan",
      ratings: 4.8,
      attendance: 96,
      tasksCompleted: 142,
    },
    {
      id: 2,
      profile_pic: null,
      name: "Prakash PV",
      role: "TrashMan",
      ratings: 4.5,
      attendance: 88,
      tasksCompleted: 128,
    },
    {
      id: 3,
      profile_pic: null,
      name: "Thirumurugan K",
      role: "Supervisor",
      ratings: 4.7,
      attendance: 94,
      tasksCompleted: 89,
    },
    {
      id: 4,
      profile_pic: null,
      name: "Arun Kumar M",
      role: "Supervisor",
      ratings: 4.9,
      attendance: 98,
      tasksCompleted: 95,
    },
    {
      id: 5,
      profile_pic: null,
      name: "Divya Bharathi S",
      role: "SI",
      ratings: 4.6,
      attendance: 92,
      tasksCompleted: 76,
    },
    {
      id: 6,
      profile_pic: null,
      name: "Harish Raj P",
      role: "SI",
      ratings: 4.4,
      attendance: 85,
      tasksCompleted: 68,
    },
    {
      id: 7,
      profile_pic: null,
      name: "Ramesh Kumar",
      role: "TrashMan",
      ratings: 4.7,
      attendance: 91,
      tasksCompleted: 135,
    },
    {
      id: 8,
      profile_pic: null,
      name: "Lakshmi S",
      role: "TrashMan",
      ratings: 4.9,
      attendance: 97,
      tasksCompleted: 156,
    },
    {
      id: 9,
      profile_pic: null,
      name: "Vijay Kumar",
      role: "Supervisor",
      ratings: 4.6,
      attendance: 89,
      tasksCompleted: 82,
    },
    {
      id: 10,
      profile_pic: null,
      name: "Priya Sharma",
      role: "SI",
      ratings: 4.8,
      attendance: 95,
      tasksCompleted: 88,
    },
    {
      id: 11,
      profile_pic: null,
      name: "Karthik R",
      role: "TrashMan",
      ratings: 4.3,
      attendance: 87,
      tasksCompleted: 115,
    },
    {
      id: 12,
      profile_pic: null,
      name: "Anitha M",
      role: "Supervisor",
      ratings: 4.8,
      attendance: 93,
      tasksCompleted: 91,
    },
    {
      id: 13,
      profile_pic: null,
      name: "Suresh B",
      role: "TrashMan",
      ratings: 4.6,
      attendance: 90,
      tasksCompleted: 138,
    },
    {
      id: 14,
      profile_pic: null,
      name: "Meena K",
      role: "SI",
      ratings: 4.7,
      attendance: 94,
      tasksCompleted: 85,
    },
    {
      id: 15,
      profile_pic: null,
      name: "Rajesh M",
      role: "Supervisor",
      ratings: 4.5,
      attendance: 88,
      tasksCompleted: 79,
    },
  ];

  function getAvailableFilters() {
    if (userRole === "Supervisor") {
      return ["All", "TrashMan"];
    } else if (userRole === "SI") {
      return ["All", "TrashMan", "Supervisor"];
    } else if (userRole === "MHO") {
      return ["All", "TrashMan", "Supervisor", "SI"];
    }
    return ["All"];
  }

  function getFilteredWorkers() {
    let filtered = allWorkers;

    if (userRole === "Supervisor") {
      filtered = filtered.filter(function (w) {
        return w.role === "TrashMan";
      });
    } else if (userRole === "SI") {
      filtered = filtered.filter(function (w) {
        return w.role === "TrashMan" || w.role === "Supervisor";
      });
    }

    if (activeFilter !== "All") {
      filtered = filtered.filter(function (w) {
        return w.role === activeFilter;
      });
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(function (w) {
        return w.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    return filtered;
  }

  const availableFilters = getAvailableFilters();
  const filteredWorkers = getFilteredWorkers();

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="min-h-screen bg-background animate-in fade-in duration-700 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto space-y-5">

          <div className="bg-white border border-secondary rounded-large p-4 shadow-sm space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                <Search size={18} defaultColor="#316F5D" isDarkTheme={isDarkTheme} DarkThemeColor="#B7D6C9" />
              </div>
              <input
                type="text"
                placeholder="Search workers..."
                value={searchQuery}
                onChange={function (e) {
                  setSearchQuery(e.target.value);
                }}
                className="w-full bg-background border border-secondary rounded-medium py-2 pl-8 pr-4
                            text-sm text-secondaryDark placeholder:text-secondaryDark/60
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                            transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-2">
              {availableFilters.map(function (filter) {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={function () {
                      setActiveFilter(filter);
                    }}
                    className={`px-3 py-1.5 rounded-medium text-xs font-bold
                                transition-all duration-200 hover:scale-[0.99] active:scale-[0.99]
                                focus:outline-none focus:ring-2 focus:ring-primary/20
                                ${
                                  isActive
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-secondary text-secondaryDark"
                                }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(function(i) {
                return (
                  <div key={i} className="bg-white rounded-large p-4 border border-secondary shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-secondary rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-3/4"></div>
                        <div className="h-3 bg-secondary rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-secondary rounded"></div>
                      <div className="h-8 bg-secondary rounded-medium"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : filteredWorkers.length > 0 ? (
            <Pagination
              gridDisplay={true}
              data={filteredWorkers} 
              itemsPerPage={6}
              renderItem={function(worker, index) {
                return (
                  <div
                    key={worker.id}
                    style={{ animationDelay: `${index * 30}ms` }}
                    className="animate-fadeInUp"
                  >
                    <WorkerInfoCard
                      worker={worker}
                      isDarkTheme={isDarkTheme}
                    />
                  </div>
                );
              }}
            />
          ) : (
            <div className="bg-white border border-secondary rounded-large p-12 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                <Search size={24} defaultColor="#316F5D" isDarkTheme={isDarkTheme} />
              </div>
              <h3 className="text-sm font-bold text-secondaryDark mb-1">No workers found</h3>
              <p className="text-xs text-secondaryDark/60 mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={function() { 
                  setSearchQuery(''); 
                  setActiveFilter('All'); 
                }}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-medium
                          hover:scale-[0.99] active:scale-[0.99] transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchWorkers;