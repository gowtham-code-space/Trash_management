import React from "react";
import { Star, RightArrow } from "../../../assets/icons/icons";
import { useNavigate } from "react-router-dom";
function WorkerInfoCard({ worker, isDarkTheme }) {
  const navigate = useNavigate();

  function getAttendanceColor(attendance) {
    if (attendance >= 95) return "bg-success";
    if (attendance >= 85) return "bg-warning";
    return "bg-error";
  }
  function HandleWorkerDetails(role){
    if(role === "TrashMan")
      navigate("/trashman-stats")

    else if(role === "Supervisor")
      navigate("/supervisor-stats")

    else if(role === "SI")
      navigate("/inspector-stats")
  }
  
  return (
    <div
      className={`group relative bg-white border border-secondary rounded-large p-6 shadow-sm
                  hover:border-primaryLight hover:shadow-md transition-all duration-200 cursor-pointer
                  active:scale-[0.99] ${
                    isDarkTheme ? "dark" : ""
                  }`}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg--to-b from-primary via-primaryLight to-primary rounded-l-large opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          {worker.profile_pic ? (
            <img
              src={worker.profile_pic}
              alt={worker.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-secondary transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center border-2 border-secondary group-hover:border-primaryLight transition-all duration-200">
              <span className="text-white text-base font-bold">
                {worker.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Status dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-white"></div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-black leading-tight truncate">
            {worker.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-secondary text-primary text-[10px] font-bold uppercase tracking-wider rounded">
              {worker.role}
            </span>
            <div className="flex items-center gap-1">
              <Star size={12} defaultColor="#F2C94C" isDarkTheme={isDarkTheme} />
              <span className="text-[11px] font-bold text-secondaryDark">
                {worker.ratings.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 my-5">
        {/* Attendance */}
        <div className="bg-background rounded-medium p-2 border border-secondary/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-secondaryDark/60 uppercase tracking-wide">Attendance</span>
            <span className={`text-xs font-bold ${worker.attendance >= 95 ? 'text-success' : worker.attendance >= 85 ? 'text-warning' : 'text-error'}`}>
              {worker.attendance}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getAttendanceColor(worker.attendance)}`}
              style={{ width: `${worker.attendance}%` }}
            ></div>
          </div>
        </div>
        
        {/* Tasks */}
        <div className="bg-background rounded-medium p-2 border border-secondary/50">
          <span className="text-[10px] font-bold text-secondaryDark/60 uppercase tracking-wide block mb-1">Tasks Done</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary leading-none">{worker.tasksCompleted}</span>
            <span className="text-[10px] text-secondaryDark/60">total</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => HandleWorkerDetails(worker?.role)}
        className="w-full bg-primary hover:bg-primaryLight text-white text-xs font-bold py-2.5 rounded-medium
                    flex items-center justify-center gap-2
                    transition-all duration-200 hover:scale-[0.99] active:scale-[0.99]
                    focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
      >
        View Full Profile
        <div className="transition-transform group-hover:translate-x-1">
          <RightArrow size={12} isPressed={false} isDarkTheme={true} />
        </div>
      </button>
    </div>
  );
}

export default WorkerInfoCard;