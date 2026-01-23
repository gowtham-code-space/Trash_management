import React, { useState, useMemo } from "react";
import ThemeStore from "../../../../store/ThemeStore";
import { Search, Filter, X, Check, Edit, Trash, More ,TrashVehicle, Mobile} from "../../../../assets/icons/icons";
import AssignTrashMenModal from "../../../../components/Modals/SanitaryInspector/AssignTrashMen/AssignTrashMenModal";
import TrashManFilterModal from "../../../../components/Modals/SanitaryInspector/AssignTrashMen/TrashManFilterModal";
import MoveTrashManModal from "../../../../components/Modals/SanitaryInspector/AssignTrashMen/MoveTrashManModal";
import ToastNotification from "../../../../components/Notification/ToastNotification";
import Pagination from "../../../../utils/Pagination";
import { ToastContainer } from "react-toastify";

function AssignTrashMen() {
    const { isDarkTheme } = ThemeStore();
    
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterVisible, setFilterVisible] = useState(false);
    const [selectedRouteFilters, setSelectedRouteFilters] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ visible: false, trashmanId: null });
    const [editingTrashMan, setEditingTrashMan] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [moveModal, setMoveModal] = useState({ visible: false, trashman: null });

    const [trashmen, setTrashmen] = useState([
        { 
            id: 1, 
            name: "Rajesh Kumar", 
            employee_id: "TM-001", 
            phone: "+91 98765 43210",
            route: "Route A", 
            profile_pic: "https://randomuser.me/api/portraits/men/1.jpg",
            isDraft: false 
        },
        { 
            id: 2, 
            name: "Muthu Selvam", 
            employee_id: "TM-002", 
            phone: "+91 98765 43211",
            route: "Route A", 
            profile_pic: "https://randomuser.me/api/portraits/men/2.jpg",
            isDraft: false 
        },
        { 
            id: 3, 
            name: "Karthik Babu", 
            employee_id: "TM-003", 
            phone: "+91 98765 43212",
            route: "Route B", 
            profile_pic: "https://randomuser.me/api/portraits/men/3.jpg",
            isDraft: false 
        },
        { 
            id: 4, 
            name: "Senthil Nathan", 
            employee_id: "TM-004", 
            phone: "+91 98765 43213",
            route: "Route B", 
            profile_pic: "https://randomuser.me/api/portraits/men/4.jpg",
            isDraft: false 
        },
        { 
            id: 5, 
            name: "Kumar Raja", 
            employee_id: "TM-005", 
            phone: "+91 98765 43214",
            route: "Route C", 
            profile_pic: "https://randomuser.me/api/portraits/men/5.jpg",
            isDraft: false 
        },
        { 
            id: 6, 
            name: "Velu Murugan", 
            employee_id: "TM-006", 
            phone: "+91 98765 43215",
            route: "Route C", 
            profile_pic: "https://randomuser.me/api/portraits/men/6.jpg",
            isDraft: false 
        },
        { 
            id: 7, 
            name: "Prakash Kumar", 
            employee_id: "TM-007", 
            phone: "+91 98765 43216",
            route: "Route D", 
            profile_pic: "https://randomuser.me/api/portraits/men/7.jpg",
            isDraft: false 
        },
        { 
            id: 8, 
            name: "Arumugam", 
            employee_id: "TM-008", 
            phone: "+91 98765 43217",
            route: "Route D", 
            profile_pic: "https://randomuser.me/api/portraits/men/8.jpg",
            isDraft: false 
        },
        { 
            id: 9, 
            name: "Dinesh Vel", 
            employee_id: "TM-009", 
            phone: "+91 98765 43218",
            route: "Route E", 
            profile_pic: "https://randomuser.me/api/portraits/men/9.jpg",
            isDraft: false 
        },
        { 
            id: 10, 
            name: "Saravanan M", 
            employee_id: "TM-010", 
            phone: "+91 98765 43219",
            route: "Route E", 
            profile_pic: "https://randomuser.me/api/portraits/men/10.jpg",
            isDraft: false 
        },
        { 
            id: 11, 
            name: "Ramesh Kannan", 
            employee_id: "TM-011", 
            phone: "+91 98765 43220",
            route: "Route F", 
            profile_pic: "https://randomuser.me/api/portraits/men/11.jpg",
            isDraft: false 
        },
        { 
            id: 12, 
            name: "Ganesan S", 
            employee_id: "TM-012", 
            phone: "+91 98765 43221",
            route: "Route F", 
            profile_pic: "https://randomuser.me/api/portraits/men/12.jpg",
            isDraft: false 
        },
    ]);

    const routes = useMemo(function() {
        return [
        { 
            id: 1, 
            name: "Route A", 
            trashmen: trashmen.filter(function(t) { return t.route === "Route A"; })
        },
        { 
            id: 2, 
            name: "Route B", 
            trashmen: trashmen.filter(function(t) { return t.route === "Route B"; })
        },
        { 
            id: 3, 
            name: "Route C", 
            trashmen: trashmen.filter(function(t) { return t.route === "Route C"; })
        },
        { 
            id: 4, 
            name: "Route D", 
            trashmen: trashmen.filter(function(t) { return t.route === "Route D"; })
        },
        { 
            id: 5, 
            name: "Route E", 
            trashmen: trashmen.filter(function(t) { return t.route === "Route E"; })
        },
        { 
            id: 6, 
            name: "Route F", 
            trashmen: trashmen.filter(function(t) { return t.route === "Route F"; })
        },
        ];
    }, [trashmen]);

    function handleSearchToggle() {
        setSearchVisible(!searchVisible);
        if (searchVisible) {
        setSearchQuery("");
        }
    }

    function handleFilterApply(selectedRoutes) {
        setSelectedRouteFilters(selectedRoutes);
        setFilterVisible(false);
        ToastNotification("Filter applied successfully", "success");
    }

    function handleRouteSelect(routeName) {
        if (selectedRoute === routeName) {
        setSelectedRoute(null);
        } else {
        setSelectedRoute(routeName);
        }
    }

    function handleEditStart(trashman) {
        setEditingTrashMan(trashman.id);
        setEditValue(trashman.name);
    }

    function handleEditSave(trashmanId) {
        setTrashmen(trashmen.map(function(t) {
        return t.id === trashmanId ? { ...t, name: editValue, isDraft: false } : t;
        }));
        setEditingTrashMan(null);
        setEditValue("");
        ToastNotification("Trashman updated successfully", "success");
    }

    function handleEditCancel() {
        setEditingTrashMan(null);
        setEditValue("");
    }

    function handleDeleteConfirm(trashmanId) {
        setTrashmen(trashmen.filter(function(t) { return t.id !== trashmanId; }));
        setDeleteModal({ visible: false, trashmanId: null });
        ToastNotification("Trashman removed successfully", "success");
    }

    function handleMoveTrashMan(trashmanId, newRoute) {
        setTrashmen(trashmen.map(function(t) {
            return t.id === trashmanId ? { ...t, route: newRoute } : t;
        }));
        setMoveModal({ visible: false, trashman: null });
        ToastNotification("Trashman reassigned to " + newRoute + " successfully", "success");
    }

    function handleTrashManClick(trashman, event) {
        event.stopPropagation();
        setMoveModal({ visible: true, trashman: trashman });
    }

    const filteredTrashmen = trashmen.filter(function(trashman) {
        const matchesSearch = trashman.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            trashman.employee_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedRouteFilters.length === 0 || selectedRouteFilters.includes(trashman.route);
        return matchesSearch && matchesFilter;
    });

    function renderTrashManCard(trashman) {
        const isEditing = editingTrashMan === trashman.id;
        const menuOpen = openMenuId === trashman.id;

        return (
        <div
            key={trashman.id}
            className={`bg-white p-4 rounded-medium border border-secondary relative
                    active:scale-[0.99]
                    transition-all duration-200 ease-in-out
                    ${trashman.isDraft ? "border-warning" : ""}`}
        >
            <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
                <div className="relative">
                <img 
                    src={trashman.profile_pic} 
                    alt={trashman.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
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
                        onClick={function() { handleEditSave(trashman.id); }}
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
                        {trashman.name}
                    </h3>
                    <p className="text-xs text-secondaryDark/60 mt-0.5">
                        {trashman.employee_id}
                    </p>
                    <div className="my-1">
                        <div className="flex flex-row items-center mb-1">
                            <Mobile defaultColor="#145B47" isDarkTheme={isDarkTheme} DarkThemeColor="white" size={15}/>
                            <p className="text-xs text-secondaryDark mt-1 mx-2">
                                {trashman.phone}
                            </p>
                        </div>
                        <div className="flex flex-row items-center">
                            <TrashVehicle defaultColor="#145B47" isDarkTheme={isDarkTheme} DarkThemeColor="white" size={15}/>
                            <p className="text-xs text-primary font-bold mt-1 mx-2">
                                {trashman.route}
                            </p>
                        </div>
                    </div>
                    {trashman.isDraft && (
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
                    onClick={function() { setOpenMenuId(menuOpen ? null : trashman.id); }}
                    className="p-1 hover:bg-secondary rounded-medium active:scale-[0.99]
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                            transition-all duration-200 ease-in-out"
                >
                    <More size={18} isDarkTheme={isDarkTheme} />
                </button>

                {menuOpen && (
                    <div className="absolute right-5 top-0 mt-1 bg-white border border-secondary rounded-medium shadow-lg z-10 w-32">
                    <button
                        onClick={function() {
                        handleEditStart(trashman);
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
                        setDeleteModal({ visible: true, trashmanId: trashman.id });
                        setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-error hover:bg-secondary
                                flex items-center gap-2 rounded-b-medium
                                hover:scale-[0.99] active:scale-[0.99]
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                                transition-all duration-200 ease-in-out"
                    >
                        <Trash size={14} defaultColor="#E75A4C" />
                        <span>Remove</span>
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
                    ALL TRASHMEN ({filteredTrashmen.length})
                    </h2>
                    
                    <div className="flex items-center gap-2">
                    {searchVisible && (
                        <input
                        type="text"
                        placeholder="Search trashmen..."
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
                                ${selectedRouteFilters.length > 0 ? "bg-primary" : "bg-white"}`}
                    >
                        <Filter size={18} isDarkTheme={selectedRouteFilters.length > 0} />
                    </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <Pagination
                    data={filteredTrashmen}
                    itemsPerPage={5}
                    renderItem={renderTrashManCard}
                    />
                </div>
                </div>

                <div className="bg-white rounded-large p-6 border border-secondary">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-secondaryDark">
                    ROUTE ASSIGNMENTS ({routes.length})
                    </h2>
                </div>

                <div className="space-y-4">
                    {routes.map(function(route) {
                    return (
                        <div
                        key={route.id}
                        onClick={function() { handleRouteSelect(route.name); }}
                        className={`p-4 rounded-medium border-2 cursor-pointer
                                hover:scale-[0.99] active:scale-[0.99]
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                                transition-all duration-200 ease-in-out
                                ${selectedRoute === route.name 
                                    ? "border-primary bg-secondary" 
                                    : "border-secondary bg-white"}`}
                        >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-secondaryDark">
                            {route.name}
                            </h3>
                            <span className="text-xs text-secondaryDark">
                            {route.trashmen.length} Trashm{route.trashmen.length !== 1 ? 'en' : 'an'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {route.trashmen.map(function(trashman) {
                            return (
                                <button
                                key={trashman.id}
                                onClick={function(e) { handleTrashManClick(trashman, e); }}
                                className={`p-2 text-xs rounded-small border border-secondary
                                        hover:scale-[0.99] active:scale-[0.99]
                                        focus:outline-none focus:ring-2 focus:ring-primary/20
                                        transition-all duration-200 ease-in-out
                                        ${trashman.isDraft 
                                            ? "bg-warning/20 text-warning font-bold hover:bg-warning/30" 
                                            : "bg-background text-secondaryDark hover:bg-secondary"}`}
                                >
                                <div className="flex items-center gap-2">
                                    <img 
                                    src={trashman.profile_pic} 
                                    alt={trashman.name}
                                    className="w-6 h-6 rounded-full object-cover border border-primary"
                                    />
                                    <div className="text-left flex-1 min-w-0">
                                    <p className="font-bold truncate">{trashman.name}</p>
                                    <p className="text-[10px] text-secondaryDark/60">{trashman.employee_id}</p>
                                    </div>
                                </div>
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
            <TrashManFilterModal
                routes={routes.map(function(r) { return r.name; })}
                selectedRoutes={selectedRouteFilters}
                onClose={function() { setFilterVisible(false); }}
                onApply={handleFilterApply}
            />
            )}

            {deleteModal.visible && (
            <AssignTrashMenModal
                title="Remove Trashman"
                message="Are you sure you want to remove this trashman from the system? This action cannot be undone."
                onConfirm={function() { handleDeleteConfirm(deleteModal.trashmanId); }}
                onCancel={function() { setDeleteModal({ visible: false, trashmanId: null }); }}
            />
            )}

            {moveModal.visible && moveModal.trashman && (
            <MoveTrashManModal
                trashman={moveModal.trashman}
                routes={routes}
                onConfirm={handleMoveTrashMan}
                onCancel={function() { setMoveModal({ visible: false, trashman: null }); }}
            />
            )}
        </div>
        <ToastContainer/>
        </div>
    );
}

export default AssignTrashMen;
