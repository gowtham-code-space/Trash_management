import React, { useState } from "react";
import Pagination from "../../utils/Pagination";
import ToastNotification from "../../components/Notification/ToastNotification";
import {
  Location,
  ZoomIn,
  ZoomOut,
  Search,
  Star,
} from "../../assets/icons/icons";
import { ToastContainer } from "react-toastify";
import AssignTaskModal from "../../components/Modals/SuperVisor/AssignTaskModal";

// Static task data (will be replaced with selected task from AllTasks)
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

// Workers data
const allWorkers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    workerId: "W-001",
    attendance: 96,
    ratings: 4.8,
    tasksCompleted: 142,
    distance: "0.5 km",
    availability: "Available",
    zone: "Zone A",
    image: null,
  },
  {
    id: 2,
    name: "Meena R",
    workerId: "W-002",
    attendance: 92,
    ratings: 4.6,
    tasksCompleted: 128,
    distance: "1.2 km",
    availability: "Available",
    zone: "Zone A",
    image: null,
  },
  {
    id: 3,
    name: "Sanjay P",
    workerId: "W-010",
    attendance: 88,
    ratings: 4.5,
    tasksCompleted: 115,
    distance: "2.8 km",
    availability: "Available",
    zone: "Zone B",
    image: null,
  },
  {
    id: 4,
    name: "Priya Sharma",
    workerId: "W-015",
    attendance: 94,
    ratings: 4.7,
    tasksCompleted: 135,
    distance: "3.5 km",
    availability: "Available",
    zone: "Zone B",
    image: null,
  },
  {
    id: 5,
    name: "Arun Kumar",
    workerId: "W-008",
    attendance: 90,
    ratings: 4.4,
    tasksCompleted: 120,
    distance: "4.2 km",
    availability: "Available",
    zone: "Zone C",
    image: null,
  },
  {
    id: 6,
    name: "Divya B",
    workerId: "W-012",
    attendance: 87,
    ratings: 4.3,
    tasksCompleted: 108,
    distance: "5.1 km",
    availability: "Available",
    zone: "Zone C",
    image: null,
  },
];

function AssignToTrashmen() {
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("nearby"); // "nearby" or "all"
  const [showModal, setShowModal] = useState(false);

  // Filter workers based on search
  const filteredWorkers = allWorkers.filter((worker) => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.workerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Nearby workers (top 3)
  const nearbyWorkers = filteredWorkers.slice(0, 3);
  
  // All workers
  const allFilteredWorkers = filteredWorkers;

  function handleWorkerSelect(workerId) {
    setSelectedWorkers(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      }
      return [...prev, workerId];
    });
  }

  function handleAssignTask() {
    if (selectedWorkers.length === 0) {
      ToastNotification("Please select at least one worker to assign the task", "error");
      return;
    }
    console.log("Assigning task to workers:", selectedWorkers);
    setShowModal(true);
    // Add assignment logic here
  }

  function getPriorityColor(level) {
    if (level === 1) return "bg-warning";
    if (level === 2) return "bg-[#FF8C42]";
    return "bg-error";
  }

  function getPriorityLabel(level) {
    if (level === 1) return "Level 1";
    if (level === 2) return "Level 2";
    return "Level 3";
  }

  function getWorkerInitial(name) {
    return name.charAt(0).toUpperCase();
  }

  function renderWorkerCard(worker) {
    const isSelected = selectedWorkers.includes(worker.id);
    
    return (
      <div
        key={worker.id}
        className={`bg-white rounded-large border-2 p-4 transition-all duration-200 hover:shadow-md border-secondary`}
      >
        <div className="flex items-center gap-3">
          {/* Profile Picture */}
          {worker.image ? (
            <img
              src={worker.image}
              alt={worker.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-secondary"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center border-2 border-secondary">
              <span className="text-white text-base font-bold">
                {getWorkerInitial(worker.name)}
              </span>
            </div>
          )}

          {/* Worker Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-secondaryDark truncate">
              {worker.name} - {worker.workerId}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-secondaryDark/60">
                Attendance {worker.attendance}%
              </span>
              <span className="text-secondaryDark/40">•</span>
              <span className="text-xs text-secondaryDark/60">
                {worker.distance}
              </span>
            </div>
          </div>

          {/* Select Button */}
          <button
          onClick={() => handleWorkerSelect(worker.id)}
            className={`hover:cursor-pointer px-4 py-1.5 rounded-medium text-xs font-bold transition-all ${
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
                  <span className="text-secondaryDark/60 font-semibold">Location: </span>
                  <span className="text-secondaryDark font-medium">{selectedTaskDetails.location}</span>
                </div>
                <div>
                  <span className="text-secondaryDark/60 font-semibold">Type: </span>
                  <span className="text-secondaryDark font-medium">{selectedTaskDetails.trashType}</span>
                </div>
                <div>
                  <span className="text-secondaryDark/60 font-semibold">Reported: </span>
                  <span className="text-secondaryDark font-medium">{selectedTaskDetails.date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 bg-secondary overflow-hidden min-h-75 lg:h-screen rounded-medium">
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
              {/* Search Box */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} defaultColor="#316F5D" />
                </div>
                <input
                  type="text"
                  placeholder="Search workers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-secondary rounded-medium py-2 pl-10 pr-4
                            text-sm text-secondaryDark placeholder:text-secondaryDark/60
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                            transition-all duration-200"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("nearby")}
                  className={`flex-1 py-2 px-4 rounded-medium text-sm font-bold transition-all ${
                    activeTab === "nearby"
                      ? "bg-primary text-white"
                      : "bg-secondary text-primary hover:bg-primary/10"
                  }`}
                >
                  Nearby
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 py-2 px-4 rounded-medium text-sm font-bold transition-all ${
                    activeTab === "all"
                      ? "bg-primary text-white"
                      : "bg-secondary text-primary hover:bg-primary/10"
                  }`}
                >
                  All
                </button>
              </div>

              {/* Workers List with Pagination */}
              {activeTab === "nearby" && nearbyWorkers.length > 0 && (
                <Pagination
                  data={nearbyWorkers}
                  itemsPerPage={3}
                  renderItem={renderWorkerCard}
                  gridDisplay={false}
                />
              )}
              {activeTab === "all" && allFilteredWorkers.length > 0 && (
                <Pagination
                  data={allFilteredWorkers}
                  itemsPerPage={5}
                  renderItem={renderWorkerCard}
                  gridDisplay={false}
                />
              )}
              
              {/* No Results */}
              {((activeTab === "nearby" && nearbyWorkers.length === 0) || 
                (activeTab === "all" && allFilteredWorkers.length === 0)) && (
                <div className="text-center py-8">
                  <p className="text-sm text-secondaryDark">No workers found</p>
                </div>
              )}

              {/* Assign Task Button */}
              <button
                onClick={handleAssignTask}
                className="w-full bg-primary text-white py-3 rounded-large text-sm font-bold hover:bg-primaryLight transition-all active:scale-[0.99] mt-4"
              >
                Assign Task {selectedWorkers.length > 0 && `(${selectedWorkers.length} selected)`}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && <AssignTaskModal onClose={() => setShowModal(false)} />}
      <ToastContainer/>
    </div>
  );
}

export default AssignToTrashmen;
