import React, { useState } from "react";
import { Search, X, Check, Edit, Trash } from "../../../../assets/icons/icons";
import Pagination from "../../../../utils/Pagination";
import ToastNotification from "../../../../components/Notification/ToastNotification";
import ThemeStore from "../../../../store/ThemeStore";
import ConfigZoneModal from "../../../../components/Modals/MHO/ConfigZoneModal";
import { ToastContainer } from "react-toastify";

// Main ConfigZone Component
function ConfigZone() {
  const { isDarkTheme } = ThemeStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Salem District");
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);

  const [zones, setZones] = useState([
    { id: 1, name: "North Zone", divisions: 5, wards: 18, isDraft: false },
    { id: 2, name: "South Zone", divisions: 4, wards: 15, isDraft: false },
    { id: 3, name: "East Zone", divisions: 3, wards: 12, isDraft: false },
    { id: 4, name: "West Zone", divisions: 6, wards: 21, isDraft: false },
  ]);

  const [structureZones, setStructureZones] = useState([
    { id: 1, name: "North Zone" },
    { id: 2, name: "South Zone" },
    { id: 3, name: "East Zone" },
    { id: 4, name: "West Zone" },
  ]);

  const filteredZones = zones.filter(function (zone) {
    return zone.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  function handleSearchToggle() {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchQuery("");
    }
  }

  function handleAddZone() {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile && !selectedDistrict) {
      ToastNotification("Please select a district first", "error");
      return;
    }
    
    const newZone = {
      id: Date.now(),
      name: "New Zone",
      divisions: 0,
      wards: 0,
      isDraft: true
    };
    
    setZones([...zones, newZone]);
    setStructureZones([...structureZones, { id: newZone.id, name: newZone.name }]);
    ToastNotification("Draft zone added. Edit the name to save.", "info");
  }

  function handleEditClick(zone) {
    setEditingZone(zone.id);
    setEditValue(zone.name);
    setActiveMenu(null);
  }

  function handleSaveEdit() {
    if (!editValue.trim()) {
      ToastNotification("Zone name cannot be empty", "error");
      return;
    }

    setZones(zones.map(z => 
      z.id === editingZone 
        ? { ...z, name: editValue, isDraft: false } 
        : z
    ));
    
    setStructureZones(structureZones.map(z => 
      z.id === editingZone 
        ? { ...z, name: editValue } 
        : z
    ));
    
    ToastNotification("Zone updated successfully", "success");
    setEditingZone(null);
    setEditValue("");
  }

  function handleCancelEdit() {
    const zone = zones.find(z => z.id === editingZone);
    if (zone?.isDraft) {
      setZones(zones.filter(z => z.id !== editingZone));
      setStructureZones(structureZones.filter(z => z.id !== editingZone));
      ToastNotification("Draft zone discarded", "info");
    } else {
      ToastNotification("Edit cancelled", "info");
    }
    setEditingZone(null);
    setEditValue("");
  }

  function handleDeleteClick(zone) {
    setZoneToDelete(zone);
    setShowDeleteModal(true);
    setActiveMenu(null);
  }

  function handleConfirmDelete() {
    setZones(zones.filter(z => z.id !== zoneToDelete.id));
    setStructureZones(structureZones.filter(z => z.id !== zoneToDelete.id));
    ToastNotification("Zone deleted successfully", "success");
    setShowDeleteModal(false);
    setZoneToDelete(null);
  }

  function renderZoneItem(zone) {
    const isEditing = editingZone === zone.id;

    return (
      <div
        key={zone.id}
        className={`bg-white border rounded-medium p-4 hover:shadow-sm transition-all duration-200 ease-in-out ${
          zone.isDraft ? "border-warning" : "border-secondary"
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
                    {zone.name}
                  </h3>
                  <p className="text-xs text-secondaryDark mt-1">
                    {zone.divisions} Divisions • {zone.wards} Wards
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
                onClick={() => setActiveMenu(activeMenu === zone.id ? null : zone.id)}
                className="p-1 hover:bg-background rounded-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="w-1 h-1 bg-secondaryDark rounded-full"></div>
                  <div className="w-1 h-1 bg-secondaryDark rounded-full"></div>
                  <div className="w-1 h-1 bg-secondaryDark rounded-full"></div>
                </div>
              </button>
              {activeMenu === zone.id && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-secondary rounded-medium shadow-lg z-10">
                  <button
                    onClick={() => handleEditClick(zone)}
                    className="w-full px-4 py-2 text-left text-sm text-secondaryDark hover:bg-background transition-all duration-200 ease-in-out flex items-center gap-2 rounded-t-medium"
                  >
                    <Edit size={14} isDarkTheme={isDarkTheme} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(zone)}
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
      <div className="min-h-screen bg-background p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Available Zones */}
          <div className="bg-white rounded-large p-6 border border-secondary">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-secondaryDark">
                  AVAILABLE ZONES ({filteredZones.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {searchOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search zones..."
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

            {/* Zones List with Pagination */}
            <Pagination
              data={filteredZones}
              itemsPerPage={5}
              renderItem={renderZoneItem}
            />
          </div>

          {/* Right Side - District Structure */}
          <div className="bg-white rounded-large p-6 border border-secondary">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-secondaryDark">
                DISTRICT ORGANIZATION (TARGET)
              </h2>
              <span className="text-xs text-secondaryDark">
                Salem District
              </span>
            </div>

            {/* District Selection Card */}
            <div
              onClick={() => setSelectedDistrict("Salem District")}
              className={`border  rounded-large p-6 transition-all duration-200 ease-in-out cursor-pointer ${
                selectedDistrict
                  ? "border-primary bg-secondary"
                  : "border-secondary hover:border-primary/50"
              }`}
            >
              <div className="bg-secondary rounded-medium p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-secondaryDark">
                    Salem District Structure
                  </h3>
                  <span className="text-xs font-bold text-primary">
                    {structureZones.length} Active Zones
                  </span>
                </div>

                {/* Zone List */}
                <div className="space-y-2">
                  {structureZones.map(function (zone, index) {
                    const zoneData = zones.find(z => z.id === zone.id);
                    return (
                      <div
                        key={zone.id}
                        className={`flex items-center justify-between bg-white px-3 py-2 rounded-medium ${
                          zoneData?.isDraft ? "border border-warning" : ""
                        }`}
                      >
                        <span className="text-sm text-secondaryDark">
                          {index + 1}. {zone.name}
                        </span>
                        {!zoneData?.isDraft && (
                          <Check size={16} defaultColor="#1E8E54" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Add Zone Button at Top */}
            <button
              onClick={handleAddZone}
              className="mt-3  w-full bg-primary text-white px-4 py-3 rounded-medium font-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] mb-4"
            >
              Add Zone
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfigZoneModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setZoneToDelete(null);
          }}
          mode="delete"
          data={zoneToDelete}
          onSubmit={handleConfirmDelete}
        />
      </div>
      <ToastContainer/>
    </div>
  );
}

export default ConfigZone;