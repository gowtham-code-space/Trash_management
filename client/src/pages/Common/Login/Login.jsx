import React, { useState } from "react";
import { Settings, Mobile, Email } from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import OtpVerificationModal from "../../../components/Modals/Login/OtpVerificationModal";

//Themeprovider
import ThemeStore from "../../../store/ThemeStore";

// Mock database declared at the top level
const mockUsers = [
  {
    phone: "9876543210",
    email: "john.doe@example.com",
    name: "John Doe"
  },
  {
    phone: "9123456789",
    email: null, 
    name: "Jane Smith"
  }
];

function Login() {
  const {isDarkTheme , toggleTheme} = ThemeStore();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("SMS");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showNewUser, setShowNewUser] = useState(false);

  function handlePhoneInput(value) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
      if (showNewUser) setShowNewUser(false);
    }
  }

  function handleSendOtp() {
    if (!phoneNumber || phoneNumber.length !== 10) {
      ToastNotification("Please enter a valid 10-digit phone number", "error");
      return;
    }

    const user = mockUsers.find(function(u) { return u.phone === phoneNumber; });

    if (!user) {
      ToastNotification("Phone number not found", "error");
      setShowNewUser(true);
      return;
    }

    if (selectedMethod === "Gmail" && !user.email) {
      ToastNotification("No email associated with this number", "error");
      return;
    }

    setUserEmail(user.email);
    const destination = selectedMethod === "SMS" ? `+91 ${phoneNumber}` : user.email;
    ToastNotification(`OTP sent to ${destination}`, "success");
    setShowOtpModal(true);
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-10 w-full max-w-md">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-secondary p-3 rounded-xl">
            <Settings isPressed={false} isDarkTheme={isDarkTheme} />
          </div>
        </div>
        {/* Titles */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-black mb-3">Welcome Back</h1>
          <p className="text-sm text-gray-400 px-8">
            Enter your mobile number to access your dashboard.
          </p>
        </div>

        {/* Method Toggle */}
        <div className="bg-secondary p-1 rounded-lg flex mb-8">
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
        <div className="mb-8">
          <label className="block text-sm font-semibold text-black mb-2">
            Mobile Number
          </label>
          <div className="flex bg-background border border-gray-100 rounded-lg overflow-hidden focus-within:border-primary transition-colors">
            <span className="px-4 py-4 text-gray-400 border-r border-gray-100 text-base font-medium">
              +91
            </span>
            <input
              type="text"
              value={phoneNumber}
              onChange={function(e) { handlePhoneInput(e.target.value); }}
              placeholder="98765 43210"
              className="w-full px-4 py-4 bg-transparent outline-none text-base font-medium placeholder:text-gray-300"
            />
          </div>
          {showNewUser && (
            <p className="text-xs text-error mt-2 font-medium">New user? Please contact support</p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSendOtp}
          className="w-full bg-primaryLight text-white font-medium py-3 rounded-lg mb-6 hover:bg-primary hover:cursor-pointer active:scale-[0.98] transition-all duration-200"
        >
          Send Secure OTP
        </button>
      </div>

      {showOtpModal && (
        <OtpVerificationModal
          phoneNumber={phoneNumber}
          method={selectedMethod}
          userEmail={userEmail}
          onClose={function() { setShowOtpModal(false); }}
        />
      )}

      <ToastContainer/>
      </div>
    </div>
  );
}

export default Login;