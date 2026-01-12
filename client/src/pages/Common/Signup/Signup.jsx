import React, { useState } from "react";
import { Camera, Mobile, Email, Location, Home, People, Check } from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";
import ThemeStore from "../../../store/ThemeStore";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const { isDarkTheme } = ThemeStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    profilePic: null,
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    district: "",
    wardName: "",
    streetName: "",
    houseNumber: ""
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  const districts = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
    "Monaragala", "Ratnapura", "Kegalle"
  ];

  const wards = [
    "Ward 1 - Central", "Ward 2 - North", "Ward 3 - South",
    "Ward 4 - East", "Ward 5 - West", "Ward 6 - Northeast",
    "Ward 7 - Southeast", "Ward 8 - Northwest", "Ward 9 - Southwest",
    "Ward 10 - Downtown"
  ];

  const streets = [
    "Main Street", "First Street", "Second Street", "Third Street",
    "Park Avenue", "Lake Road", "Hill Street", "Station Road",
    "Temple Road", "School Lane"
  ];

  const steps = [
    { id: 1, title: "Tell me about yourself", description: "Basic information" },
    { id: 2, title: "Contact", description: "Communication details" },
    { id: 3, title: "Where do you live", description: "Address information" }
  ];

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: file });
      const reader = new FileReader();
      reader.onloadend = function() {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleInputChange(field, value) {
    setFormData({ ...formData, [field]: value });
  }

  function validateStep(step) {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName) {
        ToastNotification("Please enter your first and last name", "error");
        return false;
      }
    } else if (step === 2) {
      if (!formData.phoneNumber || !formData.email) {
        ToastNotification("Please enter your phone number and email", "error");
        return false;
      }
      if (formData.phoneNumber.length < 10) {
        ToastNotification("Please enter a valid phone number", "error");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        ToastNotification("Please enter a valid email address", "error");
        return false;
      }
    } else if (step === 3) {
      if (!formData.district || !formData.wardName || !formData.streetName || !formData.houseNumber) {
        ToastNotification("Please fill in all address fields", "error");
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        ToastNotification("Account created successfully! Welcome aboard.", "success");
        setTimeout(function() {
          setFormData({
            profilePic: null,
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            district: "",
            wardName: "",
            streetName: "",
            houseNumber: ""
          });
          setPreviewImage(null);
          setCurrentStep(1);
          setCompletedSteps([]);
          navigate("/");
        }, 1500);
      }
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function TimelineStep({ step, isActive, isCompleted }) {
    return (
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ease-in-out ${
            isCompleted 
              ? "bg-primary border-primary" 
              : isActive 
                ? "bg-primary border-primary" 
                : "bg-secondary border-secondary"
          }`}>
            {isCompleted ? (
              <div className="relative">
                <Check size={20} isDarkTheme={true} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primaryLight rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-primaryLight rounded-full animate-ping delay-75"></div>
              </div>
            ) : (
              <span className={`text-sm font-bold ${isActive ? "text-white" : "text-secondaryDark"}`}>
                {step.id}
              </span>
            )}
          </div>
          {step.id < 3 && (
            <div className={`w-0.5 h-16 mt-2 transition-all duration-500 ease-in-out ${
              isCompleted || (isActive && step.id < currentStep)
                ? "bg-primary" 
                : "bg-secondary"
            }`}></div>
          )}
        </div>
        <div className="flex-1 pt-2">
          <h3 className={`text-sm font-bold transition-all duration-200 ease-in-out ${
            isActive ? "text-primary" : "text-secondaryDark"
          }`}>
            {step.title}
          </h3>
          <p className="text-xs text-secondaryDark mt-1">{step.description}</p>
        </div>
      </div>
    );
  }

  function renderStepContent() {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-primary">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <People size={40} defaultColor="#145B47" />
                )}
              </div>
              <label 
                htmlFor="profilePic"
                className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
              >
                <Camera size={16} isDarkTheme={true} />
                <input 
                  id="profilePic"
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-secondaryDark">Upload profile picture</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
                <People size={16} defaultColor="#316F5D" />
                First Name
              </label>
              <input 
                type="text"
                value={formData.firstName}
                onChange={function(e) { handleInputChange("firstName", e.target.value); }}
                placeholder="Enter first name"
                className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark placeholder:text-secondaryDark/50 border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
                <People size={16} defaultColor="#316F5D" />
                Last Name
              </label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={function(e) { handleInputChange("lastName", e.target.value); }}
                placeholder="Enter last name"
                className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark placeholder:text-secondaryDark/50 border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
              />
            </div>
          </div>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Mobile size={16} defaultColor="#316F5D" />
              Phone Number
            </label>
            <input 
              type="tel"
              value={formData.phoneNumber}
              onChange={function(e) { handleInputChange("phoneNumber", e.target.value); }}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark placeholder:text-secondaryDark/50 border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Email size={16} defaultColor="#316F5D" />
              Email Address
            </label>
            <input 
              type="email"
              value={formData.email}
              onChange={function(e) { handleInputChange("email", e.target.value); }}
              placeholder="Enter email address"
              className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark placeholder:text-secondaryDark/50 border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Location size={16} defaultColor="#316F5D" />
              District
            </label>
            <select
              value={formData.district}
              onChange={function(e) { handleInputChange("district", e.target.value); }}
              className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out cursor-pointer appearance-none"
            >
              <option value="">Select district</option>
              {districts.map(function(district) {
                return <option key={district} value={district}>{district}</option>;
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Location size={16} defaultColor="#316F5D" />
              Ward Name
            </label>
            <select
              value={formData.wardName}
              onChange={function(e) { handleInputChange("wardName", e.target.value); }}
              className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out cursor-pointer appearance-none"
            >
              <option value="">Select ward</option>
              {wards.map(function(ward) {
                return <option key={ward} value={ward}>{ward}</option>;
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Location size={16} defaultColor="#316F5D" />
              Street Name
            </label>
            <select
              value={formData.streetName}
              onChange={function(e) { handleInputChange("streetName", e.target.value); }}
              className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out cursor-pointer appearance-none"
            >
              <option value="">Select street</option>
              {streets.map(function(street) {
                return <option key={street} value={street}>{street}</option>;
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Home size={16} defaultColor="#316F5D" />
              House Number / Flat Number
            </label>
            <input 
              type="text"
              value={formData.houseNumber}
              onChange={function(e) { handleInputChange("houseNumber", e.target.value); }}
              placeholder="Enter house or flat number"
              className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark placeholder:text-secondaryDark/50 border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
            />
          </div>
        </div>
      );
    }
  }

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <div className="lg:hidden">
          <div className="fixed top-0 left-0 right-0 h-1 bg-secondary z-50">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="p-6 pt-12 max-w-md mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-xl font-bold text-primary mb-2">
                {steps[currentStep - 1].title}
              </h1>
              <p className="text-sm text-secondaryDark">
                {steps[currentStep - 1].description}
              </p>
            </div>

            <div className="bg-white rounded-veryLarge p-6 space-y-6">
              {renderStepContent()}

              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-secondary text-primary py-3 rounded-medium text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-primary text-white py-3 rounded-medium text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                  {currentStep === 3 ? "Create Account" : "Continue"}
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-secondaryDark">
                Step {currentStep} of 3
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex min-h-screen">
          <div className="w-1/3 bg-white p-12 flex flex-col justify-center">
            <div className="mb-12">
              <h2 className="text-xl font-bold text-primary mb-2">Create Account</h2>
              <p className="text-sm text-secondaryDark">Complete all steps to join our platform</p>
            </div>

            <div className="space-y-2">
              {steps.map(function(step) {
                return (
                  <TimelineStep 
                    key={step.id}
                    step={step}
                    isActive={currentStep === step.id}
                    isCompleted={completedSteps.includes(step.id)}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-12">
            <div className="w-full max-w-lg">
              <div className="bg-white rounded-veryLarge p-8 space-y-6">
                <div className="text-center">
                  <h1 className="text-xl font-bold text-primary mb-2">
                    {steps[currentStep - 1].title}
                  </h1>
                  <p className="text-sm text-secondaryDark">
                    {steps[currentStep - 1].description}
                  </p>
                </div>

                {renderStepContent()}

                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-secondary text-primary py-3 rounded-medium text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-primary text-white py-3 rounded-medium text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                  >
                    {currentStep === 3 ? "Create Account" : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}

export default SignUp;