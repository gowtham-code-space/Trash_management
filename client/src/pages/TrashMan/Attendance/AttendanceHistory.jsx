import React, { useState } from "react";
import Pagination from "../../../utils/Pagination";

function AttendanceHistory({ isDarkTheme }) {
    const [filterStatus, setFilterStatus] = useState("all");
    // Mock attendance history data for individual worker
    const attendanceHistory = [
        {
            id: 1,
            status: "approved",
            date: "Jan 09, 2026",
            time: "06:45 AM",
            location: "Route A, Sector 12"
        },
        {
            id: 2,
            status: "pending",
            date: "Jan 08, 2026",
            time: "06:30 AM",
            location: "Route B, Sector 8"
        },
        {
            id: 3,
            status: "approved",
            date: "Jan 07, 2026",
            time: "06:55 AM",
            location: "Route C, Sector 15"
        },
        {
            id: 4,
            status: "pending",
            date: "Jan 06, 2026",
            time: "06:25 AM",
            location: "Route A, Sector 10"
        },
        {
            id: 5,
            status: "approved",
            date: "Jan 05, 2026",
            time: "06:40 AM",
            location: "Route D, Sector 5"
        },
        {
            id: 6,
            status: "approved",
            date: "Jan 04, 2026",
            time: "06:50 AM",
            location: "Route B, Sector 7"
        },
        {
            id: 7,
            status: "pending",
            date: "Jan 03, 2026",
            time: "06:35 AM",
            location: "Route C, Sector 14"
        },
        {
            id: 8,
            status: "approved",
            date: "Jan 02, 2026",
            time: "06:48 AM",
            location: "Route A, Sector 11 hjkkhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh"
        }
    ];

    // Worker info (same for all records)
    const workerInfo = {
        name: "Alex Rivera",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
    };

    // Filter logic (only by status)
    const filteredData = attendanceHistory.filter(record => {
        return filterStatus === "all" || record.status === filterStatus;
    });

    const stats = {
        total: attendanceHistory.length,
        approved: attendanceHistory.filter(r => r.status === "approved").length,
        pending: attendanceHistory.filter(r => r.status === "pending").length
    };

    function getStatusBadge(status) {
        if (status === "approved") {
            return (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-bold text-success uppercase tracking-tight">Approved</span>
                </div>
            );
        }
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 border border-warning/20">
                <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                <span className="text-xs font-bold text-warning uppercase tracking-tight">Pending</span>
            </div>
        );
    }

    function renderAttendanceItem(record) {
        return (
            <div
                key={record.id}
                className="group bg-white border border-secondary/50 rounded-large p-5 hover:shadow-lg hover:border-primary/30"
            >
                <div className="flex items-start gap-4">
                    {/* Worker Image with Status Indicator */}
                    <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-large overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                            <img
                                src={workerInfo.image}
                                alt={workerInfo.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${record.status === "approved" ? "bg-success" : "bg-warning"} shadow-sm`} />
                    </div>

                    {/* Attendance Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 font-medium flex items-center gap-1 overflow-hidden">
                                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="truncate" title={record.location}>{record.location}</span>
                                </p>
                            </div>
                            <div className="shrink-0">
                                {getStatusBadge(record.status)}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-semibold">{record.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">{record.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters */}
            <div className="bg-white border border-secondary/50 rounded-large p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filter by Status</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-4 py-2.5 rounded-large text-xs font-bold uppercase tracking-tight transition-all duration-200 ${
                                filterStatus === "all"
                                    ? "bg-primary text-white shadow-md"
                                    : "bg-background text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus("approved")}
                            className={`px-4 py-2.5 rounded-large text-xs font-bold uppercase tracking-tight transition-all duration-200 ${
                                filterStatus === "approved"
                                    ? "bg-success text-white shadow-md"
                                    : "bg-background text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setFilterStatus("pending")}
                            className={`px-4 py-2.5 rounded-large text-xs font-bold uppercase tracking-tight transition-all duration-200 ${
                                filterStatus === "pending"
                                    ? "bg-warning text-white shadow-md"
                                    : "bg-background text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Pending
                        </button>
                    </div>
                </div>
            </div>

            {/* Records List */}
            <div className="bg-white border border-secondary/50 rounded-veryLarge p-5 shadow-sm">
                {filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-bold text-gray-600">No records found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filter</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-secondary/30">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
                            </p>
                        </div>
                        <Pagination 
                            data={filteredData}
                            itemsPerPage={4}
                            renderItem={renderAttendanceItem}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default AttendanceHistory;