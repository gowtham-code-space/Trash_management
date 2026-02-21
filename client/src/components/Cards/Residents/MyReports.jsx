import React from "react";
import { RightArrow } from "../../../assets/icons/icons";
import { useNavigate } from "react-router-dom";
function MyReports({ report }) {
    const navigate = useNavigate();

    function getStatusStyle(status) {
        if (status === "Pending") return "bg-warning text-black";
        if (status === "Critical") return "bg-error text-white";
        return "bg-success text-white";
    }

    return (
    <div onClick={()=>navigate("/trash-details")} className="hover:cursor-pointer flex items-center justify-between p-3 bg-white border border-secondary rounded-lg mb-2 transition-all hover:border-primaryLight group active:scale-[0.99]">
        <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-md overflow-hidden bg-background border border-secondary shrink-0">
            <img 
            src={report.image} 
            alt="report" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
        </div>

        {/* Info */}
        <div className="flex flex-col">
            <h3 className="text-sm font-bold text-black leading-none">
            {report.title}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
            {report.time} • {report.location}
            </p>
        </div>
        </div>

        {/* Status & Action */}
        <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(report.status)}`}>
            {report.status}
        </span>
        <div className="transition-transform group-hover:translate-x-1">
            <RightArrow size={14} isPressed={false} isDarkTheme={false} />
        </div>
        </div>
    </div>
    );
    }

export default MyReports;