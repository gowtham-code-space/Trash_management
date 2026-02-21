import React, { useState } from "react";
import ToastNotification from "../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import Pagination from "../../../utils/Pagination";
import ResolveConfirmationModal from "../../../components/Modals/TrashMan/ImmediateTasks/ResolveConformationModal";
import TaskHistory from "./TaskHistory";
import {
  Location,
  ZoomIn,
  ZoomOut,
  Check,
} from "../../../assets/icons/icons";

const currentTrashman = { id: 1, name: "Rajesh" };

const immediateTasks = [
  {
    id: "IT001",
    image: "https://picsum.photos/seed/task1/400/300",
    location: "Sector 7, Near Gandhi Park",
    type: "Overflowing Bin",
    status: "PENDING",
    statusColor: "bg-warning",
    assignedTeam: [
      { id: 1, name: "Rajesh", image: null },
      { id: 2, name: "Amit", image: null },
      { id: 3, name: "Suresh", image: null },
    ],
    createdAt: "2026-01-10 08:30 AM",
    resolvedBy: null,
    resolvedAt: null,
  },
  {
    id: "IT002",
    image: "https://picsum.photos/seed/task2/400/300",
    location: "Central Market Area, Shop 45",
    type: "Illegal Dumping",
    status: "PENDING",
    statusColor: "bg-error",
    assignedTeam: [
      { id: 1, name: "Rajesh", image: null },
      { id: 4, name: "Vikram", image: "https://picsum.photos/seed/picsum/200/300" },
    ],
    createdAt: "2026-01-10 09:15 AM",
    resolvedBy: null,
    resolvedAt: null,
  },
  {
    id: "IT003",
    image: "https://picsum.photos/seed/task3/400/300",
    location: "Residential Zone B, Block C",
    type: "Scattered Waste",
    status: "PENDING",
    statusColor: "bg-warning",
    assignedTeam: [
      { id: 5, name: "Anita", image: "https://picsum.photos/seed/picsum/200/300" },
      { id: 6, name: "Priya", image: null },
    ],
    createdAt: "2026-01-10 10:00 AM",
    resolvedBy: null,
    resolvedAt: null,
  },
];


function ImmediateTasks() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToResolve, setTaskToResolve] = useState(null);

  const myTasks = immediateTasks.filter(task =>
    task.assignedTeam.some(member => member.id === currentTrashman.id)
  );

  function getWorkerInitial(name) {
    return name.charAt(0).toUpperCase();
  }

  function handleTaskClick(taskId) {
    setSelectedTask(selectedTask === taskId ? null : taskId);
  }

  function handleResolveClick(task, event) {
    event.stopPropagation();
    setTaskToResolve(task);
    setShowConfirmModal(true);
  }

  function handleConfirmResolve() {
    if (taskToResolve) {
      setShowConfirmModal(false);
      setTaskToResolve(null);
      ToastNotification(`Task ${taskToResolve.id} marked as resolved!`, "success");
    }
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

  function renderTaskCard(task) {
    const isExpanded = selectedTask === task.id;
    
    return (
      <div
        key={task.id}
        className="bg-background rounded-large overflow-hidden border border-secondary hover:shadow-md transition-all duration-200"
      >
        <div
          className="p-3 sm:p-4 cursor-pointer"
          onClick={() => handleTaskClick(task.id)}
          role="button"
          tabIndex={0}
        >
          <div className="mb-3 rounded-medium overflow-hidden">
            <img
              src={task.image}
              alt={task.type}
              className="w-full h-40 object-cover"
            />
          </div>

          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-xs sm:text-sm font-semibold text-secondaryDark mb-1">
                {task.type}
              </h4>
              <div className="flex items-start gap-1 text-xs text-secondaryDark">
                <Location size={14} defaultColor="#4A5568" />
                <p className="flex-1">{task.location}</p>
              </div>
            </div>
            <span
              className={`${task.statusColor} text-white text-xs px-2 sm:px-3 py-1 rounded-medium font-medium whitespace-nowrap`}
            >
              {task.status}
            </span>
          </div>

          <div>
            <p className="text-xs text-secondaryDark mb-2 font-medium">
              Assigned Team
            </p>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {task.assignedTeam.map(function (member, idx) {
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
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <div>
                  <p className="text-xs text-secondaryDark font-semibold mb-1">
                    Task ID
                  </p>
                  <p className="text-xs text-secondaryDark">
                    {task.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondaryDark font-semibold mb-1">
                    Reported At
                  </p>
                  <p className="text-xs text-secondaryDark">
                    {task.createdAt}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <button
            onClick={(e) => handleResolveClick(task, e)}
            className="w-full bg-success text-white py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={18} isPressed={false} isDarkTheme={true} />
            Mark as Resolved
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row mb-6">
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
          </div>

          <div className="mt-2 lg:mt-0 lg:ml-2 rounded-medium w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-secondary">
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="mb-6">
                <h2 className="text-base sm:text-lg font-bold text-secondaryDark">My Immediate Tasks</h2>
                <p className="text-xs sm:text-sm text-secondaryDark mt-1">
                  {myTasks.length} pending {myTasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>

              {myTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-secondaryDark">No immediate tasks assigned</p>
                </div>
              ) : (
                <Pagination 
                  data={myTasks}
                  itemsPerPage={1}
                  renderItem={renderTaskCard}
                />
              )}
            </div>
          </div>
        </div>

        <TaskHistory/>
      </div>

      <ResolveConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmResolve}
        task={taskToResolve}
      />

      <ToastContainer />
    </div>
  );
}

export default ImmediateTasks;