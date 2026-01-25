import React, { useState, useMemo } from "react";
import ThemeStore from "../../../../store/ThemeStore";
import { Search, Filter, X, Check, Edit, Trash } from "../../../../assets/icons/icons";
import ConfigStreetModal from "../../../../components/Modals/MHO/ConfigStreet/ConfigStreetModal";
import StreetFilterModal from "../../../../components/Modals/MHO/ConfigStreet/StreetFilterModal";
import MoveStreetModal from "../../../../components/Modals/MHO/ConfigStreet/MoveStreetModal";
import ToastNotification from "../../../../components/Notification/ToastNotification";
import Pagination from "../../../../utils/Pagination";
import { ToastContainer } from "react-toastify";

function ConfigStreet() {
    const { isDarkTheme } = ThemeStore();
    
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterVisible, setFilterVisible] = useState(false);
    const [selectedWardFilters, setSelectedWardFilters] = useState([]);
    const [selectedWard, setSelectedWard] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ visible: false, streetId: null });
    const [editingStreet, setEditingStreet] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [moveModal, setMoveModal] = useState({ visible: false, street: null });

    const [streets, setStreets] = useState([
        { id: 1, street_name: "Main Street", households: 45, ward: "Ward - 1 (Kannankurichi)", isDraft: false },
        { id: 2, street_name: "Gandhi Road", households: 38, ward: "Ward - 1 (Kannankurichi)", isDraft: false },
        { id: 3, street_name: "Temple Street", households: 52, ward: "Ward - 1 (Kannankurichi)", isDraft: false },
        { id: 4, street_name: "Park Avenue", households: 41, ward: "Ward - 2 (Muthunagar)", isDraft: false },
        { id: 5, street_name: "Lake Road", households: 47, ward: "Ward - 2 (Muthunagar)", isDraft: false },
        { id: 6, street_name: "School Street", households: 35, ward: "Ward - 2 (Muthunagar)", isDraft: false },
        { id: 7, street_name: "Market Road", households: 60, ward: "Ward - 3 (Swarnapuri)", isDraft: false },
        { id: 8, street_name: "Station Road", households: 55, ward: "Ward - 3 (Swarnapuri)", isDraft: false },
        { id: 9, street_name: "College Street", households: 42, ward: "Ward - 4 (Kollampalayam)", isDraft: false },
        { id: 10, street_name: "Hospital Road", households: 48, ward: "Ward - 4 (Kollampalayam)", isDraft: false },
        { id: 11, street_name: "Industrial Street", households: 50, ward: "Ward - 5 (Thottapalayam)", isDraft: false },
        { id: 12, street_name: "Garden Street", households: 39, ward: "Ward - 5 (Thottapalayam)", isDraft: false },
        { id: 13, street_name: "North Street", households: 44, ward: "Ward - 6 (Valasaiyur)", isDraft: false },
        { id: 14, street_name: "South Street", households: 46, ward: "Ward - 6 (Valasaiyur)", isDraft: false },
        { id: 15, street_name: "East Street", households: 40, ward: "Ward - 7 (Ramalingapuram)", isDraft: false },
    ]);

    const wards = useMemo(function() {
        return [
        { 
            id: 1, 
            name: "Ward - 1 (Kannankurichi)", 
            streets: streets.filter(function(s) { return s.ward === "Ward - 1 (Kannankurichi)"; })
        },
        { 
            id: 2, 
            name: "Ward - 2 (Muthunagar)", 
            streets: streets.filter(function(s) { return s.ward === "Ward - 2 (Muthunagar)"; })
        },
        { 
            id: 3, 
            name: "Ward - 3 (Swarnapuri)", 
            streets: streets.filter(function(s) { return s.ward === "Ward - 3 (Swarnapuri)"; })
        },
        { 
            id: 4, 
            name: "Ward - 4 (Kollampalayam)", 
            streets: streets.filter(function(s) { return s.ward === "Ward - 4 (Kollampalayam)"; })
        },
        { 
            id: 5, 
            name: "Ward - 5 (Thottapalayam)", 
            streets: streets.filter(function(s) { return s.ward === "Ward - 5 (Thottapalayam)"; })
        },
        { 
            id: 6, 
            name: "Ward - 6 (Valasaiyur)", 
            streets: streets.filter(function(s) { return s.ward === "Ward - 6 (Valasaiyur)"; })
        },
        { 
            id: 7, 
            name: "Ward - 7 (Ramalingapuram)", 
            streets: streets.filter(function(s) { return s.ward === "Ward - 7 (Ramalingapuram)"; })
        },
        ];
    }, [streets]);

    function handleSearchToggle() {
        setSearchVisible(!searchVisible);
        if (searchVisible) {
        setSearchQuery("");
        }
    }

    function handleFilterApply(selectedWards) {
        setSelectedWardFilters(selectedWards);
        setFilterVisible(false);
        ToastNotification("Filter applied successfully", "success");
    }

    function handleWardSelect(wardName) {
        if (selectedWard === wardName) {
        setSelectedWard(null);
        } else {
        setSelectedWard(wardName);
        }
    }

    function handleAddStreet() {
        if (!selectedWard) {
        ToastNotification("Please select a ward first", "error");
        return;
        }

        const newStreet = {
        id: Date.now(),
        street_name: "New Street (Draft)",
        households: 0,
        ward: selectedWard,
        isDraft: true
        };

        setStreets([...streets, newStreet]);
        ToastNotification("Draft street added to " + selectedWard, "success");
    }

    function handleEditStart(street) {
        setEditingStreet(street.id);
        setEditValue(street.street_name);
    }

    function handleEditSave(streetId) {
        setStreets(streets.map(function(s) {
        return s.id === streetId ? { ...s, street_name: editValue, isDraft: false } : s;
        }));
        setEditingStreet(null);
        setEditValue("");
        ToastNotification("Street updated successfully", "success");
    }

    function handleEditCancel() {
        setEditingStreet(null);
        setEditValue("");
    }

    function handleDeleteConfirm(streetId) {
        setStreets(streets.filter(function(s) { return s.id !== streetId; }));
        setDeleteModal({ visible: false, streetId: null });
        ToastNotification("Street deleted successfully", "success");
    }

    function handleMoveStreet(streetId, newWard) {
        setStreets(streets.map(function(s) {
        return s.id === streetId ? { ...s, ward: newWard } : s;
        }));
        setMoveModal({ visible: false, street: null });
        ToastNotification("Street moved to " + newWard + " successfully", "success");
    }

    const filteredStreets = streets.filter(function(street) {
        const matchesSearch = street.street_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedWardFilters.length === 0 || selectedWardFilters.includes(street.ward);
        return matchesSearch && matchesFilter;
    });

    function renderWardCard(ward) {
        const totalStreets = ward.streets.length;
        const draftStreets = ward.streets.filter(function(s) { return s.isDraft; }).length;
        const regularStreets = totalStreets - draftStreets;

        return (
        <div
            key={ward.id}
            onClick={() => { handleWardSelect(ward.name); }}
            className={`p-4 rounded-medium border-2 cursor-pointer
                        active:scale-[0.99]
                        focus:outline-none focus:ring-1 focus:ring-primary/20 focus:scale-[0.99]
                        transition-all duration-200 ease-in-out
                        ${selectedWard === ward.name 
                        ? "border-primary bg-secondary" 
                        : "border-secondary bg-white"}`}
        >
            <div className="flex items-center justify-between">
            <div>
                <h3 className="text-sm font-bold text-secondaryDark">
                {ward.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-3 py-1 rounded-small bg-background text-secondaryDark border border-secondary">
                    {regularStreets} Street{regularStreets !== 1 ? 's' : ''}
                </span>
                {draftStreets > 0 && (
                    <span className="text-xs px-3 py-1 rounded-small bg-warning/20 text-warning font-bold border border-warning">
                    {draftStreets} Draft{draftStreets !== 1 ? 's' : ''}
                    </span>
                )}
                </div>
            </div>
            <span className="text-xs text-secondaryDark font-bold">
                Total: {totalStreets}
            </span>
            </div>
        </div>
        );
    }

    function renderStreetCard(street) {
        const isEditing = editingStreet === street.id;
        const menuOpen = openMenuId === street.id;

        return (
        <div
            key={street.id}
            className={`bg-white p-4 rounded-medium border border-secondary relative
                    active:scale-[0.99]
                    
                    transition-all duration-200 ease-in-out
                    ${street.isDraft ? "border-warning" : ""}`}
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
                        onClick={function() { handleEditSave(street.id); }}
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
                        {street.street_name}
                    </h3>
                    <p className="text-xs text-secondaryDark mt-1">
                        {street.households} Households
                    </p>
                    <p className="text-xs text-primary font-bold mt-1">
                        {street.ward}
                    </p>
                    {street.isDraft && (
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
                    onClick={function() { setOpenMenuId(menuOpen ? null : street.id); }}
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
                        handleEditStart(street);
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
                        setMoveModal({ visible: true, street: street });
                        setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-secondaryDark hover:bg-secondary
                                flex items-center gap-2
                                hover:scale-[0.99] active:scale-[0.99]
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                                transition-all duration-200 ease-in-out"
                    >
                        <span>↔</span>
                        <span>Move</span>
                    </button>
                    <button
                        onClick={function() {
                        setDeleteModal({ visible: true, streetId: street.id });
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
                    ALL STREETS ({filteredStreets.length})
                    </h2>
                    
                    <div className="flex items-center gap-2">
                    {searchVisible && (
                        <input
                        type="text"
                        placeholder="Search streets..."
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
                                ${selectedWardFilters.length > 0 ? "bg-primary" : "bg-white"}`}
                    >
                        <Filter size={18} isDarkTheme={selectedWardFilters.length > 0} />
                    </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <Pagination
                    data={filteredStreets}
                    itemsPerPage={5}
                    renderItem={renderStreetCard}
                    />
                </div>
                </div>

                <div className="bg-white rounded-large p-6 border border-secondary">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-secondaryDark">
                    TARGET WARDS ({wards.length})
                    </h2>
                    
                    <button
                    onClick={handleAddStreet}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-medium
                            hover:scale-[0.99] active:scale-[0.99]
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                            transition-all duration-200 ease-in-out"
                    >
                    Add Street
                    </button>
                </div>

                <div className="space-y-4">
                    <Pagination
                    data={wards}
                    itemsPerPage={5}
                    renderItem={renderWardCard}
                    />
                </div>
                </div>
            </div>
            </div>

            {filterVisible && (
            <StreetFilterModal
                wards={wards.map(function(w) { return w.name; })}
                selectedWards={selectedWardFilters}
                onClose={function() { setFilterVisible(false); }}
                onApply={handleFilterApply}
            />
            )}

            {deleteModal.visible && (
            <ConfigStreetModal
                title="Delete Street"
                message="Are you sure you want to delete this street? This action cannot be undone."
                onConfirm={function() { handleDeleteConfirm(deleteModal.streetId); }}
                onCancel={function() { setDeleteModal({ visible: false, streetId: null }); }}
            />
            )}

            {moveModal.visible && moveModal.street && (
            <MoveStreetModal
                street={moveModal.street}
                wards={wards}
                onConfirm={handleMoveStreet}
                onCancel={function() { setMoveModal({ visible: false, street: null }); }}
            />
            )}
        </div>
        <ToastContainer/>
        </div>
    );
}

export default ConfigStreet;
