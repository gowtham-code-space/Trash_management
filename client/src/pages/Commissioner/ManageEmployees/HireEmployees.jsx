import React, { useState, useRef } from "react";
import { Camera, DownArrow, Upload, Download, X } from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";

function HireEmployees({ employee, onClose, isDarkTheme, mode }) {
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [uploadMode, setUploadMode] = useState("individual");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formData, setFormData] = useState(employee || {
    profile_pic: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    district: "",
    ward: "",
    street: "",
    house_number: "",
    role: "",
    status: "Active"
  });

  const districts = ["District 1", "District 2", "District 3"];
  const wards = ["Ward 1", "Ward 2", "Ward 3", "Ward 4"];
  const streets = ["Street A", "Street B", "Street C"];
  const roles = ["Trash Collector", "Supervisor", "Sanitary Inspector", "MHO"];
  const statuses = ["Active", "Resigned", "Suspended"];

  function handleInputChange(field, value) {
    setFormData(function(prev) {
      return { ...prev, [field]: value };
    });
  }

  function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        ToastNotification("Please upload a valid image file", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("profile_pic", reader.result);
        ToastNotification("Profile photo uploaded successfully", "success");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit() {
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.email || !formData.role) {
      ToastNotification("Please fill all required fields", "error");
      return;
    }

    if (mode === "hire") {
      ToastNotification("Employee hired successfully", "success");
    } else if (mode === "edit") {
      ToastNotification("Employee updated successfully", "success");
    }
    onClose();
  }

  function handleFire() {
    handleInputChange("status", "Resigned");
    ToastNotification("Employee status updated to Resigned", "warning");
  }

  function handleSuspend() {
    handleInputChange("status", "Suspended");
    ToastNotification("Employee suspended", "warning");
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        ToastNotification("Please upload a valid Excel or CSV file", "error");
        return;
      }
      setUploadedFile(file);
      ToastNotification(`File "${file.name}" uploaded successfully`, "success");
    }
  }

  function handleBulkSubmit() {
    if (!uploadedFile) {
      ToastNotification("Please upload a file first", "error");
      return;
    }
    ToastNotification("Bulk employee data uploaded successfully", "success");
    onClose();
  }

  function downloadTemplate() {
    ToastNotification("Downloading Excel template...", "success");
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-veryLarge p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondaryDark">
              {mode === "hire" ? "Hire New Employee" : "Manage Employee"}
            </h2>
            {mode === "edit" && formData.status && (
              <span className={`px-3 py-1 rounded-large text-sm font-medium ${
                formData.status === "Active" ? "bg-success/10 text-success" :
                formData.status === "Suspended" ? "bg-error/10 text-error" :
                formData.status === "Resigned" ? "bg-secondaryDark/10 text-secondaryDark" :
                "bg-warning/10 text-warning"
              }`}>
                {formData.status}
              </span>
            )}
          </div>

          {mode === "hire" && (
            <div className="mb-6">
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setUploadMode("individual")}
                  className={`flex-1 px-4 py-3 rounded-large font-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] ${
                    uploadMode === "individual"
                      ? "bg-primary text-white"
                      : "bg-secondary text-secondaryDark"
                  }`}
                >
                  Individual Hire
                </button>
                <button
                  onClick={() => setUploadMode("bulk")}
                  className={`flex-1 px-4 py-3 rounded-large font-medium transition-all duration-200 ease-in-out hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] ${
                    uploadMode === "bulk"
                      ? "bg-primary text-white"
                      : "bg-secondary text-secondaryDark"
                  }`}
                >
                  Bulk Upload
                </button>
              </div>
            </div>
          )}

          {uploadMode === "bulk" && mode === "hire" ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-secondary rounded-veryLarge p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                    <Upload size={32} isDarkTheme={isDarkTheme} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondaryDark mb-2">
                      Upload Employee Data
                    </h3>
                    <p className="text-sm text-secondaryDark mb-4">
                      Upload an Excel or CSV file with employee information
                    </p>
                    {uploadedFile && (
                      <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-success/10 rounded-large">
                        <span className="text-sm font-medium text-success">
                          {uploadedFile.name}
                        </span>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="p-1 hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 ease-in-out"
                        >
                          <X size={16} isDarkTheme={isDarkTheme} />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="px-6 py-3 bg-primary text-white rounded-large font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                    >
                      Choose File
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-secondary p-4 rounded-large">
                <h4 className="text-sm font-bold text-secondaryDark mb-3">
                  Download Template
                </h4>
                <p className="text-xs text-secondaryDark mb-3">
                  Use our Excel template to ensure your data is formatted correctly
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary text-secondaryDark rounded-large text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                  <Download size={16} isDarkTheme={isDarkTheme} />
                  <span>Download Template</span>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-secondary text-secondaryDark rounded-large font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSubmit}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-large font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                  Upload Employees
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {formData.profile_pic ? (
                      <img src={formData.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={32} isDarkTheme={isDarkTheme} />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current.click()}
                    className="absolute bottom-0 right-0 bg-primary p-2 rounded-full hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                  >
                    <Camera size={16} isDarkTheme={true} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                  >
                    <option value="">Select District</option>
                    {districts.map(function(district) {
                      return (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">Ward</label>
                  <select
                    value={formData.ward}
                    onChange={(e) => handleInputChange("ward", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                  >
                    <option value="">Select Ward</option>
                    {wards.map(function(ward) {
                      return (
                        <option key={ward} value={ward}>
                          {ward}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">Street Name</label>
                  <select
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                  >
                    <option value="">Select Street</option>
                    {streets.map(function(street) {
                      return (
                        <option key={street} value={street}>
                          {street}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">House / Flat Number</label>
                  <input
                    type="text"
                    value={formData.house_number}
                    onChange={(e) => handleInputChange("house_number", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    placeholder="Enter house/flat number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                  >
                    <option value="">Select Role</option>
                    {roles.map(function(role) {
                      return (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondaryDark mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-large text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                  >
                    <option value="">Select Status</option>
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

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-secondary text-secondaryDark rounded-large font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-large font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                  {mode === "hire" ? "Hire Employee" : "Update"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HireEmployees;
