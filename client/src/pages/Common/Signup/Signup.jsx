import React, { useState, useEffect } from "react";
import { Camera, Mobile, Email, Location, Home, People, Check, Settings } from "../../../assets/icons/icons";
import ToastNotification from "../../../components/Notification/ToastNotification";
import ThemeStore from "../../../store/ThemeStore";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import OtpVerificationModal from "../../../components/Modals/Login/OtpVerificationModal";
import { requestOtp, completeSignup, checkContact, getDistricts, getWardsByDistrict, getStreetsByWard } from "../../../services/features/authService";
import { getUser } from "../../../services/core/session";
import { useTranslation } from "react-i18next";

function SignUp() {
  const { isDarkTheme } = ThemeStore();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    profilePic: null,
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    district: "",
    wardNumber: "",
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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [streets, setStreets] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedWardId, setSelectedWardId] = useState();

  const steps = [
    { id: 0, title: t('signup.steps.0.title'), description: t('signup.steps.0.description') },
    { id: 1, title: t('signup.steps.1.title'), description: t('signup.steps.1.description') },
    { id: 2, title: t('signup.steps.2.title'), description: t('signup.steps.2.description') },
    { id: 3, title: t('signup.steps.3.title'), description: t('signup.steps.3.description') }
  ];

  useEffect(function() {
    async function fetchDistricts() {
      try {
        const response = await getDistricts();
        setDistricts(response.data || []);
      } catch (error) {
        console.error("Error fetching districts:", error);
        ToastNotification(t('signup.failed_districts'), "error");
      }
    }
    fetchDistricts();
  }, []);

  async function handleDistrictChange(districtId, districtName) {
    setSelectedDistrictId(districtId);
    setFormData({ ...formData, district: districtName, wardName: "", wardNumber: "", streetName: "" });
    setWards([]);
    setStreets([]);
    setSelectedWardId("");
    
    if (districtId) {
      try {
        const response = await getWardsByDistrict(districtId);
        setWards(response.data || []);
      } catch (error) {
        console.error("Error fetching wards:", error);
        ToastNotification(t('signup.failed_wards'), "error");
      }
    }
  }

  async function handleWardChange(wardId, wardNumber, wardName) {
    setSelectedWardId(wardId);
    setFormData({ ...formData, wardNumber, wardName, streetName: "" });
    setStreets([]);
    
    if (wardId) {
      try {
        const response = await getStreetsByWard(wardId);
        setStreets(response.data || []);
      } catch (error) {
        console.error("Error fetching streets:", error);
        ToastNotification(t('signup.failed_streets'), "error");
      }
    }
  }

  function handlePhoneInputVerify(value) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      setPhoneNumberInput(cleaned);
    }
  }

  async function handleSendOtp() {
    if (isSendingOtp) return;

    if (selectedMethod === "SMS") {
      ToastNotification(t('signup.otp_under_construction'), "info");
      return;
    }

    let identifier = "";
    
    if (selectedMethod === "SMS") {
      if (!phoneNumberInput || phoneNumberInput.length !== 10) {
        ToastNotification(t('signup.invalid_phone'), "error");
        return;
      }
      identifier = phoneNumberInput;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInputVerify || !emailRegex.test(emailInputVerify)) {
        ToastNotification(t('signup.invalid_email'), "error");
        return;
      }
      identifier = emailInputVerify;
    }

    try {
      setIsSendingOtp(true);
      const response = await requestOtp({
        email: identifier,
        isSignup: true
      });

      if (response.data.shouldRedirect === 'login') {
        ToastNotification(response.message || t('signup.already_exists'), "info");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      setUserEmail(identifier);
      setIsOtpSent(true);
      ToastNotification(response.message || t('signup.otp_sent', { identifier }), "success");
      setShowOtpModal(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMsg = error.response?.data?.message || error.message || t('signup.failed_send_otp');
      ToastNotification(errorMsg, "error");
    } finally {
      setIsSendingOtp(false);
    }
  }

  function handleOtpVerified(data) {
    if (!completedSteps.includes(0)) {
      setCompletedSteps([...completedSteps, 0]);
    }
    setShowOtpModal(false);
    setCurrentStep(1);
    setIsOtpSent(false);
    setIsSendingOtp(false);
    ToastNotification(t('signup.verification_successful'), "success");
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

  async function validateStep(step) {
    if (step === 0) {
      return false;
    } else if (step === 1) {
      if (!formData.firstName || !formData.lastName) {
        ToastNotification(t('signup.first_last_required'), "error");
        return false;
      }
    } else if (step === 2) {
      const isEmailSignup = userEmail.includes('@');
      
      if (isEmailSignup) {
        if (!formData.phoneNumber) {
          ToastNotification(t('signup.enter_phone'), "error");
          return false;
        }
        if (formData.phoneNumber.length < 10) {
          ToastNotification(t('signup.valid_phone_10'), "error");
          return false;
        }
        
        try {
          const response = await checkContact(formData.phoneNumber, 'phone');
          if (response.data.exists) {
            ToastNotification(t('signup.phone_exists'), "info");
            return false;
          }
        } catch (error) {
          console.error("Error checking phone:", error);
          ToastNotification(t('signup.failed_verify_phone'), "error");
          return false;
        }
      } else {
        if (!formData.email) {
          ToastNotification(t('signup.enter_email'), "error");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          ToastNotification(t('signup.invalid_email'), "error");
          return false;
        }
        
        try {
          const response = await checkContact(formData.email, 'email');
          if (response.data.exists) {
            ToastNotification(t('signup.email_exists'), "info");
            return false;
          }
        } catch (error) {
          console.error("Error checking email:", error);
          ToastNotification(t('signup.failed_verify_email'), "error");
          return false;
        }
      }
    } else if (step === 3) {
      if (!formData.district || !formData.wardNumber || !formData.wardName || !formData.streetName || !formData.houseNumber) {
        ToastNotification(t('signup.fill_address'), "error");
        return false;
      }
    }
    return true;
  }

  async function handleNext() {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const isValid = await validateStep(currentStep);
      if (isValid) {
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
            ToastNotification(t('signup.session_expired'), "error");
            navigate("/signup");
            return;
          }

          // Create FormData to handle file upload
          const formDataToSend = new FormData();
          formDataToSend.append('userId', user.user_id);
          formDataToSend.append('firstName', formData.firstName);
          formDataToSend.append('lastName', formData.lastName);
          
          const isEmailSignup = userEmail.includes('@');
          if (isEmailSignup) {
            formDataToSend.append('email', userEmail);
            formDataToSend.append('phoneNumber', formData.phoneNumber);
          } else {
            formDataToSend.append('phoneNumber', userEmail);
            formDataToSend.append('email', formData.email);
          }
          
          formDataToSend.append('district', formData.district);
          formDataToSend.append('wardNumber', formData.wardNumber);
          formDataToSend.append('wardName', formData.wardName);
          formDataToSend.append('streetName', formData.streetName);
          formDataToSend.append('houseNumber', formData.houseNumber);
          
          // Append profile picture file if exists
          if (formData.profilePic) {
            formDataToSend.append('profilePic', formData.profilePic);
          }

          const response = await completeSignup(formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          ToastNotification(response.message || t('signup.account_created'), "success");
          setTimeout(function() {
            setFormData({
              profilePic: null,
              firstName: "",
              lastName: "",
              phoneNumber: "",
              email: "",
              district: "",
              wardNumber: "",
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
            ToastNotification(error.response?.data?.message || t('signup.signup_failed'), "error");
          }
        }
      }
    } finally {
      setIsLoading(false);
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
            <h1 className="text-2xl font-bold text-black mb-3">{t('signup.create_account_title')}</h1>
            <p className="text-sm text-gray-400 px-8">
              {selectedMethod === "SMS" ? t('signup.step_sms_verify') : t('signup.step_email_verify')}
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
              {t('signup.method_sms')}
            </button>
            <button
              onClick={function() { setSelectedMethod("Gmail"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:cursor-pointer ${
                selectedMethod === "Gmail" ? "bg-white text-black shadow-sm" : "text-gray-400"
              }`}
            >
              <Email isPressed={selectedMethod === "Gmail"} isDarkTheme={isDarkTheme} />
              {t('signup.method_gmail')}
            </button>
          </div>

          {/* Input Field */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              {selectedMethod === "SMS" ? t('signup.phone_number') : t('signup.email_address')}
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
                  placeholder={t('login.placeholder_phone')}
                  className="w-full px-4 py-4 bg-transparent outline-none text-base font-medium placeholder:text-gray-300"
                />
              </div>
            ) : (
              <input
                type="email"
                value={emailInputVerify}
                onChange={function(e) { setEmailInputVerify(e.target.value); }}
                placeholder={t('login.placeholder_email')}
                className="w-full px-4 py-4 bg-background border border-gray-100 rounded-lg outline-none text-base font-medium placeholder:text-gray-300 focus-within:border-primary transition-colors"
              />
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleSendOtp}
            disabled={isOtpSent || isSendingOtp}
            className={`w-full font-medium py-3 rounded-lg transition-all duration-200 ${
              isOtpSent || isSendingOtp
                ? 'bg-primaryLight/60 text-white cursor-not-allowed' 
                : 'bg-primaryLight text-white hover:bg-primary hover:cursor-pointer active:scale-[0.98]'
            }`}
          >
            {isSendingOtp ? t('login.sending') : isOtpSent ? t('signup.otp_sent_label') : t('login.send_otp')}
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
            <p className="text-xs text-secondaryDark">{t('signup.upload_photo')}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
                <People size={16} defaultColor="#316F5D" />
                {t('signup.first_name')}
              </label>
              <input 
                type="text"
                value={formData.firstName}
                onChange={function(e) { handleInputChange("firstName", e.target.value); }}
                placeholder={t('signup.placeholder_first_name')}
                className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark placeholder:text-secondaryDark/50 border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
                <People size={16} defaultColor="#316F5D" />
                {t('signup.last_name')}
              </label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={function(e) { handleInputChange("lastName", e.target.value); }}
                placeholder={t('signup.placeholder_last_name')}
                className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark placeholder:text-secondaryDark/50 border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
              />
            </div>
          </div>
        </div>
      );
    } else if (currentStep === 2) {
      const isEmailSignup = userEmail.includes('@');
      
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              {isEmailSignup ? <Email size={16} defaultColor="#316F5D" /> : <Mobile size={16} defaultColor="#316F5D" />}
              {t('signup.primary_contact')}
            </label>
            <input 
              type="text"
              value={userEmail}
              disabled
              className="w-full px-4 py-3 bg-gray-100 rounded-medium text-sm text-gray-500 border border-gray-200 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">{t('signup.verified_contact_hint')}</p>
          </div>

          {isEmailSignup ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
                <Mobile size={16} defaultColor="#316F5D" />
                {t('signup.phone_number')}
              </label>
              <input 
                type="tel"
                value={formData.phoneNumber}
                onChange={function(e) { handleInputChange("phoneNumber", e.target.value); }}
                placeholder={t('signup.placeholder_phone')}
                className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark placeholder:text-secondaryDark/50 border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
                <Email size={16} defaultColor="#316F5D" />
                {t('signup.email_address')}
              </label>
              <input 
                type="email"
                value={formData.email}
                onChange={function(e) { handleInputChange("email", e.target.value); }}
                placeholder={t('signup.placeholder_email')}
                className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark placeholder:text-secondaryDark/50 border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
              />
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Location size={16} defaultColor="#316F5D" />
              {t('signup.district')}
            </label>
<select
              value={selectedDistrictId}
              onChange={function(e) { 
                const selected = districts.find(d => d.district_id == e.target.value);
                if (selected) {
                  handleDistrictChange(selected.district_id, selected.district_name);
                }
              }}
              className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out cursor-pointer appearance-none"
            >
              <option value="">{t('signup.select_district')}</option>
              {districts.map(function(district) {
                return <option key={district.district_id} value={district.district_id}>{district.district_name}</option>;
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Location size={16} defaultColor="#316F5D" />
              {t('signup.ward_name')}
            </label>
<select
              value={selectedWardId}
              onChange={function(e) { 
                const selected = wards.find(w => w.ward_id == e.target.value);
                if (selected) {
                  handleWardChange(selected.ward_id, selected.ward_number, selected.ward_name);
                }
              }}
              disabled={!selectedDistrictId}
              className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{t('signup.select_ward')}</option>
              {wards.map(function(ward) {
                return <option key={ward.ward_id} value={ward.ward_id}>{ward.ward_name}</option>;
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Location size={16} defaultColor="#316F5D" />
              {t('signup.street_name')}
            </label>
<select
              value={formData.streetName}
              onChange={function(e) { handleInputChange("streetName", e.target.value); }}
              disabled={!selectedWardId}
              className="w-full px-4 py-3 bg-secondary rounded-medium text-sm text-secondaryDark border border-secondary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{t('signup.select_street')}</option>
              {streets.map(function(street) {
                return <option key={street.street_id} value={street.street_name}>{street.street_name}</option>;
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondaryDark flex items-center gap-2">
              <Home size={16} defaultColor="#316F5D" />
              {t('signup.house_number_label')}
            </label>
            <input 
              type="text"
              value={formData.houseNumber}
              onChange={function(e) { handleInputChange("houseNumber", e.target.value); }}
              placeholder={t('signup.placeholder_house_number')}
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
                      {t('common:back')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                    className={`flex-1 py-3 rounded-medium text-sm font-medium transition-all duration-200 ease-in-out ${
                      isLoading
                        ? 'bg-primary/60 text-white cursor-not-allowed'
                        : 'bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]'
                    }`}
                  >
                    {isLoading ? t('signup.loading') : (currentStep === 3 ? t('signup.create_account_btn') : t('signup.continue'))}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-secondaryDark">
                {t('signup.step_label', { current: currentStep + 1, total: 4 })}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex min-h-screen">
          <div className="w-1/3 bg-white p-12 flex flex-col justify-center">
            <div className="mb-12">
              <h2 className="text-xl font-bold text-primary mb-2">{t('signup.create_account_title')}</h2>
              <p className="text-sm text-secondaryDark">{t('signup.complete_all_steps')}</p>
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
                        {t('common:back')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isLoading}
                      className={`flex-1 py-3 rounded-medium text-sm font-medium transition-all duration-200 ease-in-out ${
                        isLoading
                          ? 'bg-primary/60 text-white cursor-not-allowed'
                          : 'bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]'
                      }`}
                    >
                      {isLoading ? t('signup.loading') : (currentStep === 3 ? t('signup.create_account_btn') : t('signup.continue'))}
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