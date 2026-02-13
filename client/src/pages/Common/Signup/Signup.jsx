import React, { useState } from "react";
import { Camera, Mobile, Email, Location, Home, People, Check, Settings } from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";
import ThemeStore from "../../../store/ThemeStore";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import OtpVerificationModal from "../../../components/Modals/Login/OtpVerificationModal";
import { api } from "../../../services/apiMethods";
import { getUser } from "../../../services/session";

function SignUp() {
  const { isDarkTheme } = ThemeStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
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
  const [selectedMethod, setSelectedMethod] = useState("SMS");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [emailInputVerify, setEmailInputVerify] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

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
    { id: 0, title: "Verify Identity", description: "Verify your phone or email" },
    { id: 1, title: "Tell me about yourself", description: "Basic information" },
    { id: 2, title: "Contact", description: "Communication details" },
    { id: 3, title: "Where do you live", description: "Address information" }
  ];

  function handlePhoneInputVerify(value) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      setPhoneNumberInput(cleaned);
    }
  }

  async function handleSendOtp() {
    if (selectedMethod === "SMS") {
      ToastNotification("OTP via phone is under construction", "info");
      return;
    }

    let identifier = "";
    
    if (selectedMethod === "SMS") {
      if (!phoneNumberInput || phoneNumberInput.length !== 10) {
        ToastNotification("Please enter a valid 10-digit phone number", "error");
        return;
      }
      identifier = phoneNumberInput;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInputVerify || !emailRegex.test(emailInputVerify)) {
        ToastNotification("Please enter a valid email address", "error");
        return;
      }
      identifier = emailInputVerify;
    }

    try {
      const response = await api.post("/auth/request-otp", {
        email: identifier,
        isSignup: true
      });

      if (response.data.shouldRedirect === 'login') {
        ToastNotification(response.message || "Account already exists. Please login instead.", "info");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      setUserEmail(identifier);
      setIsOtpSent(true);
      ToastNotification(response.message || `OTP sent to ${identifier}`, "success");
      setShowOtpModal(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to send OTP";
      ToastNotification(errorMsg, "error");
    }
  }

  function handleOtpVerified(data) {
    // Called when OTP is verified successfully
    if (!completedSteps.includes(0)) {
      setCompletedSteps([...completedSteps, 0]);
    }
    setShowOtpModal(false);
    setCurrentStep(1);
    setIsOtpSent(false); // Reset OTP sent state for potential re-verification
    ToastNotification("Verification successful! Please complete your profile.", "success");
  }

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
    if (step === 0) {
      // Verify step - handled by OTP modal
      return false; // Don't allow next from verify screen, must use OTP
    } else if (step === 1) {
      if (!formData.firstName || !formData.lastName) {
        ToastNotification("Please enter your first and last name", "error");
        return false;
      }
    } else if (step === 2) {
      // Contact step - Phone number is required
      if (!formData.phoneNumber) {
        ToastNotification("Please enter your phone number", "error");
        return false;
      }
      if (formData.phoneNumber.length < 10) {
        ToastNotification("Please enter a valid phone number (at least 10 digits)", "error");
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

  async function handleNext() {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - complete signup
        try {
          const user = getUser();
          if (!user || !user.user_id) {
            ToastNotification("Session expired. Please start again.", "error");
            navigate("/signup");
            return;
          }

          const signupData = {
            userId: user.user_id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: userEmail, // Primary verified email from step 0
            phoneNumber: formData.phoneNumber,
            district: formData.district,
            wardName: formData.wardName,
            streetName: formData.streetName,
            houseNumber: formData.houseNumber,
            profilePic: formData.profilePic ? "uploaded_pic_url" : null // Handle file upload separately if needed
          };

          const response = await api.post("/auth/complete-signup", signupData);

          ToastNotification(response.message || "Account created successfully! Welcome aboard.", "success");
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
            setCurrentStep(0);
            setCompletedSteps([]);
            navigate("/");
          }, 1500);
        } catch (error) {
          console.error("Error completing signup:", error);
          ToastNotification(error.response?.data?.message || "Failed to complete signup. Please try again.", "error");
        }
      }
    }
  }

  function handleBack() {
    if (currentStep > 0) {
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
    if (currentStep === 0) {
      // Verify step - similar to Login page
      return (
        <div className="space-y-6">
          {/* Header Icon */}
          <div className="flex justify-center">
            <div className="bg-secondary p-3 rounded-xl">
              <Settings isPressed={false} isDarkTheme={isDarkTheme} />
            </div>
          </div>
          
          {/* Titles */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-3">Create Account</h1>
            <p className="text-sm text-gray-400 px-8">
              {selectedMethod === "SMS" ? "Enter your mobile number to verify your identity." : "Enter your email address to verify your identity."}
            </p>
          </div>

          {/* Method Toggle */}
          <div className="bg-secondary p-1 rounded-lg flex">
            <button
              onClick={function() { setSelectedMethod("SMS"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:cursor-pointer ${
                selectedMethod === "SMS" ? "bg-white text-black shadow-sm" : "text-gray-400"
              }`}
            >
              <Mobile isPressed={selectedMethod === "SMS"} isDarkTheme={isDarkTheme} />
              SMS
            </button>
            <button
              onClick={function() { setSelectedMethod("Gmail"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:cursor-pointer ${
                selectedMethod === "Gmail" ? "bg-white text-black shadow-sm" : "text-gray-400"
              }`}
            >
              <Email isPressed={selectedMethod === "Gmail"} isDarkTheme={isDarkTheme} />
              Gmail
            </button>
          </div>

          {/* Input Field */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              {selectedMethod === "SMS" ? "Mobile Number" : "Email Address"}
            </label>
            {selectedMethod === "SMS" ? (
              <div className="flex bg-background border border-gray-100 rounded-lg overflow-hidden focus-within:border-primary transition-colors">
                <span className="px-4 py-4 text-gray-400 border-r border-gray-100 text-base font-medium">
                  +91
                </span>
                <input
                  type="text"
                  value={phoneNumberInput}
                  onChange={function(e) { handlePhoneInputVerify(e.target.value); }}
                  placeholder="98765 43210"
                  className="w-full px-4 py-4 bg-transparent outline-none text-base font-medium placeholder:text-gray-300"
                />
              </div>
            ) : (
              <input
                type="email"
                value={emailInputVerify}
                onChange={function(e) { setEmailInputVerify(e.target.value); }}
                placeholder="yourname@gmail.com"
                className="w-full px-4 py-4 bg-background border border-gray-100 rounded-lg outline-none text-base font-medium placeholder:text-gray-300 focus-within:border-primary transition-colors"
              />
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleSendOtp}
            disabled={isOtpSent}
            className={`w-full bg-primaryLight text-white font-medium py-3 rounded-lg transition-all duration-200 ${
              isOtpSent 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-primary hover:cursor-pointer active:scale-[0.98]'
            }`}
          >
            {isOtpSent ? 'OTP Sent' : 'Send Secure OTP'}
          </button>
        </div>
      );
    } else if (currentStep === 1) {
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
              <Email size={16} defaultColor="#316F5D" />
              Primary Contact (Verified)
            </label>
            <input 
              type="text"
              value={userEmail}
              disabled
              className="w-full px-4 py-3 bg-gray-100 rounded-medium text-sm text-gray-500 border border-gray-200 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">This is your verified contact from step 1</p>
          </div>

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
                {steps[currentStep].title}
              </h1>
              <p className="text-sm text-secondaryDark">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="bg-white rounded-veryLarge p-6 space-y-6">
              {renderStepContent()}

              {currentStep > 0 && (
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
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-secondaryDark">
                Step {currentStep + 1} of 4
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
                    {steps[currentStep].title}
                  </h1>
                  <p className="text-sm text-secondaryDark">
                    {steps[currentStep].description}
                  </p>
                </div>

                {renderStepContent()}

                {currentStep > 0 && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <OtpVerificationModal
          identifier={userEmail}
          method={selectedMethod}
          isLogin={false}
          onClose={function() { setShowOtpModal(false); }}
          onVerified={handleOtpVerified}
        />
      )}

      <ToastContainer/>
    </div>
  );
}

export default SignUp;