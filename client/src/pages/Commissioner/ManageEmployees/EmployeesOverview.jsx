import React, { useState } from "react";
import ThemeStore from "../../../store/ThemeStore";
import { Search, ZoomIn, DownArrow } from "../../../assets/icons/icons";
import EmployeeCard from "../../../components/Cards/Commissioner/EmployeeCard";
import ManageEmployee from "./HireEmployees";
import TransferEmployeeModal from "../../../components/Modals/Commissioner/TransferEmployeeModal";
import Pagination from "../../../utils/Pagination";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EmployeesOverview() {
  const { isDarkTheme } = ThemeStore();
  const [activeTab, setActiveTab] = useState("All Officials");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("All Zones");
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [showManageEmployee, setShowManageEmployee] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [manageMode, setManageMode] = useState("hire");

  const tabs = ["All Officials", "MHOs", "Sanitary Inspectors", "Supervisors", "Trash Collectors"];
  const zones = ["All Zones", "North Zone", "South Zone", "East Zone", "West Zone"];
  const divisions = ["All Divisions", "Division 1 (North)", "Division 2 (South)", "Division 3 (East)", "Division 4 (West)"];
  const statuses = ["All Status", "Active", "Resigned", "Suspended"];

  const mockEmployees = [
    {
      id: "MHO-NZ-01",
      first_name: "Dr. Priya",
      last_name: "Rajan",
      profile_pic: "https://randomuser.me/api/portraits/women/1.jpg",
      role: "Municipal Health Officer",
      zone: "North Zone",
      division: "",
      joined: "Aug 2021",
      status: "Active",
      phone: "9876543210",
      email: "priya.rajan@waste.gov"
    },
    {
      id: "SI-NZ-04",
      first_name: "Rajesh",
      last_name: "Kumar",
      profile_pic: "https://randomuser.me/api/portraits/men/2.jpg",
      role: "Sanitary Inspector",
      zone: "North Zone",
      division: "Division 4 (North)",
      joined: "Jan 2023",
      status: "Active",
      phone: "9876543211",
      email: "rajesh.kumar@waste.gov"
    },
    {
      id: "SUP-EZ-12",
      first_name: "Anitha",
      last_name: "S.",
      profile_pic: "https://randomuser.me/api/portraits/women/3.jpg",
      role: "Supervisor",
      zone: "East Zone",
      division: "Ward 12, 13 (East)",
      joined: "Mar 2022",
      status: "On Leave",
      phone: "9876543212",
      email: "anitha.s@waste.gov"
    },
    {
      id: "COL-SZ-88",
      first_name: "Muthu",
      last_name: "Vel",
      profile_pic: "https://randomuser.me/api/portraits/men/4.jpg",
      role: "Trash Collector",
      zone: "South Zone",
      division: "Route 8 (South)",
      joined: "Feb 2024",
      status: "Active",
      phone: "9876543213",
      email: "muthu.vel@waste.gov"
    },
    {
      id: "COL-WZ-21",
      first_name: "Lakshmi",
      last_name: "P.",
      profile_pic: "https://randomuser.me/api/portraits/women/5.jpg",
      role: "Trash Collector",
      zone: "West Zone",
      division: "Route 2 (West)",
      joined: "Nov 2020",
      status: "Suspended",
      phone: "9876543214",
      email: "lakshmi.p@waste.gov"
    },
    {
      id: "SUP-NZ-09",
      first_name: "David",
      last_name: "John",
      profile_pic: "https://randomuser.me/api/portraits/men/6.jpg",
      role: "Supervisor",
      zone: "North Zone",
      division: "Ward 3, 4 (North)",
      joined: "Jun 2019",
      status: "Active",
      phone: "9876543215",
      email: "david.john@waste.gov"
    }
  ];

  function filterEmployees() {
    return mockEmployees.filter(function(emp) {
      const matchesSearch = emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All Officials" || 
                        (activeTab === "MHOs" && emp.role === "Municipal Health Officer") ||
                        (activeTab === "Sanitary Inspectors" && emp.role === "Sanitary Inspector") ||
                        (activeTab === "Supervisors" && emp.role === "Supervisor") ||
                        (activeTab === "Trash Collectors" && emp.role === "Trash Collector");
      const matchesZone = selectedZone === "All Zones" || emp.zone === selectedZone;
      const matchesDivision = selectedDivision === "All Divisions" || emp.division.includes(selectedDivision);
      const matchesStatus = selectedStatus === "All Status" || emp.status === selectedStatus;

      return matchesSearch && matchesTab && matchesZone && matchesDivision && matchesStatus;
    });
  }

  function handleViewDetails(employee) {
    setSelectedEmployee(employee);
    setManageMode("edit");
    setShowManageEmployee(true);
  }

  function handleEdit(employee) {
    setSelectedEmployee(employee);
    setManageMode("edit");
    setShowManageEmployee(true);
  }

  function handleTransfer(employee) {
    setSelectedEmployee(employee);
    setShowTransferModal(true);
  }

  function handleHireEmployee() {
    setSelectedEmployee(null);
    setManageMode("hire");
    setShowManageEmployee(true);
  }

  const filteredEmployees = filterEmployees();

  if (showManageEmployee) {
    return (
      <ManageEmployee 
        employee={selectedEmployee}
        onClose={() => setShowManageEmployee(false)}
        isDarkTheme={isDarkTheme}
        mode={manageMode}
      />
    );
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <ToastContainer />
        <div className="sticky -top-8 -mt-8 mb-5 z-20 bg-background rounded-medium">
          <div className="flex flex-col gap-3 pt-5 pb-1">
            {/* Search bar and Hire button - same row */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="w-full pl-10 pr-4 py-2 md:py-3 bg-white border border-secondary rounded-large text-xs md:text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                />
                <div className="absolute left-3 top-2 md:top-3">
                  <Search size={18} isDarkTheme={isDarkTheme} />
                </div>
              </div>

              <button
                onClick={handleHireEmployee}
                className="flex items-center gap-1 md:gap-2 bg-primary text-white px-3 md:px-4 py-2 md:py-3 rounded-large text-xs md:text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out whitespace-nowrap"
              >
                <ZoomIn size={16} isDarkTheme={true} />
                <span className="hidden sm:inline">Hire Employee</span>
                <span className="sm:hidden">Hire</span>
              </button>
            </div>

            {/* Filters - same row */}
            <div className="flex gap-2 md:gap-3 my-2">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="flex-1 px-2 md:px-4 py-2 md:py-3 bg-white border border-secondary rounded-large text-xs md:text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
              >
                {zones.map(function (zone) {
                  return (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  );
                })}
              </select>

              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="flex-1 px-2 md:px-4 py-2 md:py-3 bg-white border border-secondary rounded-large text-xs md:text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
              >
                {divisions.map(function (division) {
                  return (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  );
                })}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 px-2 md:px-4 py-2 md:py-3 bg-white border border-secondary rounded-large text-xs md:text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
              >
                {statuses.map(function (status) {
                  return (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(function (tab) {
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-large text-sm font-medium whitespace-nowrap transition-all duration-200 ease-in-out ${
                    activeTab === tab
                      ? "bg-primary text-white"
                      : "bg-secondary text-secondaryDark"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <div className="flex h-[px] my-1 bg-primary" />
        </div>
          <Pagination
            data={filteredEmployees}
            itemsPerPage={6}
            gridDisplay={true}
            renderItem={function (employee) {
              return (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onViewDetails={handleViewDetails}
                  onTransfer={handleTransfer}
                  onEdit={handleEdit}
                  isDarkTheme={isDarkTheme}
                />
              );
            }}
          />

        {showTransferModal && selectedEmployee && (
          <TransferEmployeeModal
            employee={selectedEmployee}
            onClose={() => setShowTransferModal(false)}
            isDarkTheme={isDarkTheme}
          />
        )}
      </div>
    </div>
  );
}

export default EmployeesOverview;