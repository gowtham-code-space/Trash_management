import React, { useState, useMemo } from "react";
import ThemeStore from "../../../../store/ThemeStore";
import { Search, Filter, X, Check, Edit, Trash } from "../../../../assets/icons/icons";
import ConfigWardModal from "../../../../components/Modals/MHO/ConfigWard/ConfigWardModal";
import WardFilterModal from "../../../../components/Modals/MHO/ConfigWard/WardFilterModal";
import MoveWardModal from "../../../../components/Modals/MHO/ConfigWard/MoveWardModal";
import ToastNotification from "../../../../components/Notification/ToastNotification";
import Pagination from "../../../../utils/Pagination";
import { ToastContainer } from "react-toastify";

function ConfigWard() {
  const { isDarkTheme } = ThemeStore();
  
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedDivisionFilters, setSelectedDivisionFilters] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ visible: false, wardId: null });
  const [editingWard, setEditingWard] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [moveModal, setMoveModal] = useState({ visible: false, ward: null });

  const [wards, setWards] = useState([
    { id: 1, ward_number: "Ward - 1", ward_name: "Kannankurichi", streets: 150, division: "Fairlands (Div-01)", isDraft: false },
    { id: 2, ward_number: "Ward - 2", ward_name: "Muthunagar", streets: 200, division: "Fairlands (Div-01)", isDraft: false },
    { id: 3, ward_number: "Ward - 3", ward_name: "Swarnapuri", streets: 180, division: "Fairlands (Div-01)", isDraft: false },
    { id: 4, ward_number: "Ward - 4", ward_name: "Kollampalayam", streets: 220, division: "Hasthampatti (Div-02)", isDraft: false },
    { id: 5, ward_number: "Ward - 5", ward_name: "Thottapalayam", streets: 190, division: "Hasthampatti (Div-02)", isDraft: false },
    { id: 6, ward_number: "Ward - 6", ward_name: "Valasaiyur", streets: 210, division: "Hasthampatti (Div-02)", isDraft: false },
    { id: 7, ward_number: "Ward - 7", ward_name: "Ramalingapuram", streets: 175, division: "Ammapet Main (Div-05)", isDraft: false },
    { id: 8, ward_number: "Ward - 8", ward_name: "Narasothipatti", streets: 195, division: "Ammapet Main (Div-05)", isDraft: false },
    { id: 9, ward_number: "Ward - 9", ward_name: "Periyanagaram", streets: 160, division: "Junction Area (Div-08)", isDraft: false },
    { id: 10, ward_number: "Ward - 10", ward_name: "Chinnagaram", streets: 230, division: "Junction Area (Div-08)", isDraft: false },
    { id: 11, ward_number: "Ward - 11", ward_name: "Alagapuram", streets: 185, division: "Seelanaikenpatti", isDraft: false },
    { id: 12, ward_number: "Ward - 12", ward_name: "Pallapatti", streets: 205, division: "Seelanaikenpatti", isDraft: false },
  ]);

  const divisions = useMemo(function() {
    return [
      { 
        id: 1, 
        name: "Fairlands (Div-01)", 
        wards: wards.filter(function(w) { return w.division === "Fairlands (Div-01)"; })
      },
      { 
        id: 2, 
        name: "Hasthampatti (Div-02)", 
        wards: wards.filter(function(w) { return w.division === "Hasthampatti (Div-02)"; })
      },
      { 
        id: 3, 
        name: "Ammapet Main (Div-05)", 
        wards: wards.filter(function(w) { return w.division === "Ammapet Main (Div-05)"; })
      },
      { 
        id: 4, 
        name: "Junction Area (Div-08)", 
        wards: wards.filter(function(w) { return w.division === "Junction Area (Div-08)"; })
      },
      { 
        id: 5, 
        name: "Seelanaikenpatti", 
        wards: wards.filter(function(w) { return w.division === "Seelanaikenpatti"; })
      },
    ];
  }, [wards]);

  function handleSearchToggle() {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery("");
    }
  }

  function handleFilterApply(selectedDivisions) {
    setSelectedDivisionFilters(selectedDivisions);
    setFilterVisible(false);
    ToastNotification("Filter applied successfully", "success");
  }

  function handleDivisionSelect(divisionName) {
    if (selectedDivision === divisionName) {
      setSelectedDivision(null);
    } else {
      setSelectedDivision(divisionName);
    }
  }

  function handleAddWard() {
    if (!selectedDivision) {
      ToastNotification("Please select a division first", "error");
      return;
    }

    const newWard = {
      id: Date.now(),
      ward_number: "New Ward (Draft)",
      ward_name: "Location Name",
      streets: 0,
      division: selectedDivision,
      isDraft: true
    };

    setWards([...wards, newWard]);
    ToastNotification("Draft ward added to " + selectedDivision, "success");
  }

  function handleEditStart(ward) {
    setEditingWard(ward.id);
    setEditValue(ward.ward_number);
  }

  function handleEditSave(wardId) {
    setWards(wards.map(function(w) {
      return w.id === wardId ? { ...w, ward_number: editValue, isDraft: false } : w;
    }));
    setEditingWard(null);
    setEditValue("");
    ToastNotification("Ward updated successfully", "success");
  }

  function handleEditCancel() {
    setEditingWard(null);
    setEditValue("");
  }

  function handleDeleteConfirm(wardId) {
    setWards(wards.filter(function(w) { return w.id !== wardId; }));
    setDeleteModal({ visible: false, wardId: null });
    ToastNotification("Ward deleted successfully", "success");
  }

  function handleMoveWard(wardId, newDivision) {
    setWards(wards.map(function(w) {
      return w.id === wardId ? { ...w, division: newDivision } : w;
    }));
    setMoveModal({ visible: false, ward: null });
    ToastNotification("Ward moved to " + newDivision + " successfully", "success");
  }

  function handleWardClick(ward, event) {
    event.stopPropagation();
    setMoveModal({ visible: true, ward: ward });
  }

  const filteredWards = wards.filter(function(ward) {
    const matchesSearch = ward.ward_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ward.ward_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedDivisionFilters.length === 0 || selectedDivisionFilters.includes(ward.division);
    return matchesSearch && matchesFilter;
  });

  function renderWardCard(ward) {
    const isEditing = editingWard === ward.id;
    const menuOpen = openMenuId === ward.id;

    return (
      <div
        key={ward.id}
        className={`bg-white p-4 rounded-medium border border-secondary relative
                   active:scale-[0.99]
                   
                   transition-all duration-200 ease-in-out
                   ${ward.isDraft ? "border-warning" : ""}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              <div className="w-6 h-6 flex items-center justify-center gap-0.5">
                <div className="w-1 h-1 bg-secondaryDark rounded-full"></div>
                <div className="w-1 h-1 bg-secondaryDark rounded-full"></div>
              </div>
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={function(e) { setEditValue(e.target.value); }}
                    className="flex-1 px-3 py-1.5 border border-primary rounded-medium text-sm bg-white text-secondaryDark
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                             transition-all duration-200 ease-in-out"
                    autoFocus
                  />
                  <button
                    onClick={function() { handleEditSave(ward.id); }}
                    className="p-1.5 bg-success text-white rounded-medium
                             hover:scale-[0.99] active:scale-[0.99]
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                             transition-all duration-200 ease-in-out"
                  >
                    <Check size={16} isDarkTheme={true} />
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="p-1.5 bg-error text-white rounded-medium
                             hover:scale-[0.99] active:scale-[0.99]
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                             transition-all duration-200 ease-in-out"
                  >
                    <X size={16} isDarkTheme={true} />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-secondaryDark">
                    {ward.ward_number}
                  </h3>
                  <p className="text-xs text-secondaryDark mt-1">
                    {ward.ward_name}
                  </p>
                  <p className="text-xs text-secondaryDark mt-1">
                    {ward.streets} Streets
                  </p>
                  <p className="text-xs text-primary font-bold mt-1">
                    {ward.division}
                  </p>
                  {ward.isDraft && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-small font-bold">
                      Draft
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="relative">
              <button
                onClick={function() { setOpenMenuId(menuOpen ? null : ward.id); }}
                className="p-1 hover:bg-secondary rounded-medium active:scale-[0.99]
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                         transition-all duration-200 ease-in-out"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="w-1 h-1 bg-secondaryDark rounded-full"></div>
                  <div className="w-1 h-1 bg-secondaryDark rounded-full"></div>
                  <div className="w-1 h-1 bg-secondaryDark rounded-full"></div>
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-5 top-0 mt-1 bg-white border border-secondary rounded-medium shadow-lg z-10 w-32">
                  <button
                    onClick={function() {
                      handleEditStart(ward);
                      setOpenMenuId(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-secondaryDark hover:bg-secondary
                             flex items-center gap-2 rounded-t-medium
                             hover:scale-[0.99] active:scale-[0.99]
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                             transition-all duration-200 ease-in-out"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={function() {
                      setDeleteModal({ visible: true, wardId: ward.id });
                      setOpenMenuId(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-error hover:bg-secondary
                             flex items-center gap-2 rounded-b-medium
                             hover:scale-[0.99] active:scale-[0.99]
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                             transition-all duration-200 ease-in-out"
                  >
                    <Trash size={14} defaultColor="#E75A4C" />
                    <span>Delete</span>
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-large p-6 border border-secondary">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-secondaryDark">
                  ALL WARDS ({filteredWards.length})
                </h2>
                
                <div className="flex items-center gap-2">
                  {searchVisible && (
                    <input
                      type="text"
                      placeholder="Search wards..."
                      value={searchQuery}
                      onChange={function(e) { setSearchQuery(e.target.value); }}
                      className="px-3 py-1.5 border border-secondary rounded-medium text-sm bg-white text-secondaryDark
                               focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                               transition-all duration-200 ease-in-out w-48"
                    />
                  )}
                  
                  <button
                    onClick={handleSearchToggle}
                    className={`p-2 rounded-medium border border-secondary
                             hover:scale-[0.99] active:scale-[0.99]
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                             transition-all duration-200 ease-in-out
                             ${searchVisible ? "bg-primary" : "bg-white"}`}
                  >
                    <Search size={18} isDarkTheme={searchVisible} />
                  </button>
                  
                  <button
                    onClick={function() { setFilterVisible(true); }}
                    className={`p-2 rounded-medium border border-secondary
                             hover:scale-[0.99] active:scale-[0.99]
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                             transition-all duration-200 ease-in-out
                             ${selectedDivisionFilters.length > 0 ? "bg-primary" : "bg-white"}`}
                  >
                    <Filter size={18} isDarkTheme={selectedDivisionFilters.length > 0} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Pagination
                  data={filteredWards}
                  itemsPerPage={5}
                  renderItem={renderWardCard}
                />
              </div>
            </div>

            <div className="bg-white rounded-large p-6 border border-secondary">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-secondaryDark">
                  TARGET DIVISIONS ({divisions.length})
                </h2>
                
                <button
                  onClick={handleAddWard}
                  className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-medium
                           hover:scale-[0.99] active:scale-[0.99]
                           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                           transition-all duration-200 ease-in-out"
                >
                  Add Ward
                </button>
              </div>

              <div className="space-y-4">
                {divisions.map(function(division) {
                  return (
                    <div
                      key={division.id}
                      onClick={function() { handleDivisionSelect(division.name); }}
                      className={`p-4 rounded-medium border-2 cursor-pointer
                               hover:scale-[0.99] active:scale-[0.99]
                               focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                               transition-all duration-200 ease-in-out
                               ${selectedDivision === division.name 
                                 ? "border-primary bg-secondary" 
                                 : "border-secondary bg-white"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-secondaryDark">
                          {division.name}
                        </h3>
                        <span className="text-xs text-secondaryDark">
                          {division.wards.length} Wards
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {division.wards.map(function(ward) {
                          return (
                            <button
                              key={ward.id}
                              onClick={function(e) { handleWardClick(ward, e); }}
                              className={`px-3 py-1 text-xs rounded-small border border-secondary
                                       hover:scale-[0.99] active:scale-[0.99]
                                       focus:outline-none focus:ring-2 focus:ring-primary/20
                                       transition-all duration-200 ease-in-out
                                       ${ward.isDraft 
                                         ? "bg-warning/20 text-warning font-bold hover:bg-warning/30" 
                                         : "bg-background text-secondaryDark hover:bg-secondary"}`}
                            >
                              {ward.ward_number}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {filterVisible && (
          <WardFilterModal
            divisions={divisions.map(function(d) { return d.name; })}
            selectedDivisions={selectedDivisionFilters}
            onClose={function() { setFilterVisible(false); }}
            onApply={handleFilterApply}
          />
        )}

        {deleteModal.visible && (
          <ConfigWardModal
            title="Delete Ward"
            message="Are you sure you want to delete this ward? This action cannot be undone."
            onConfirm={function() { handleDeleteConfirm(deleteModal.wardId); }}
            onCancel={function() { setDeleteModal({ visible: false, wardId: null }); }}
          />
        )}

        {moveModal.visible && moveModal.ward && (
          <MoveWardModal
            ward={moveModal.ward}
            divisions={divisions}
            onConfirm={handleMoveWard}
            onCancel={function() { setMoveModal({ visible: false, ward: null }); }}
          />
        )}
      </div>
      <ToastContainer/>
    </div>
  );
}

export default ConfigWard;
