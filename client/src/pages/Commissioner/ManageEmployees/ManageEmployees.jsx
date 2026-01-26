import React, { useState } from "react";
import ThemeStore from "../../../store/ThemeStore";
import { Search, Add, DownArrow, Filter } from "../../../assets/icons/icons";
import EmployeeCard from "../../../components/Cards/Commissioner/EmployeeCard";
import HireEmployees from "./HireEmployees";
import TransferEmployeeModal from "../../../components/Modals/Commissioner/TransferEmployeeModal";
import Pagination from "../../../utils/Pagination";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManageEmployees() {
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
      email: "priya.rajan@waste.gov",
      district: "District 1",
      ward: "Ward 1",
      street: "Street A",
      house_number: "12"
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
      email: "rajesh.kumar@waste.gov",
      district: "District 1",
      ward: "Ward 2",
      street: "Street B",
      house_number: "45"
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
      email: "anitha.s@waste.gov",
      district: "District 2",
      ward: "Ward 3",
      street: "Street C",
      house_number: "78"
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
      email: "muthu.vel@waste.gov",
      district: "District 3",
      ward: "Ward 1",
      street: "Street A",
      house_number: "23"
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
      email: "lakshmi.p@waste.gov",
      district: "District 2",
      ward: "Ward 4",
      street: "Street B",
      house_number: "56"
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
      email: "david.john@waste.gov",
      district: "District 1",
      ward: "Ward 3",
      street: "Street C",
      house_number: "90"
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
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (showManageEmployee) {
    return (
      <HireEmployees 
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
        <ToastContainer position="top-right" autoClose={3000} />
        
        <div className="p-6">
          <div className="bg-white rounded-veryLarge p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-secondaryDark">Employee Management</h1>
              <button
                onClick={handleHireEmployee}
                className="flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-large font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
              >
                <Add size={20} isDarkTheme={true} />
                <span>Hire New Employee</span>
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="w-full pl-10 pr-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                />
                <div className="absolute left-3 top-3">
                  <Search size={20} isDarkTheme={isDarkTheme} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                  {zones.map(function(zone) {
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
                  className="px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                  {divisions.map(function(division) {
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
                  className="px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                  {statuses.map(function(status) {
                    return (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto">
              {tabs.map(function(tab) {
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-large text-sm font-medium whitespace-nowrap transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] ${
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedEmployees.map(function(employee) {
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
              })}
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <p className="text-secondaryDark">No employees found</p>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>

        {showTransferModal && (
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

export default ManageEmployees;
