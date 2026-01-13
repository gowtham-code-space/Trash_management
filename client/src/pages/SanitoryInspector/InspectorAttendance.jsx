import React, { useState } from "react";
import { Search, Check, MapPin, LeftArrow, RightArrow, Calendar } from "../../assets/icons/icons";
import AttendanceConfirmationModal from "../../components/Modals/SuperVisor/AttendanceConfirmationModal";
import CalendarModal from "../../components/Modals/Calendar/CalendarModal";
import Pagination from "../../utils/Pagination";

function InspectorAttendance() {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    supervisor: null,
    action: null
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [supervisors, setSupervisors] = useState([
    {
      id: 1,
      name: "Rajesh Sharma",
      empId: "SUP-201",
      checkInTime: "08:15 AM",
      location: "Ward 4 Office",
      status: "pending"
    },
    {
      id: 2,
      name: "Priya Patel",
      empId: "SUP-205",
      checkInTime: "08:22 AM",
      location: "Ward 3 Office",
      status: "pending"
    },
    {
      id: 3,
      name: "Amit Kumar",
      empId: "SUP-198",
      checkInTime: "08:05 AM",
      location: "Ward 2 Office",
      status: "verified",
      verifiedAt: "08:10 AM"
    },
    {
      id: 4,
      name: "Kavita Singh",
      empId: "SUP-212",
      checkInTime: "----",
      location: "No Location",
      status: "absent"
    },
    {
      id: 5,
      name: "Sunil Verma",
      empId: "SUP-207",
      checkInTime: "08:30 AM",
      location: "Ward 1 Office",
      status: "pending"
    },
    {
      id: 6,
      name: "Anita Gupta",
      empId: "SUP-215",
      checkInTime: "08:18 AM",
      location: "Ward 5 Office",
      status: "verified",
      verifiedAt: "08:25 AM"
    },
    {
      id: 7,
      name: "Manoj Tiwari",
      empId: "SUP-203",
      checkInTime: "08:10 AM",
      location: "Ward 4 Office",
      status: "verified",
      verifiedAt: "08:15 AM"
    },
    {
      id: 8,
      name: "Deepak Yadav",
      empId: "SUP-219",
      checkInTime: "----",
      location: "No Location",
      status: "absent"
    },
    {
      id: 9,
      name: "Rekha Mishra",
      empId: "SUP-208",
      checkInTime: "08:35 AM",
      location: "Ward 3 Office",
      status: "pending"
    },
    {
      id: 10,
      name: "Vijay Malhotra",
      empId: "SUP-216",
      checkInTime: "08:20 AM",
      location: "Ward 2 Office",
      status: "verified",
      verifiedAt: "08:28 AM"
    },
    {
      id: 11,
      name: "Pooja Agarwal",
      empId: "SUP-204",
      checkInTime: "08:12 AM",
      location: "Ward 1 Office",
      status: "verified",
      verifiedAt: "08:18 AM"
    },
    {
      id: 12,
      name: "Ramesh Joshi",
      empId: "SUP-220",
      checkInTime: "----",
      location: "No Location",
      status: "absent"
    },
    {
      id: 13,
      name: "Neha Kapoor",
      empId: "SUP-210",
      checkInTime: "08:40 AM",
      location: "Ward 5 Office",
      status: "pending"
    },
    {
      id: 14,
      name: "Sanjay Dubey",
      empId: "SUP-218",
      checkInTime: "08:25 AM",
      location: "Ward 4 Office",
      status: "verified",
      verifiedAt: "08:32 AM"
    }
  ]);

  const stats = {
    total: supervisors.length,
    verified: supervisors.filter(s => s.status === "verified").length,
    pending: supervisors.filter(s => s.status === "pending").length,
    absent: supervisors.filter(s => s.status === "absent").length
  };

  function handleVerifyClick(supervisor) {
    setConfirmationModal({
      isOpen: true,
      supervisor: supervisor,
      action: "verify"
    });
  }

  function handleRejectClick(supervisor) {
    setConfirmationModal({
      isOpen: true,
      supervisor: supervisor,
      action: "reject"
    });
  }

  function handleConfirmAction() {
    if (confirmationModal.action === "verify") {
      setSupervisors(supervisors.map(s => 
        s.id === confirmationModal.supervisor.id 
          ? { ...s, status: "verified", verifiedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
          : s
      ));
    } else if (confirmationModal.action === "reject") {
      setSupervisors(supervisors.map(s => 
        s.id === confirmationModal.supervisor.id 
          ? { ...s, status: "absent" }
          : s
      ));
    }
    setConfirmationModal({ isOpen: false, supervisor: null, action: null });
  }

  const filteredSupervisors = supervisors
    .filter(s => activeTab === "all" ? true : s.status === activeTab)
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.empId.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination logic for desktop
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredSupervisors.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = Math.min(startIdx + itemsPerPage, filteredSupervisors.length);
  const paginatedSupervisors = filteredSupervisors.slice(startIdx, endIdx);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  function handlePageChange(pageNum) {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  }

  function renderDesktopRow(supervisor) {
    return (
      <tr 
        key={supervisor.id} 
        className={`border-b border-secondary ${
          supervisor.status === "verified" ? "bg-secondary/30" : ""
        }`}
      >
        <td className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {supervisor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-sm font-medium text-secondaryDark">{supervisor.name}</div>
              <div className="text-xs text-secondaryDark">ID: {supervisor.empId}</div>
            </div>
          </div>
        </td>
        <td className="py-4 text-sm text-secondaryDark">{supervisor.checkInTime}</td>
        <td className="py-4">
          <div className="flex items-center gap-1 text-sm text-secondaryDark">
            <MapPin size={14} defaultColor="#316F5D" />
            {supervisor.location}
          </div>
        </td>
        <td className="py-4">
          {supervisor.status === "pending" && (
            <span className="inline-block px-3 py-1 bg-warning/10 text-warning text-xs font-medium rounded-medium">
              Pending Review
            </span>
          )}
          {supervisor.status === "verified" && (
            <span className="inline-block px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-medium">
              Verified
            </span>
          )}
          {supervisor.status === "absent" && (
            <span className="inline-block px-3 py-1 bg-error/10 text-error text-xs font-medium rounded-medium">
              Absent
            </span>
          )}
        </td>
        <td className="py-4">
          <div className="flex items-center gap-2">
            {supervisor.status === "pending" && (
              <>
                <button
                  onClick={() => handleVerifyClick(supervisor)}
                  className="px-4 py-1.5 bg-success text-white text-xs font-medium rounded-medium
                           hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                           transition-all duration-200 ease-in-out"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleRejectClick(supervisor)}
                  className="px-4 py-1.5 bg-error text-white text-xs font-medium rounded-medium
                           hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                           transition-all duration-200 ease-in-out"
                >
                  Reject
                </button>
              </>
            )}
            {supervisor.status === "verified" && (
              <span className="text-xs text-secondaryDark">
                Verified at {supervisor.verifiedAt}
              </span>
            )}
            {supervisor.status === "absent" && (
              <span className="text-xs text-error font-medium">Override</span>
            )}
          </div>
        </td>
      </tr>
    );
  }

  function renderMobileCard(supervisor) {
    return (
      <div key={supervisor.id} className="bg-white p-3 rounded-large border border-secondary">
        <div className="flex gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {supervisor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-secondaryDark truncate">{supervisor.name}</div>
              <div className="text-xs text-secondaryDark">{supervisor.checkInTime} • {supervisor.location}</div>
            </div>
          </div>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-small h-fit ${
            supervisor.status === "pending" ? "bg-warning/10 text-warning" : 
            supervisor.status === "verified" ? "bg-success/10 text-success" : 
            "bg-error/10 text-error"
          }`}>
            {supervisor.status === "pending" ? "Pending" : 
             supervisor.status === "verified" ? "Verified" : "Absent"}
          </span>
        </div>

        {supervisor.status === "pending" && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleVerifyClick(supervisor)}
              className="flex-1 py-2 bg-success text-white text-sm font-medium rounded-medium
                      hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                      transition-all duration-200 ease-in-out"
            >
              Verify
            </button>
            <button
              onClick={() => handleRejectClick(supervisor)}
              className="flex-1 py-2 bg-secondary border border-background text-primaryLight text-sm font-medium rounded-medium
                      hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                      transition-all duration-200 ease-in-out"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-large border border-secondary">
            <div className="text-xs text-secondaryDark mb-1">Total Supervisors</div>
            <div className="text-2xl font-bold text-secondaryDark">{stats.total}</div>
            <div className="text-xs text-secondaryDark mt-1">Registered Supervisors</div>
          </div>

          <div className="bg-white p-4 rounded-large border border-secondary">
            <div className="text-xs text-secondaryDark mb-1">Verified Present</div>
            <div className="text-2xl font-bold text-success">{stats.verified}</div>
            <div className="text-xs text-success mt-1 flex items-center gap-1">
              <Check size={12} />
              {Math.round((stats.verified / stats.total) * 100)}% Verified
            </div>
          </div>

          <div className="bg-white p-4 rounded-large border border-secondary">
            <div className="text-xs text-secondaryDark mb-1">Pending Review</div>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-xs text-warning mt-1">Needs Action</div>
          </div>

          <div className="bg-white p-4 rounded-large border border-secondary">
            <div className="text-xs text-secondaryDark mb-1">Absent</div>
            <div className="text-2xl font-bold text-error">{stats.absent}</div>
            <div className="text-xs text-error mt-1">Not marked present</div>
          </div>
        </div>

        <div className="md:hidden flex gap-3 mb-4">
          <div className="flex-1 bg-white p-3 rounded-large border border-secondary text-center">
            <div className="text-xs text-secondaryDark mb-1">Verified</div>
            <div className="text-xl font-bold text-success">{stats.verified}</div>
          </div>
          <div className="flex-1 bg-white p-3 rounded-large border border-secondary text-center">
            <div className="text-xs text-secondaryDark mb-1">Pending</div>
            <div className="text-xl font-bold text-warning">{stats.pending}</div>
          </div>
        </div>

        <div className="bg-white rounded-large border border-secondary">
          <div className="border-b border-secondary">
            <div className="md:flex md:gap-4 px-4 md:px-6 overflow-x-auto hidden">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "pending"
                    ? "border-primary text-primary"
                    : "border-transparent text-secondaryDark hover:text-primary"
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab("verified")}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "verified"
                    ? "border-primary text-primary"
                    : "border-transparent text-secondaryDark hover:text-primary"
                }`}
              >
                Verified ({stats.verified})
              </button>
              <button
                onClick={() => setActiveTab("absent")}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "absent"
                    ? "border-primary text-primary"
                    : "border-transparent text-secondaryDark hover:text-primary"
                }`}
              >
                Absent ({stats.absent})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "all"
                    ? "border-primary text-primary"
                    : "border-transparent text-secondaryDark hover:text-primary"
                }`}
              >
                All Supervisors
              </button>
            </div>

            <div className="flex gap-2 px-4 overflow-x-auto py-3 md:hidden">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-2 px-3 text-xs font-medium rounded-medium transition-all whitespace-nowrap
                        hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  activeTab === "pending"
                    ? "bg-primary text-white"
                    : "bg-secondary text-secondaryDark"
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab("verified")}
                className={`py-2 px-3 text-xs font-medium rounded-medium transition-all whitespace-nowrap
                        hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  activeTab === "verified"
                    ? "bg-primary text-white"
                    : "bg-secondary text-secondaryDark"
                }`}
              >
                Verified ({stats.verified})
              </button>
              <button
                onClick={() => setActiveTab("absent")}
                className={`py-2 px-3 text-xs font-medium rounded-medium transition-all whitespace-nowrap
                        hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  activeTab === "absent"
                    ? "bg-primary text-white"
                    : "bg-secondary text-secondaryDark"
                }`}
              >
                Absent ({stats.absent})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-2 px-3 text-xs font-medium rounded-medium transition-all whitespace-nowrap
                        hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  activeTab === "all"
                    ? "bg-primary text-white"
                    : "bg-secondary text-secondaryDark"
                }`}
              >
                All Supervisors
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Search size={18} defaultColor="#316F5D" />
                </div>
                <input
                  type="text"
                  placeholder="Search supervisor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary rounded-medium bg-background text-secondaryDark text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primaryLight border border-secondaryDark rounded-medium text-white text-sm font-medium
                          hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                          transition-all duration-200 ease-in-out whitespace-nowrap"
              >
                <Calendar size={18} defaultColor="white" />
                <span className="hidden sm:inline">Pick Date</span>
              </button>
            </div>

            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary text-left">
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Supervisor Name</th>
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Check-in Time</th>
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Geo-Location</th>
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Status</th>
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSupervisors.map(renderDesktopRow)}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredSupervisors.length > 0 && (
                <div className="flex items-center justify-end mt-6 gap-4 border-t border-secondary pt-4">
                  <span className="text-[11px] font-bold text-gray-400">
                    Showing {startIdx + 1}-{endIdx} of {filteredSupervisors.length}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`p-1.5 rounded-lg border border-secondary transition-all ${
                        currentPage === 1 
                          ? 'opacity-20 pointer-events-none' 
                          : 'hover:bg-background active:scale-90 text-primary'
                      }`}
                    >
                      <LeftArrow size={14} />
                    </button>

                    <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg text-xs font-bold shadow-sm">
                      {currentPage}
                    </div>

                    {currentPage < totalPages && (
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-secondary hover:bg-background rounded-lg text-primary text-xs font-bold transition-all"
                      >
                        {currentPage + 1}
                      </button>
                    )}

                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`p-1.5 rounded-lg border border-secondary transition-all ${
                        currentPage === totalPages 
                          ? 'opacity-20 pointer-events-none' 
                          : 'hover:bg-background active:scale-90 text-primary'
                      }`}
                    >
                      <RightArrow size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="md:hidden space-y-3">
              <Pagination
                data={filteredSupervisors}
                itemsPerPage={5}
                renderItem={renderMobileCard}
              />
            </div>
          </div>
        </div>
      </div>

      <AttendanceConfirmationModal
        isOpen={confirmationModal.isOpen}
        worker={confirmationModal.supervisor}
        action={confirmationModal.action}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmationModal({ isOpen: false, supervisor: null, action: null })}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onDateSelect={(date) => setSelectedDate(date)}
        isDarkTheme={false}
      />
    </div>
  );
}

export default InspectorAttendance;
