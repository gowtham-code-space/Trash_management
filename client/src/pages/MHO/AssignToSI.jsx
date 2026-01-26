import React, { useState } from "react";
import Pagination from "../../utils/Pagination";
import ToastNotification from "../../components/Notification/ToastNotification";
import {
    Location,
    ZoomIn,
    ZoomOut,
    Search,
} from "../../assets/icons/icons";
import { ToastContainer } from "react-toastify";
import AssignTaskModal from "../../components/Modals/SuperVisor/AssignTaskModal";

const selectedTaskDetails = {
    id: 1,
    title: "Overflowing Bin",
    date: "2026-01-09 04:15 PM",
    author: "Rajesh",
    role: "Resident",
    status: "PENDING",
    priority: 3,
    location: "MG Road, Bangalore",
    trashType: "Mixed Waste",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
    upvotes: 42,
    downvotes: 8
};

const allSI = [
    {
        id: 1,
        name: "Vikram Singh",
        inspectorId: "SI-001",
        role:"Sanitary inspector",
        attendance: 98,
        ratings: 4.9,
        tasksCompleted: 256,
        distance: "0.3 km",
        availability: "Available",
        zone: "Zone A",
        image: " https://i.pravatar.cc/300",
    },
    {
        id: 2,
        name: "Anita Desai",
        inspectorId: "SI-002",
        role:"Sanitary inspector",
        attendance: 96,
        ratings: 4.8,
        tasksCompleted: 234,
        distance: "0.8 km",
        availability: "Available",
        zone: "Zone A",
        image: null,
    },
];

function AssignToSI() {
    const [selectedInspectors, setSelectedInspectors] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);

    // saving for showing in confirmation modal
    const [role ,setRole] = useState("")

    const filteredInspectors = allSI.filter(function (inspector) {
        const matchesSearch = 
        inspector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspector.inspectorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspector.zone.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    function handleInspectorSelect(inspectorId) {
        setSelectedInspectors(function (prev) {
        if (prev.includes(inspectorId)) {
            return prev.filter(function (id) {
            return id !== inspectorId;
            });
        }
        return [...prev, inspectorId];
        });
    }

    function handleAssignTask() {
        if (selectedInspectors.length === 0) {
        ToastNotification("Please select at least one sanitary inspector to assign the task", "error");
        return;
        }
        console.log("Assigning task to sanitary inspectors:", selectedInspectors);
        setShowModal(true);
    }

    function getPriorityColor(level) {
        if (level === 1) return "bg-warning";
        if (level === 2) return "bg-warning";
        return "bg-error";
    }

    function getPriorityLabel(level) {
        if (level === 1) return "Level 1";
        if (level === 2) return "Level 2";
        return "Level 3";
    }

    function getInspectorInitial(name) {
        return name.charAt(0).toUpperCase();
    }

    function renderInspectorCard(inspector) {
        const isSelected = selectedInspectors.includes(inspector.id);
        
        return (
        <div
            key={inspector.id}
            className="bg-white rounded-large border-2 p-4 transition-all duration-200 hover:shadow-md border-secondary"
        >
            <div className="flex items-center gap-3">
            {inspector.image ? (
                <img
                src={inspector.image}
                alt={inspector.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-secondary"
                />
            ) : (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center border-2 border-secondary">
                <span className="text-white text-base font-bold">
                    {getInspectorInitial(inspector.name)}
                </span>
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-secondaryDark truncate">
                {inspector.name} - {inspector.inspectorId}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-secondaryDark">
                    Attendance {inspector.attendance}%
                </span>
                <span className="text-secondaryDark">•</span>
                <span className="text-xs text-secondaryDark">
                    {inspector.distance}
                </span>
                </div>
            </div>

            <button
                onClick={() => { setRole(inspector.role) ; handleInspectorSelect(inspector.id); }}
                className={`px-4 py-1.5 rounded-medium text-xs font-bold transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                isSelected
                    ? 'bg-primaryLight text-white'
                    : 'bg-secondary text-primary'
                }`}
            >
                {isSelected ? 'Selected' : 'Select'}
            </button>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
        <div>
            <div className="mb-6 bg-white border border-secondary rounded-large p-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-medium overflow-hidden shrink-0">
                <img
                    src={selectedTaskDetails.image}
                    alt={selectedTaskDetails.title}
                    className="w-full h-full object-cover"
                />
                </div>

                <div className="flex-1">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <h2 className="text-lg font-bold text-primary">
                    {selectedTaskDetails.title}
                    </h2>
                    <span
                    className={`${getPriorityColor(selectedTaskDetails.priority)} text-white px-3 py-1 rounded-medium text-xs font-medium shrink-0`}
                    >
                    {getPriorityLabel(selectedTaskDetails.priority)}
                    </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                    <div>
                    <span className="text-secondaryDark font-semibold">Location: </span>
                    <span className="text-secondaryDark font-medium">{selectedTaskDetails.location}</span>
                    </div>
                    <div>
                    <span className="text-secondaryDark font-semibold">Type: </span>
                    <span className="text-secondaryDark font-medium">{selectedTaskDetails.trashType}</span>
                    </div>
                    <div>
                    <span className="text-secondaryDark font-semibold">Reported: </span>
                    <span className="text-secondaryDark font-medium">{selectedTaskDetails.date}</span>
                    </div>
                </div>
                </div>
            </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 bg-secondary overflow-hidden min-h-96 lg:h-screen rounded-medium">
                <img
                src="https://tile.openstreetmap.org/14/4824/6156.png"
                alt="Map"
                className="w-full h-full object-cover"
                />

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

            <div className="w-full lg:w-96 bg-white border border-secondary rounded-medium">
                <div className="p-4 sm:p-5 lg:p-6">
                <div className="mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-secondaryDark">Available Sanitary Inspectors</h2>
                    <p className="text-xs sm:text-sm text-secondaryDark mt-1">
                    Select sanitary inspectors for this task
                    </p>
                </div>

                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={16} defaultColor="#316F5D" />
                    </div>
                    <input
                    type="text"
                    placeholder="Search sanitary inspectors..."
                    value={searchQuery}
                    onChange={(e)=>{ setSearchQuery(e.target.value) }}
                    className="w-full bg-background border border-secondary rounded-medium py-2 pl-10 pr-4
                                text-sm text-secondaryDark placeholder:text-secondaryDark
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                transition-all duration-200"
                    />
                </div>

                {filteredInspectors.length > 0 ? (
                    <Pagination
                    data={filteredInspectors}
                    itemsPerPage={5}
                    renderItem={renderInspectorCard}
                    gridDisplay={false}
                    />
                ) : (
                    <div className="text-center py-8">
                    <p className="text-sm text-secondaryDark">No sanitary inspectors found</p>
                    </div>
                )}

                <button
                    onClick={handleAssignTask}
                    className="w-full bg-primary text-white py-3 rounded-large text-sm font-bold hover:bg-primaryLight hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out mt-4"
                >
                    Assign Task {selectedInspectors.length > 0 && `(${selectedInspectors.length} selected)`}
                </button>
                </div>
            </div>
            </div>
        </div>
        {showModal && <AssignTaskModal role={role} onClose={() => {setShowModal(false)} } />}
        <ToastContainer/>
        </div>
    );
}

export default AssignToSI;