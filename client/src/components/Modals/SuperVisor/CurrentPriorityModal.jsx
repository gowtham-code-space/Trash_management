import React, { useState } from "react";
import { X, Location, Trash, UpArrow, DownArrow } from "../../../assets/icons/icons";

function CurrentPriorityModal({ isOpen, onClose, complaint, isDarkTheme }) {
    const [upvotes, setUpvotes] = useState(complaint?.upvotes || 42);
    const [downvotes, setDownvotes] = useState(complaint?.downvotes || 8);
    const [userVote, setUserVote] = useState(null);

    if (!isOpen || !complaint) return null;

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

    function getRoleColor(role) {
        if (role === "Resident") return "text-primary";
        if (role === "Sanitary Inspector") return "text-primaryLight";
        return "text-secondaryDark";
    }

    function handleUpvote() {
        if (userVote === "up") {
        setUpvotes(upvotes - 1);
        setUserVote(null);
        } else {
        setUpvotes(upvotes + 1);
        if (userVote === "down") {
            setDownvotes(downvotes - 1);
        }
        setUserVote("up");
        }
    }

    function handleDownvote() {
        if (userVote === "down") {
        setDownvotes(downvotes - 1);
        setUserVote(null);
        } else {
        setDownvotes(downvotes + 1);
        if (userVote === "up") {
            setUpvotes(upvotes - 1);
        }
        setUserVote("down");
        }
    }

    return (
        <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        >
        <div
            className="w-full max-w-xl bg-white rounded-veryLarge shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="relative">
            <img
                src={complaint.image}
                alt={complaint.title}
                className="w-full h-64 object-cover"
            />
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
            >
                <X size={20} defaultColor="#145B47" />
            </button>
            <div className={`absolute bottom-4 left-4 ${getPriorityColor(complaint.priority)} px-4 py-2 rounded-medium`}>
                <span className="text-white text-sm font-medium">
                Priority: {getPriorityLabel(complaint.priority)}
                </span>
            </div>
            </div>

            <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                <h2 className="text-xl font-bold text-primary mb-2">
                    {complaint.title}
                </h2>
                <div className="flex items-center gap-2 text-secondaryDark text-sm">
                    <Location size={16} defaultColor="#316F5D" />
                    <span>{complaint.location}</span>
                </div>
                </div>

                <div className="bg-secondary rounded-large p-3 flex items-center gap-4">
                <div className="text-center">
                    <p className="text-xs text-secondaryDark mb-1">Community Vote</p>
                    <div className="flex items-center gap-2">
                    <button
                        onClick={handleUpvote}
                        className={`p-1 rounded-small hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out ${
                        userVote === "up" ? "bg-success" : "bg-white"
                        }`}
                    >
                        <UpArrow 
                        size={16} 
                        defaultColor={userVote === "up" ? "#FFFFFF" : "#145B47"}
                        />
                    </button>
                    <span className="text-sm font-bold text-primary min-w-6 text-center">
                        {upvotes}
                    </span>
                    <button
                        onClick={handleDownvote}
                        className={`p-1 rounded-small hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out ${
                        userVote === "down" ? "bg-error" : "bg-white"
                        }`}
                    >
                        <DownArrow 
                        size={16} 
                        defaultColor={userVote === "down" ? "#FFFFFF" : "#145B47"}
                        />
                    </button>
                    <span className="text-sm font-bold text-secondaryDark min-w-6 text-center">
                        {downvotes}
                    </span>
                    </div>
                </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary rounded-large p-4">
                <p className="text-xs text-secondaryDark mb-1">Reported By</p>
                <p className="text-base font-semibold text-primary">
                    {complaint.author}
                </p>
                <p className={`text-sm ${getRoleColor(complaint.role)} font-medium mt-1`}>
                    {complaint.role}
                </p>
                </div>

                <div className="bg-secondary rounded-large p-4">
                <p className="text-xs text-secondaryDark mb-1">Trash Type</p>
                <div className="flex items-center gap-2">
                    <Trash size={18} defaultColor="#145B47" />
                    <p className="text-base font-semibold text-primary">
                    {complaint.trashType}
                    </p>
                </div>
                </div>
            </div>

            <div className="bg-secondary rounded-large p-4">
                <p className="text-xs text-secondaryDark mb-2">Description</p>
                <p className="text-sm text-secondaryDark leading-relaxed">
                {complaint.description}
                </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-secondary">
                <p className="text-xs text-secondaryDark">
                Reported on {complaint.date}
                </p>
                <button
                onClick={onClose}
                className="bg-primary text-white px-6 py-2 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                Close
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}

export default CurrentPriorityModal;