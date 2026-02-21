import React from "react";
import ThemeStore from "../../store/ThemeStore";
import { Check, X, Location, People, Task } from "../../assets/icons/icons";

// Mock Data
const complaintData = {
    id: "#CMP-2024-892",
    title: "Waste Overflow at Main Street",
    description: "Large amount of waste overflowing from the collection bin near the community center. This has been ongoing for 3 days and is causing health concerns.",
    type: "Waste Overflow",
    priority: "High",
    status: "Escalated",
    location: "Main Street, Block A",
    submittedDate: "12 Aug 2024, 9:30 AM",

    workflow: [
        {
        role: "Resident (You)",
        status: "completed",
        name: "John Doe",
        timestamp: "12 Aug, 9:30 AM",
        action: "Submitted complaint",
        },
        {
        role: "Supervisor",
        status: "completed",
        name: "Sarah Johnson",
        timestamp: "12 Aug, 11:10 AM",
        action: "Verified and reviewed",
        },
        {
        role: "Trash Collector",
        status: "failed",
        name: "Not Assigned",
        timestamp: "12 Aug, 3:45 PM",
        action: "Task not assigned to trash collector",
        },
        {
        role: "Sanitary Inspector",
        status: "completed",
        name: "Michael Chen",
        timestamp: "13 Aug, 10:00 AM",
        action: "Escalated due to severity",
        },
        {
        role: "Municipal Health Officer",
        status: "pending",
        name: "Dr. Patricia Williams",
        timestamp: null,
        action: "Awaiting review and action",
        },
    ],
};

function ComplaintDetails() {
    const { isDarkTheme } = ThemeStore();

    function getStatusColor(status) {
        switch (status) {
        case "completed":
            return "#1E8E54";
        case "pending":
            return "#F2C94C";
        case "failed":
            return "#E75A4C";
        default:
            return "#316F5D";
        }
    }

    function getPriorityColor(priority) {
        switch (priority) {
        case "High":
            return "#E75A4C";
        case "Medium":
            return "#F2C94C";
        case "Low":
            return "#1E8E54";
        default:
            return "#316F5D";
        }
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-secondary p-6 rounded-large border border-secondary">
                <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-xl font-bold text-secondaryDark">
                        {complaintData.title}
                    </h1>
                    <span
                        className="px-3 py-1 text-xs font-medium rounded-medium text-white"
                        style={{ backgroundColor: getPriorityColor(complaintData.priority) }}
                    >
                        {complaintData.priority} Priority
                    </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-secondaryDark mb-3">
                    <span className="font-medium">{complaintData.id}</span>
                    <span>•</span>
                    <span>{complaintData.type}</span>
                    <span>•</span>
                    <span>{complaintData.submittedDate}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-secondaryDark">
                    <Location size={16} defaultColor="#316F5D" />
                    <span>{complaintData.location}</span>
                    </div>
                </div>
                
                <button className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-medium hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20">
                    Download Report
                </button>
                </div>
                
                <div className="pt-6 border-t border-secondary">
                <h3 className="text-sm font-semibold text-secondaryDark mb-2">
                    Description
                </h3>
                <p className="text-sm text-secondaryDark/80 leading-relaxed">
                    {complaintData.description}
                </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Workflow Timeline */}
                <div className="lg:col-span-2 bg-secondary p-6 rounded-large border border-secondary">
                <h2 className="text-base font-semibold text-secondaryDark mb-6">
                    Complaint Workflow
                </h2>
                
                <div className="relative">
                    {complaintData.workflow.map(function(step, index) {
                    const isLast = index === complaintData.workflow.length - 1;
                    const statusColor = getStatusColor(step.status);
                    
                    return (
                        <div key={index} className="relative">
                        <div className="flex gap-4">
                            {/* Timeline Column */}
                            <div className="flex flex-col items-center" style={{ width: "48px" }}>
                            {/* Icon Circle */}
                            <div
                                className="w-12 h-12 rounded-large flex items-center justify-center  relative z-10"
                                style={{ backgroundColor: statusColor }}
                            >
                                {step.status === "completed" && (
                                <Check size={20} defaultColor="#FFFFFF" />
                                )}
                                {step.status === "pending" && (
                                <div className="w-3 h-3 rounded-full border-2 border-white" />
                                )}
                                {step.status === "failed" && (
                                <X size={20} defaultColor="#FFFFFF" />
                                )}
                            </div>
                            
                            {/* Connecting Line */}
                            {!isLast && (
                                <div
                                style={{
                                    width: "2px",
                                    backgroundColor: "#145B47",
                                    height: "100%",
                                    minHeight: "80px",
                                    marginTop: "4px",
                                    marginBottom: "4px"
                                }}
                                />
                            )}
                            </div>
                            
                            {/* Content Card */}
                            <div className="flex-1 pb-6">
                            <div className="bg-background p-5 rounded-large border border-secondary">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <People size={18} defaultColor="#145B47" />
                                    <h3 className="text-base font-semibold text-secondaryDark">
                                    {step.role}
                                    </h3>
                                </div>
                                
                                {step.timestamp && (
                                    <span className="text-xs text-secondaryDark/70 font-medium">
                                    {step.timestamp}
                                    </span>
                                )}
                                </div>
                                
                                <p className="text-sm font-medium text-secondaryDark mb-1">
                                {step.name}
                                </p>
                                
                                <p className="text-sm text-secondaryDark/70">
                                {step.action}
                                </p>
                            </div>
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-medium border border-primary/20">
                    <div className="flex items-start gap-3">
                    <Task size={16} defaultColor="#145B47" />
                    <p className="text-xs text-secondaryDark leading-relaxed">
                        <span className="font-semibold">Escalation Flow:</span> Resident → Supervisor → Trash Collector (if assigned) → Sanitary Inspector (auto-escalated if unresolved) → Municipal Health Officer (auto-escalated if unresolved)
                    </p>
                    </div>
                </div>
                </div>
                
                {/* Right Sidebar */}
                <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-secondary p-6 rounded-large border border-secondary">
                    <h2 className="text-base font-semibold text-secondaryDark mb-5">
                    Current Status
                    </h2>
                    
                    <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-secondary">
                        <span className="text-sm text-secondaryDark">Status</span>
                        <span
                        className="px-3 py-1.5 text-xs font-medium rounded-medium text-white"
                        style={{ backgroundColor: "#F2C94C" }}
                        >
                        {complaintData.status}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between pb-4 border-b border-secondary">
                        <span className="text-sm text-secondaryDark">Priority</span>
                        <span
                        className="px-3 py-1.5 text-xs font-medium rounded-medium text-white"
                        style={{ backgroundColor: getPriorityColor(complaintData.priority) }}
                        >
                        {complaintData.priority}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between pb-4 border-b border-secondary">
                        <span className="text-sm text-secondaryDark">Submitted</span>
                        <span className="text-sm font-medium text-secondaryDark">
                            {complaintData?.submittedDate}
                        </span>
                    </div>
                    
                    </div>
                </div>
                
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default ComplaintDetails;