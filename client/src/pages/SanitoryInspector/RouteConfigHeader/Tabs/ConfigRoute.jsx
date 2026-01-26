import React, { useState } from "react";
import { Search, X, Check, Edit, Trash, More } from "../../../../assets/icons/icons";
import Pagination from "../../../../utils/Pagination";
import ToastNotification from "../../../../components/Notification/ToastNotification";
import ThemeStore from "../../../../store/ThemeStore";
import ConfigRouteModal from "../../../../components/Modals/SanitaryInspector/ConfigRoute/ConfigRouteModal";
import { ToastContainer } from "react-toastify";

// Main ConfigRoute Component
function ConfigRoute() {
  const { isDarkTheme } = ThemeStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("Fairlands Division");
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);

  const [routes, setRoutes] = useState([
    { id: 1, name: "Route A", streets: 8, households: 120, isDraft: false },
    { id: 2, name: "Route B", streets: 6, households: 95, isDraft: false },
    { id: 3, name: "Route C", streets: 10, households: 150, isDraft: false },
    { id: 4, name: "Route D", streets: 5, households: 75, isDraft: false },
  ]);

  const [structureRoutes, setStructureRoutes] = useState([
    { id: 1, name: "Route A" },
    { id: 2, name: "Route B" },
    { id: 3, name: "Route C" },
    { id: 4, name: "Route D" },
  ]);

  const filteredRoutes = routes.filter(function (route) {
    return route.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  function handleSearchToggle() {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchQuery("");
    }
  }

  function handleAddRoute() {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile && !selectedDivision) {
      ToastNotification("Please select a division first", "error");
      return;
    }
    
    const newRoute = {
      id: Date.now(),
      name: "New Route",
      streets: 0,
      households: 0,
      isDraft: true
    };
    
    setRoutes([...routes, newRoute]);
    setStructureRoutes([...structureRoutes, { id: newRoute.id, name: newRoute.name }]);
    ToastNotification("Draft route added. Edit the name to save.", "info");
  }

  function handleEditClick(route) {
    setEditingRoute(route.id);
    setEditValue(route.name);
    setActiveMenu(null);
  }

  function handleSaveEdit() {
    if (!editValue.trim()) {
      ToastNotification("Route name cannot be empty", "error");
      return;
    }

    setRoutes(routes.map(r => 
      r.id === editingRoute 
        ? { ...r, name: editValue, isDraft: false } 
        : r
    ));
    
    setStructureRoutes(structureRoutes.map(r => 
      r.id === editingRoute 
        ? { ...r, name: editValue } 
        : r
    ));
    
    ToastNotification("Route updated successfully", "success");
    setEditingRoute(null);
    setEditValue("");
  }

  function handleCancelEdit() {
    const route = routes.find(r => r.id === editingRoute);
    if (route?.isDraft) {
      setRoutes(routes.filter(r => r.id !== editingRoute));
      setStructureRoutes(structureRoutes.filter(r => r.id !== editingRoute));
      ToastNotification("Draft route discarded", "info");
    } else {
      ToastNotification("Edit cancelled", "info");
    }
    setEditingRoute(null);
    setEditValue("");
  }

  function handleDeleteClick(route) {
    setRouteToDelete(route);
    setShowDeleteModal(true);
    setActiveMenu(null);
  }

  function handleConfirmDelete() {
    setRoutes(routes.filter(r => r.id !== routeToDelete.id));
    setStructureRoutes(structureRoutes.filter(r => r.id !== routeToDelete.id));
    ToastNotification("Route deleted successfully", "success");
    setShowDeleteModal(false);
    setRouteToDelete(null);
  }

  function renderRouteItem(route) {
    const isEditing = editingRoute === route.id;

    return (
      <div
        key={route.id}
        className={`bg-white border rounded-medium p-4 hover:shadow-sm transition-all duration-200 ease-in-out ${
          route.isDraft ? "border-warning" : "border-secondary"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-background rounded-medium">
              <div className="w-2 h-2 grid grid-cols-2 gap-0.5">
                <div className="w-1 h-1 bg-secondaryDark rounded-small"></div>
                <div className="w-1 h-1 bg-secondaryDark rounded-small"></div>
                <div className="w-1 h-1 bg-secondaryDark rounded-small"></div>
                <div className="w-1 h-1 bg-secondaryDark rounded-small"></div>
              </div>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-1 border border-primary rounded-medium text-sm font-bold text-secondaryDark bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                  autoFocus
                />
              ) : (
                <>
                  <h3 className="text-sm font-bold text-secondaryDark">
                    {route.name}
                  </h3>
                  <p className="text-xs text-secondaryDark mt-1">
                    {route.streets} Streets • {route.households} Households
                  </p>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                className="p-1.5 bg-success rounded-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
              >
                <Check size={16} defaultColor="#FFFFFF" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1.5 bg-error rounded-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
              >
                <X size={16} defaultColor="#FFFFFF" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === route.id ? null : route.id)}
                className="p-1 hover:bg-background rounded-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
              >
                <More size={18} isDarkTheme={isDarkTheme} />
              </button>
              {activeMenu === route.id && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-secondary rounded-medium shadow-lg z-10">
                  <button
                    onClick={() => handleEditClick(route)}
                    className="w-full px-4 py-2 text-left text-sm text-secondaryDark hover:bg-background transition-all duration-200 ease-in-out flex items-center gap-2 rounded-t-medium"
                  >
                    <Edit size={14} isDarkTheme={isDarkTheme} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(route)}
                    className="w-full px-4 py-2 text-left text-sm text-error hover:bg-background transition-all duration-200 ease-in-out flex items-center gap-2 rounded-b-medium"
                  >
                    <Trash size={14} defaultColor="#E75A4C" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Available Routes */}
          <div className="bg-white rounded-large p-6 border border-secondary">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-secondaryDark">
                  AVAILABLE ROUTES ({filteredRoutes.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {searchOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search routes..."
                      className="px-3 py-1.5 border border-secondary rounded-medium text-sm bg-background text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                      autoFocus
                    />
                    <button
                      onClick={handleSearchToggle}
                      className="p-2 hover:bg-background rounded-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
                    >
                      <X size={18} isDarkTheme={isDarkTheme} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSearchToggle}
                    className="p-2 hover:bg-background rounded-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
                  >
                    <Search size={18} isDarkTheme={isDarkTheme} />
                  </button>
                )}
              </div>
            </div>

            {/* Routes List with Pagination */}
            <Pagination
              data={filteredRoutes}
              itemsPerPage={5}
              renderItem={renderRouteItem}
            />
          </div>

          {/* Right Side - Division Structure */}
          <div className="bg-white rounded-large p-6 border border-secondary">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-secondaryDark">
                DIVISION ORGANIZATION (TARGET)
              </h2>
              <span className="text-xs text-secondaryDark">
                Fairlands Division
              </span>
            </div>

            {/* Division Selection Card */}
            <div
              onClick={() => setSelectedDivision("Fairlands Division")}
              className={`border  rounded-large p-6 transition-all duration-200 ease-in-out cursor-pointer ${
                selectedDivision
                  ? "border-primary bg-secondary"
                  : "border-secondary hover:border-primary/50"
              }`}
            >
              <div className="bg-secondary rounded-medium p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-secondaryDark">
                    Fairlands Division Structure
                  </h3>
                  <span className="text-xs font-bold text-primary">
                    {structureRoutes.length} Active Routes
                  </span>
                </div>

                {/* Route List */}
                <div className="space-y-2">
                  {structureRoutes.map(function (route, index) {
                    const routeData = routes.find(r => r.id === route.id);
                    return (
                      <div
                        key={route.id}
                        className={`flex items-center justify-between bg-white px-3 py-2 rounded-medium ${
                          routeData?.isDraft ? "border border-warning" : ""
                        }`}
                      >
                        <span className="text-sm text-secondaryDark">
                          {index + 1}. {route.name}
                        </span>
                        {!routeData?.isDraft && (
                          <Check size={16} defaultColor="#1E8E54" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Add Route Button at Top */}
            <button
              onClick={handleAddRoute}
              className="mt-3  w-full bg-primary text-white px-4 py-3 rounded-medium font-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] mb-4"
            >
              Add Route
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfigRouteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setRouteToDelete(null);
          }}
          mode="delete"
          data={routeToDelete}
          onSubmit={handleConfirmDelete}
        />
      </div>
      <ToastContainer/>
    </div>
  );
}

export default ConfigRoute;
