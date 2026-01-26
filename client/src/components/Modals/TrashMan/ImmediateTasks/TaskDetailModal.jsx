import React from "react";
import { Location } from "../../../../assets/icons/icons";

function TaskDetailModal({ isOpen, onClose, task }) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      <div className="relative bg-white border border-secondary rounded-xl max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="relative h-40 overflow-hidden rounded-t-xl">
          <img
            src={task.image}
            alt={task.type}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <span className={`${task.statusColor} text-white text-xs px-3 py-1.5 rounded-medium font-bold uppercase`}>
              {task.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-primary mb-1">{task.type}</h2>
            <p className="text-sm text-gray-500">Task ID: {task.id}</p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-background rounded-lg">
            <Location size={20} defaultColor="#145B47" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 mb-1">Location</p>
              <p className="text-sm text-secondaryDark font-medium">{task.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs font-semibold text-gray-500 mb-1">Reported At</p>
              <p className="text-sm text-secondaryDark font-medium">{task.createdAt}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-xs font-semibold text-gray-500 mb-1">Resolved At</p>
              <p className="text-sm text-success font-bold">{task.resolvedAt}</p>
            </div>
          </div>

          <div className="p-3 bg-success/5 rounded-lg border border-success/20">
            <p className="text-xs font-semibold text-gray-500 mb-1">Resolved By</p>
            <p className="text-base font-bold text-success">{task.resolvedBy}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;