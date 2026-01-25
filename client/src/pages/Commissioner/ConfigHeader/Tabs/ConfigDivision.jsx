import React, { useState, useMemo } from "react";
import ThemeStore from "../../../../store/ThemeStore";
import { Search, Filter, X, Check, Edit, Trash } from "../../../../assets/icons/icons";
import ConfigDivisionModal from "../../../../components/Modals/MHO/ConfigDivision/ConfigDivisionModal";
import DivisionFilter from "../../../../components/Modals/MHO/ConfigDivision/DivisionFIlterModal";
import MoveDivisionModal from "../../../../components/Modals/MHO/ConfigDivision/MoveDivisionModal";
import ToastNotification from "../../../../components/Notification/ToastNotification";
import Pagination from "../../../../utils/Pagination";
import { ToastContainer } from "react-toastify";
function ConfigDivision() {
    const { isDarkTheme } = ThemeStore();
    
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterVisible, setFilterVisible] = useState(false);
    const [selectedZoneFilters, setSelectedZoneFilters] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ visible: false, divisionId: null });
    const [editingDivision, setEditingDivision] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [moveModal, setMoveModal] = useState({ visible: false, division: null });

    const [divisions, setDivisions] = useState([
        { id: 1, name: "Fairlands (Div-01)", wards: 3, streets: 14, zone: "North Zone", isDraft: false },
        { id: 2, name: "Hasthampatti (Div-02)", wards: 5, streets: 22, zone: "North Zone", isDraft: false },
        { id: 3, name: "Ammapet Main (Div-05)", wards: 7, streets: 18, zone: "East Zone", isDraft: false },
        { id: 4, name: "Junction Area (Div-08)", wards: 8, streets: 30, zone: "West Zone", isDraft: false },
        { id: 5, name: "Seelanaikenpatti", wards: 4, streets: 16, zone: "South Zone", isDraft: false },
        { id: 6, name: "Dasagapatti", wards: 6, streets: 20, zone: "South Zone", isDraft: false },
        { id: 7, name: "Gugai", wards: 5, streets: 15, zone: "South Zone", isDraft: false },
        { id: 8, name: "Linemeds", wards: 3, streets: 12, zone: "South Zone", isDraft: false },
        { id: 9, name: "Ponnammapet", wards: 6, streets: 19, zone: "East Zone", isDraft: false },
        { id: 10, name: "Patta Kovil", wards: 4, streets: 14, zone: "East Zone", isDraft: false },
        { id: 11, name: "Suramangalam", wards: 7, streets: 25, zone: "West Zone", isDraft: false },
        { id: 12, name: "Reddipatti", wards: 5, streets: 17, zone: "West Zone", isDraft: false },
    ]);

    const zones = useMemo(function() {
        return [
        { 
            id: 1, 
            name: "North Zone", 
            divisions: divisions.filter(function(d) { return d.zone === "North Zone"; })
        },
        { 
            id: 2, 
            name: "South Zone", 
            divisions: divisions.filter(function(d) { return d.zone === "South Zone"; })
        },
        { 
            id: 3, 
            name: "East Zone", 
            divisions: divisions.filter(function(d) { return d.zone === "East Zone"; })
        },
        { 
            id: 4, 
            name: "West Zone", 
            divisions: divisions.filter(function(d) { return d.zone === "West Zone"; })
        },
        ];
    }, [divisions]);

    function handleSearchToggle() {
        setSearchVisible(!searchVisible);
        if (searchVisible) {
        setSearchQuery("");
        }
    }

    function handleFilterApply(selectedZones) {
        setSelectedZoneFilters(selectedZones);
        setFilterVisible(false);
        ToastNotification("Filter applied successfully", "success");
    }

    function handleZoneSelect(zoneName) {
        if (selectedZone === zoneName) {
        setSelectedZone(null);
        } else {
        setSelectedZone(zoneName);
        }
    }

    function handleAddDivision() {
        if (!selectedZone) {
        ToastNotification("Please select a zone first", "error");
        return;
        }

        const newDivision = {
        id: Date.now(),
        name: "New Division (Draft)",
        wards: 0,
        streets: 0,
        zone: selectedZone,
        isDraft: true
        };

        setDivisions([...divisions, newDivision]);
        ToastNotification("Draft division added to " + selectedZone, "success");
    }

    function handleEditStart(division) {
        setEditingDivision(division.id);
        setEditValue(division.name);
    }

    function handleEditSave(divisionId) {
        setDivisions(divisions.map(function(d) {
        return d.id === divisionId ? { ...d, name: editValue, isDraft: false } : d;
        }));
        setEditingDivision(null);
        setEditValue("");
        ToastNotification("Division updated successfully", "success");
    }

    function handleEditCancel() {
        setEditingDivision(null);
        setEditValue("");
    }

    function handleDeleteConfirm(divisionId) {
        setDivisions(divisions.filter(function(d) { return d.id !== divisionId; }));
        setDeleteModal({ visible: false, divisionId: null });
        ToastNotification("Division deleted successfully", "success");
    }

    function handleMoveDivision(divisionId, newZone) {
        setDivisions(divisions.map(function(d) {
            return d.id === divisionId ? { ...d, zone: newZone } : d;
        }));
        setMoveModal({ visible: false, division: null });
        ToastNotification("Division moved to " + newZone + " successfully", "success");
    }

    function handleDivisionClick(division, event) {
        event.stopPropagation();
        setMoveModal({ visible: true, division: division });
    }

    const filteredDivisions = divisions.filter(function(division) {
        const matchesSearch = division.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedZoneFilters.length === 0 || selectedZoneFilters.includes(division.zone);
        return matchesSearch && matchesFilter;
    });

    function renderDivisionCard(division) {
    const isEditing = editingDivision === division.id;
    const menuOpen = openMenuId === division.id;

        return (
        <div
            key={division.id}
            className={`bg-white p-4 rounded-medium border border-secondary relative
                    active:scale-[0.99]
                    
                    transition-all duration-200 ease-in-out
                    ${division.isDraft ? "border-warning" : ""}`}
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
                        onClick={function() { handleEditSave(division.id); }}
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
                        {division.name}
                    </h3>
                    <p className="text-xs text-secondaryDark mt-1">
                        {division.wards} Wards • {division.streets} Streets
                    </p>
                    <p className="text-xs text-primary font-bold mt-1">
                        {division.zone}
                    </p>
                    {division.isDraft && (
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
                    onClick={function() { setOpenMenuId(menuOpen ? null : division.id); }}
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
                        handleEditStart(division);
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
                        setDeleteModal({ visible: true, divisionId: division.id });
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
                    ALL DIVISIONS ({filteredDivisions.length})
                    </h2>
                    
                    <div className="flex items-center gap-2">
                    {searchVisible && (
                        <input
                        type="text"
                        placeholder="Search divisions..."
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
                                ${selectedZoneFilters.length > 0 ? "bg-primary" : "bg-white"}`}
                    >
                        <Filter size={18} isDarkTheme={selectedZoneFilters.length > 0} />
                    </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <Pagination
                    data={filteredDivisions}
                    itemsPerPage={5}
                    renderItem={renderDivisionCard}
                    />
                </div>
                </div>

                <div className="bg-white rounded-large p-6 border border-secondary">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-secondaryDark">
                    TARGET ZONES ({zones.length})
                    </h2>
                    
                    <button
                    onClick={handleAddDivision}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-medium
                            hover:scale-[0.99] active:scale-[0.99]
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                            transition-all duration-200 ease-in-out"
                    >
                    Add Division
                    </button>
                </div>

                <div className="space-y-4">
                    {zones.map(function(zone) {
                    return (
                        <div
                        key={zone.id}
                        onClick={function() { handleZoneSelect(zone.name); }}
                        className={`p-4 rounded-medium border-2 cursor-pointer
                                hover:scale-[0.99] active:scale-[0.99]
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                                transition-all duration-200 ease-in-out
                                ${selectedZone === zone.name 
                                    ? "border-primary bg-secondary" 
                                    : "border-secondary bg-white"}`}
                        >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-secondaryDark">
                            {zone.name}
                            </h3>
                            <span className="text-xs text-secondaryDark">
                            {zone.divisions.length} Divisions
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {zone.divisions.map(function(division) {
                            return (
                                <button
                                key={division.id}
                                onClick={function(e) { handleDivisionClick(division, e); }}
                                className={`px-3 py-1 text-xs rounded-small border border-secondary
                                        hover:scale-[0.99] active:scale-[0.99]
                                        focus:outline-none focus:ring-2 focus:ring-primary/20
                                        transition-all duration-200 ease-in-out
                                        ${division.isDraft 
                                            ? "bg-warning/20 text-warning font-bold hover:bg-warning/30" 
                                            : "bg-background text-secondaryDark hover:bg-secondary"}`}
                                >
                                {division.name.split("(")[0].trim()}
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
            <DivisionFilter
                zones={zones.map(function(z) { return z.name; })}
                selectedZones={selectedZoneFilters}
                onClose={function() { setFilterVisible(false); }}
                onApply={handleFilterApply}
            />
            )}

            {deleteModal.visible && (
            <ConfigDivisionModal
                title="Delete Division"
                message="Are you sure you want to delete this division? This action cannot be undone."
                onConfirm={function() { handleDeleteConfirm(deleteModal.divisionId); }}
                onCancel={function() { setDeleteModal({ visible: false, divisionId: null }); }}
            />
            )}

            {moveModal.visible && moveModal.division && (
            <MoveDivisionModal
                division={moveModal.division}
                zones={zones}
                onConfirm={handleMoveDivision}
                onCancel={function() { setMoveModal({ visible: false, division: null }); }}
            />
            )}
        </div>
        <ToastContainer/>
        </div>
    );
}

export default ConfigDivision;