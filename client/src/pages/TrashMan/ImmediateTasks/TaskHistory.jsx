import React, { useState } from "react";
import Pagination from "../../../utils/Pagination";
import TaskDetailModal from "../../../components/Modals/TrashMan/ImmediateTasks/TaskDetailModal";

const taskHistory = [
    {
        id: "IT004",
        image: "https://picsum.photos/seed/task4/400/300",
        location: "Main Street, Near Temple",
        type: "Overflowing Bin",
        status: "RESOLVED",
        assignedTeam: [
        { id: 1, name: "Rajesh", image: null },
        { id: 2, name: "Amit", image: "https://picsum.photos/seed/task4/400/300" },
        ],
        createdAt: "2026-01-09 02:30 PM",
        resolvedBy: "Rajesh",
        resolvedAt: "2026-01-09 04:15 PM",
    },
    {
        id: "IT005",
        image: "https://picsum.photos/seed/task5/400/300",
        location: "Park Avenue, Gate 2",
        type: "Illegal Dumping",
        status: "RESOLVED",
        assignedTeam: [
        { id: 1, name: "Rajesh", image: null },
        { id: 3, name: "Suresh", image: null },
        ],
        createdAt: "2026-01-08 11:00 AM",
        resolvedBy: "Suresh",
        resolvedAt: "2026-01-08 03:30 PM",
    },
    {
        id: "IT006",
        image: "https://picsum.photos/seed/task6/400/300",
        location: "Park Avenue, Gate 2",
        type: "Illegal Dumping",
        status: "RESOLVED",
        assignedTeam: [
        { id: 1, name: "Rajesh", image: null },
        { id: 3, name: "Suresh", image: null },
        ],
        createdAt: "2026-01-08 11:00 AM",
        resolvedBy: "Suresh",
        resolvedAt: "2026-01-08 03:30 PM",
    },
    {
        id: "IT007",
        image: "https://picsum.photos/seed/task7/400/300",
        location: "Park Avenue, Gate 2",
        type: "Illegal Dumping",
        status: "RESOLVED",
        assignedTeam: [
        { id: 1, name: "Rajesh", image: null },
        { id: 3, name: "Suresh", image: null },
        ],
        createdAt: "2026-01-08 11:00 AM",
        resolvedBy: "Suresh",
        resolvedAt: "2026-01-08 03:30 PM",
    },
    {
        id: "IT008",
        image: "https://picsum.photos/seed/task8/400/300",
        location: "Park Avenue, Gate 2",
        type: "Illegal Dumping",
        status: "RESOLVED",
        assignedTeam: [
        { id: 1, name: "Rajesh", image: null },
        { id: 3, name: "Suresh", image: null },
        ],
        createdAt: "2026-01-08 11:00 AM",
        resolvedBy: "Suresh",
        resolvedAt: "2026-01-08 03:30 PM",
    },
];

function TaskHistory() {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [taskDetail, setTaskDetail] = useState(null);

    function getStatusBadge(status) {
        if (status === "RESOLVED") {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-xs font-bold text-success uppercase tracking-tight">Resolved</span>
            </div>
        );
        }
        return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 border border-warning/20">
            <div className="w-1.5 h-1.5 rounded-full bg-warning" />
            <span className="text-xs font-bold text-warning uppercase tracking-tight">Pending</span>
        </div>
        );
    }

    function handleHistoryCardClick(task) {
        setTaskDetail(task);
        setShowDetailModal(true);
    }

    function renderHistoryCard(task) {
        return (
        <div
            key={task.id}
            onClick={() => handleHistoryCardClick(task)}
            className="group bg-white border border-secondary/50 rounded-large p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-center gap-3">
            <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                <img
                    src={task.image}
                    alt={task.type}
                    className="w-full h-full"
                />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-success shadow-sm" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-bold text-secondaryDark truncate">
                    {task.type}
                </h4>
                {getStatusBadge(task.status)}
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                <span className="font-medium">{task.resolvedAt}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="font-medium">by <span className="text-success font-semibold">{task.resolvedBy}</span></span>
                </div>
            </div>
            </div>
        </div>
        );
    }

    return (
        <div className="bg-white border border-secondary/50 rounded-veryLarge p-5 shadow-sm">
        {taskHistory.length === 0 ? (
            <div className="text-center py-12">
            <p className="text-sm font-bold text-gray-600">No task history</p>
            <p className="text-xs text-gray-400 mt-1">Resolved tasks will appear here</p>
            </div>
        ) : (
            <div className="space-y-1">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-secondary/30">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Showing {taskHistory.length} {taskHistory.length === 1 ? 'record' : 'records'}
                </p>
            </div>
            <Pagination 
                data={taskHistory}
                itemsPerPage={4}
                renderItem={renderHistoryCard}
            />
            </div>
        )}

        <TaskDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            task={taskDetail}
        />
        </div>
    );
}

export default TaskHistory;