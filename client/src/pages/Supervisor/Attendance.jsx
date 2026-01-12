import React, { useState } from "react";
import { Search, Check, MapPin, LeftArrow, RightArrow, Calendar } from "../../assets/icons/icons";
import ImageViewerModal from "../../components/Modals/SuperVisor/ImageViewerModal";
import AttendanceConfirmationModal from "../../components/Modals/SuperVisor/AttendanceConfirmationModal";
import CalendarModal from "../../components/Modals/Calendar/CalendarModal";
import Pagination from "../../utils/Pagination";

function Attendance() {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    worker: null,
    action: null
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [workers, setWorkers] = useState([
    {
      id: 1,
      name: "Rahul Kumar",
      empId: "TC-401",
      checkInTime: "06:15 AM",
      location: "Ward 4, Sector B",
      selfieProof: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      status: "pending"
    },
    {
      id: 2,
      name: "Priya Sharma",
      empId: "TC-408",
      checkInTime: "06:22 AM",
      location: "Ward 4, Market Rd",
      selfieProof: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
      status: "pending"
    },
    {
      id: 3,
      name: "Amit Verma",
      empId: "TC-398",
      checkInTime: "06:05 AM",
      location: "Ward 4, North Gate",
      selfieProof: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      status: "verified",
      verifiedAt: "06:10 AM"
    },
    {
      id: 4,
      name: "Karan Singh",
      empId: "TC-412",
      checkInTime: "----",
      location: "No Location",
      selfieProof: null,
      status: "absent"
    },
    {
      id: 5,
      name: "Sunita Devi",
      empId: "TC-405",
      checkInTime: "06:30 AM",
      location: "Ward 3, East Zone",
      selfieProof: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
      status: "pending"
    },
    {
      id: 6,
      name: "Rajesh Gupta",
      empId: "TC-415",
      checkInTime: "06:18 AM",
      location: "Ward 2, South Gate",
      selfieProof: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
      status: "verified",
      verifiedAt: "06:25 AM"
    },
    {
      id: 7,
      name: "Amit Verma",
      empId: "TC-398",
      checkInTime: "06:05 AM",
      location: "Ward 4, North Gate",
      selfieProof: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      status: "verified",
      verifiedAt: "06:10 AM"
    },
    {
      id: 8,
      name: "Karan Singh",
      empId: "TC-412",
      checkInTime: "----",
      location: "No Location",
      selfieProof: null,
      status: "absent"
    },
    {
      id: 9,
      name: "Sunita Devi",
      empId: "TC-405",
      checkInTime: "06:30 AM",
      location: "Ward 3, East Zone",
      selfieProof: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
      status: "pending"
    },
    {
      id: 10,
      name: "Rajesh Gupta",
      empId: "TC-415",
      checkInTime: "06:18 AM",
      location: "Ward 2, South Gate",
      selfieProof: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
      status: "verified",
      verifiedAt: "06:25 AM"
    },
        {
      id: 11,
      name: "Amit Verma",
      empId: "TC-398",
      checkInTime: "06:05 AM",
      location: "Ward 4, North Gate",
      selfieProof: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      status: "verified",
      verifiedAt: "06:10 AM"
    },
    {
      id: 12,
      name: "Karan Singh",
      empId: "TC-412",
      checkInTime: "----",
      location: "No Location",
      selfieProof: null,
      status: "absent"
    },
    {
      id: 13,
      name: "Sunita Devi",
      empId: "TC-405",
      checkInTime: "06:30 AM",
      location: "Ward 3, East Zone",
      selfieProof: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
      status: "pending"
    },
    {
      id: 14,
      name: "Rajesh Gupta",
      empId: "TC-415",
      checkInTime: "06:18 AM",
      location: "Ward 2, South Gate",
      selfieProof: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
      status: "verified",
      verifiedAt: "06:25 AM"
    }

  ]);

  const stats = {
    total: workers.length,
    verified: workers.filter(w => w.status === "verified").length,
    pending: workers.filter(w => w.status === "pending").length,
    absent: workers.filter(w => w.status === "absent").length
  };

  function handleImageClick(imageUrl) {
    setSelectedImage(imageUrl);
  }

  function handleVerifyClick(worker) {
    setConfirmationModal({
      isOpen: true,
      worker: worker,
      action: "verify"
    });
  }

  function handleRejectClick(worker) {
    setConfirmationModal({
      isOpen: true,
      worker: worker,
      action: "reject"
    });
  }

  function handleConfirmAction() {
    if (confirmationModal.action === "verify") {
      setWorkers(workers.map(w => 
        w.id === confirmationModal.worker.id 
          ? { ...w, status: "verified", verifiedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
          : w
      ));
    } else if (confirmationModal.action === "reject") {
      setWorkers(workers.map(w => 
        w.id === confirmationModal.worker.id 
          ? { ...w, status: "absent" }
          : w
      ));
    }
    setConfirmationModal({ isOpen: false, worker: null, action: null });
  }

  const filteredWorkers = workers
    .filter(w => activeTab === "all" ? true : w.status === activeTab)
    .filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.empId.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination logic for desktop
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredWorkers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = Math.min(startIdx + itemsPerPage, filteredWorkers.length);
  const paginatedWorkers = filteredWorkers.slice(startIdx, endIdx);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  function handlePageChange(pageNum) {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  }

  function renderDesktopRow(worker) {
    return (
      <tr 
        key={worker.id} 
        className={`border-b border-secondary ${
          worker.status === "verified" ? "bg-secondary/30" : ""
        }`}
      >
        <td className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {worker.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-sm font-medium text-secondaryDark">{worker.name}</div>
              <div className="text-xs text-secondaryDark">ID: {worker.empId}</div>
            </div>
          </div>
        </td>
        <td className="py-4 text-sm text-secondaryDark">{worker.checkInTime}</td>
        <td className="py-4">
          <div className="flex items-center gap-1 text-sm text-secondaryDark">
            <MapPin size={14} defaultColor="#316F5D" />
            {worker.location}
          </div>
        </td>
        <td className="py-4">
          {worker.selfieProof ? (
            <img
              src={worker.selfieProof}
              alt="Selfie"
              className="w-12 h-12 rounded-medium object-cover cursor-pointer border border-secondary
                       hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
              onClick={() => handleImageClick(worker.selfieProof)}
            />
          ) : (
            <span className="text-xs text-secondaryDark">No Image Uploaded</span>
          )}
        </td>
        <td className="py-4">
          {worker.status === "pending" && (
            <span className="inline-block px-3 py-1 bg-warning/10 text-warning text-xs font-medium rounded-medium">
              Pending Review
            </span>
          )}
          {worker.status === "verified" && (
            <span className="inline-block px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-medium">
              Verified
            </span>
          )}
          {worker.status === "absent" && (
            <span className="inline-block px-3 py-1 bg-error/10 text-error text-xs font-medium rounded-medium">
              Absent
            </span>
          )}
        </td>
        <td className="py-4">
          <div className="flex items-center gap-2">
            {worker.status === "pending" && (
              <>
                <button
                  onClick={() => handleVerifyClick(worker)}
                  className="px-4 py-1.5 bg-success text-white text-xs font-medium rounded-medium
                           hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                           transition-all duration-200 ease-in-out"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleRejectClick(worker)}
                  className="px-4 py-1.5 bg-error text-white text-xs font-medium rounded-medium
                           hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                           transition-all duration-200 ease-in-out"
                >
                  Reject
                </button>
              </>
            )}
            {worker.status === "verified" && (
              <span className="text-xs text-secondaryDark">
                Verified at {worker.verifiedAt}
              </span>
            )}
            {worker.status === "absent" && (
              <span className="text-xs text-error font-medium">Override</span>
            )}
          </div>
        </td>
      </tr>
    );
  }

  function renderMobileCard(worker) {
    return (
      <div key={worker.id} className="bg-white p-3 rounded-large border border-secondary">
        <div className="flex gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {worker.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-secondaryDark truncate">{worker.name}</div>
              <div className="text-xs text-secondaryDark">{worker.checkInTime} • Ward 4</div>
            </div>
          </div>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-small h-fit ${
            worker.status === "pending" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
          }`}>
            {worker.status === "pending" ? "Pending" : "Verified"}
          </span>
        </div>

        <div className="flex gap-2">
          {worker.selfieProof && (
            <img
              src={worker.selfieProof}
              alt="Selfie"
              className="w-20 h-20 object-cover rounded-medium cursor-pointer border border-secondary shrink-0
                        hover:scale-[0.99] active:scale-[0.99] transition-all duration-200 ease-in-out"
              onClick={() => handleImageClick(worker.selfieProof)}
            />
          )}

          {worker.status === "pending" && (
            <div className="flex flex-col gap-2 flex-1">
              <button
                onClick={() => handleVerifyClick(worker)}
                className="w-full py-2 bg-success text-white text-sm font-medium rounded-medium
                        hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                        transition-all duration-200 ease-in-out"
              >
                Verify
              </button>
              <button
                onClick={() => handleRejectClick(worker)}
                className="w-full py-2 bg-white border border-error text-error text-sm font-medium rounded-medium
                        hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                        transition-all duration-200 ease-in-out"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-large border border-secondary">
            <div className="text-xs text-secondaryDark mb-1">Total Staff</div>
            <div className="text-2xl font-bold text-secondaryDark">{stats.total}</div>
            <div className="text-xs text-secondaryDark mt-1">Registered Collectors</div>
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
            <div className="text-xs text-error mt-1">Not uploaded yet</div>
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
                All Staff
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
                All Staff
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
                  placeholder="Search worker..."
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
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Worker Name</th>
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Check-in Time</th>
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Geo-Location</th>
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Selfie Proof</th>
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Status</th>
                      <th className="pb-3 text-xs font-medium text-secondaryDark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedWorkers.map(renderDesktopRow)}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredWorkers.length > 0 && (
                <div className="flex items-center justify-end mt-6 gap-4 border-t border-secondary pt-4">
                  <span className="text-[11px] font-bold text-gray-400">
                    Showing {startIdx + 1}-{endIdx} of {filteredWorkers.length}
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
                data={filteredWorkers}
                itemsPerPage={5}
                renderItem={renderMobileCard}
              />
            </div>
          </div>
        </div>
      </div>

      <ImageViewerModal
        isOpen={selectedImage !== null}
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <AttendanceConfirmationModal
        isOpen={confirmationModal.isOpen}
        worker={confirmationModal.worker}
        action={confirmationModal.action}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmationModal({ isOpen: false, worker: null, action: null })}
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

export default Attendance;