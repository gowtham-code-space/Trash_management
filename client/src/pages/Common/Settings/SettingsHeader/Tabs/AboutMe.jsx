import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Certificate, Check, RightArrow, Edit, X, Trash } from "../../../../../assets/icons/icons";
import ToastNotification from "../../../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import UpdateContactInfo from "../../../../../components/Modals/Settings/UpdateContactInfo";
import ViewProfileModal from "../../../../../components/Modals/Settings/ViewProfileModal";
import { getProfile, updateProfile, requestPhoneOtp, requestEmailOtp, verifyEmailOtp, deleteProfilePic } from "../../../../../services/features/settingsService";
import { SkeletonAvatar, SkeletonLine, SkeletonBlock } from "../../../../../components/skeleton";

function AboutMe() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isTogglingEdit, setIsTogglingEdit] = useState(false);
    const [profilePicFile, setProfilePicFile] = useState(null);
    
    // Track original values to check for changes
    const [originalData, setOriginalData] = useState({
        firstName: "",
        lastName: ""
    });
    
    const [userData, setUserData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        profilePic: null,
        certificate: "View your certifications"
    });

    const [editingField, setEditingField] = useState(null);
    const [tempFirstName, setTempFirstName] = useState("");
    const [tempLastName, setTempLastName] = useState("");
    const [tempPhone, setTempPhone] = useState("");
    const [tempEmail, setTempEmail] = useState("");

    useEffect(function () {
        async function fetchProfile() {
            try {
                const response = await getProfile();
                const profile = response.data.profile;
                
                const profileData = {
                    firstName: profile.first_name || "",
                    lastName: profile.last_name || "",
                    phone: profile.phone_number || "",
                    email: profile.email || "",
                    profilePic: profile.profile_pic || null,
                    certificate: "View your certifications"
                };
                
                setUserData(profileData);
                setOriginalData({
                    firstName: profile.first_name || "",
                    lastName: profile.last_name || ""
                });
                
                setTempFirstName(profile.first_name || "");
                setTempLastName(profile.last_name || "");
                setTempPhone(profile.phone_number || "");
                setTempEmail(profile.email || "");
            } catch (error) {
                console.error('Error fetching profile:', error);
                ToastNotification("Failed to load profile", "error");
            } finally {
                setLoading(false);
            }
        }
        
        fetchProfile();
    }, []);

    function handleProfilePicChange(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                ToastNotification("Please select a valid image file", "error");
                return;
            }
            setProfilePicFile(file);

            const reader = new FileReader();
            reader.onloadend = function () {
                setUserData(function (prev) {
                    return { ...prev, profilePic: reader.result };
                });
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleDeleteProfilePic() {
        if (!userData.profilePic) return;
        
        try {
            const response = await deleteProfilePic();
            if (response.success) {
                setUserData(function (prev) {
                    return { ...prev, profilePic: null };
                });
                setProfilePicFile(null);
                ToastNotification("Profile picture deleted successfully", "success");
            }
        } catch (error) {
            console.error('Error deleting profile picture:', error);
            ToastNotification(error.response?.data?.message || "Failed to delete profile picture", "error");
        }
    }

    function handleEditClick(field) {
        setEditingField(field);
        if (field === "firstName") setTempFirstName(userData.firstName);
        if (field === "lastName") setTempLastName(userData.lastName);
        if (field === "phone") setTempPhone(userData.phone);
        if (field === "email") setTempEmail(userData.email);
    }

    async function handleSaveClick(field) {
        if (field === "firstName" || field === "lastName") {
            setUserData(function (prev) {
                return {
                    ...prev,
                    firstName: field === "firstName" ? tempFirstName : prev.firstName,
                    lastName: field === "lastName" ? tempLastName : prev.lastName
                };
            });
            setEditingField(null);
        } else if (field === "phone") {
            try {
                const response = await requestPhoneOtp(tempPhone);
                
                if (response.data?.sameAsPrevious) {
                    ToastNotification(response.message, "info");
                    setEditingField(null);
                } else if (response.data?.underConstruction) {
                    ToastNotification(response.message, "info");
                    setEditingField(null);
                } else {
                    setModalType("phone");
                    setShowModal(true);
                }
            } catch (error) {
                console.error('Error requesting phone OTP:', error);
                ToastNotification(error.response?.data?.message || "Failed to process phone change", "error");
            }
        } else if (field === "email") {
            try {
                const response = await requestEmailOtp(tempEmail);
                
                if (response.data?.sameAsPrevious) {
                    ToastNotification(response.message, "info");
                    setEditingField(null);
                } else {
                    setModalType("email");
                    setShowModal(true);
                }
            } catch (error) {
                console.error('Error requesting email OTP:', error);
                ToastNotification(error.response?.data?.message || "Failed to send email OTP", "error");
            }
        }
    }

    function handleCancelEdit(field) {
        setEditingField(null);
        if (field === "firstName") setTempFirstName(userData.firstName);
        if (field === "lastName") setTempLastName(userData.lastName);
        if (field === "phone") setTempPhone(userData.phone);
        if (field === "email") setTempEmail(userData.email);
    }

    async function handleModalConfirm(otpCode) {
        if (modalType === "email") {
            try {
                const response = await verifyEmailOtp(tempEmail, otpCode);
                
                setUserData(function (prev) {
                    return { ...prev, email: tempEmail };
                });
                ToastNotification(response.message || "Email updated successfully", "success");
                setShowModal(false);
                setEditingField(null);
            } catch (error) {
                console.error('Error verifying email OTP:', error);
                ToastNotification(error.response?.data?.message || "Invalid OTP", "error");
                throw error; 
            }
        }
    }

    function getUserInitial() {
        return userData.firstName?.charAt(0)?.toUpperCase() || "U";
    }

    async function toggleEditMode() {
        if (isEditMode) {
            const firstNameChanged = userData.firstName !== originalData.firstName;
            const lastNameChanged = userData.lastName !== originalData.lastName;
            const hasProfilePicFile = profilePicFile !== null;
            
            if (!firstNameChanged && !lastNameChanged && !hasProfilePicFile) {
                setIsEditMode(false);
                setEditingField(null);
                return;
            }
            
            setIsTogglingEdit(true);
            try {
                const formData = new FormData();
                formData.append('firstName', userData.firstName);
                formData.append('lastName', userData.lastName);
                
                if (profilePicFile) {
                    formData.append('profilePic', profilePicFile);
                }
                
                const response = await updateProfile(formData);
                
                ToastNotification(response.message || "Profile updated successfully", "success");
                setProfilePicFile(null);
                
                setOriginalData({
                    firstName: userData.firstName,
                    lastName: userData.lastName
                });
                
                const profileResponse = await getProfile();
                const profile = profileResponse.data.profile;
                setUserData(prev => ({
                    ...prev,
                    profilePic: profile.profile_pic || prev.profilePic
                }));
                
                setIsEditMode(false);
                setEditingField(null);
            } catch (error) {
                console.error('Error updating profile:', error);
                ToastNotification(error.response?.data?.message || "Failed to update profile", "error");
            } finally {
                setIsTogglingEdit(false);
            }
        } else {
            setIsEditMode(true);
        }
    }

    return (
        <div className="bg-background py-5">
        {loading ? (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white border border-secondary rounded-large shadow-sm p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <SkeletonAvatar variant="large" />
                            <SkeletonLine variant="medium" width="1/3" />
                        </div>
                        <SkeletonLine variant="small" width="1/4" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <SkeletonLine variant="small" width="1/3" />
                            <div className="mt-2">
                                <SkeletonLine variant="medium" width="full" />
                            </div>
                        </div>
                        <div>
                            <SkeletonLine variant="small" width="1/3" />
                            <div className="mt-2">
                                <SkeletonLine variant="medium" width="full" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <SkeletonLine variant="small" width="1/2" />
                            <div className="mt-2">
                                <SkeletonLine variant="medium" width="full" />
                            </div>
                        </div>
                        <div>
                            <SkeletonLine variant="small" width="1/2" />
                            <div className="mt-2">
                                <SkeletonLine variant="medium" width="full" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <SkeletonLine variant="small" width="1/4" />
                        <div className="mt-2">
                            <SkeletonBlock variant="medium" height="medium" />
                        </div>
                    </div>
                </div>
            </div>
        ) : (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-secondary rounded-large shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                <div className="relative">
                    {userData.profilePic ? (
                    <img
                        src={userData.profilePic}
                        alt="Profile"
                        onClick={(e) => { e.stopPropagation(); setShowProfileModal(true); }}
                        className="w-20 h-20 rounded-full object-cover border-2 border-secondary cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    ) : (
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center border-2 border-secondary">
                        <span className="text-white text-xl font-bold">
                        {getUserInitial()}
                        </span>
                    </div>
                    )}
                    {isEditMode && (
                    <>
                        <label
                            htmlFor="profile-pic-input"
                            className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out shadow-md"
                        >
                            <Camera size={14} isDarkTheme={true} />
                        </label>
                        {userData.profilePic && (
                            <button
                                type="button"
                                onClick={handleDeleteProfilePic}
                                className="absolute top-0 right-0 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 ease-in-out shadow-md"
                                title="Delete profile picture"
                            >
                                <Trash size={14} isDarkTheme={true} />
                            </button>
                        )}
                    </>
                    )}
                    <input
                    id="profile-pic-input"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleProfilePicChange}
                    className="hidden"
                    disabled={!isEditMode}
                    />
                </div>
                <div>
                    <p className="text-sm font-bold text-primary">Change Picture</p>
                </div>
                </div>

                <button
                onClick={toggleEditMode}
                disabled={isTogglingEdit}
                className={`px-4 py-2 rounded-large text-sm font-bold flex items-center gap-2 hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEditMode 
                    ? 'bg-secondary text-primary' 
                    : 'bg-primary text-white'
                }`}
                >
                <Edit size={16} isDarkTheme={!isEditMode} />
                {isTogglingEdit ? 'Saving...' : (isEditMode ? 'Done' : 'Edit')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    First Name
                </label>
                {editingField === "firstName" ? (
                    <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={tempFirstName}
                        onChange={function (e) {
                        setTempFirstName(e.target.value);
                        }}
                        className="flex-1 bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                    <button
                        onClick={function () {
                        handleCancelEdit("firstName");
                        }}
                        className="w-8 h-8 bg-error rounded-medium flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 ease-in-out"
                    >
                        <X size={16} isDarkTheme={true} />
                    </button>
                    <button
                        onClick={function () {
                        handleSaveClick("firstName");
                        }}
                        className="w-8 h-8 bg-primary rounded-medium flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 ease-in-out"
                    >
                        <Check size={16} isDarkTheme={true} />
                    </button>
                    </div>
                ) : (
                    <div
                    onClick={function () {
                        if (isEditMode) handleEditClick("firstName");
                    }}
                    className={`bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark ${
                        isEditMode ? 'cursor-pointer hover:bg-secondary' : ''
                    } transition-all duration-200`}
                    >
                    {userData.firstName}
                    </div>
                )}
                </div>

                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    Last Name
                </label>
                {editingField === "lastName" ? (
                    <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={tempLastName}
                        onChange={function (e) {
                        setTempLastName(e.target.value);
                        }}
                        className="flex-1 bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                    <button
                        onClick={function () {
                        handleCancelEdit("lastName");
                        }}
                        className="w-8 h-8 bg-error rounded-medium flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 ease-in-out"
                    >
                        <X size={16} isDarkTheme={true} />
                    </button>
                    <button
                        onClick={function () {
                        handleSaveClick("lastName");
                        }}
                        className="w-8 h-8 bg-primary rounded-medium flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 ease-in-out"
                    >
                        <Check size={16} isDarkTheme={true} />
                    </button>
                    </div>
                ) : (
                    <div
                    onClick={function () {
                        if (isEditMode) handleEditClick("lastName");
                    }}
                    className={`bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark ${
                        isEditMode ? 'cursor-pointer hover:bg-secondary' : ''
                    } transition-all duration-200`}
                    >
                    {userData.lastName}
                    </div>
                )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    Phone Number
                </label>
                {editingField === "phone" ? (
                    <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={tempPhone}
                        onChange={function (e) {
                        setTempPhone(e.target.value);
                        }}
                        className="flex-1 bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                    <button
                        onClick={function () {
                        handleCancelEdit("phone");
                        }}
                        className="w-8 h-8 bg-error rounded-medium flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 ease-in-out"
                    >
                        <X size={16} isDarkTheme={true} />
                    </button>
                    <button
                        onClick={function () {
                        handleSaveClick("phone");
                        }}
                        className="w-8 h-8 bg-primary rounded-medium flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 ease-in-out"
                    >
                        <Check size={16} isDarkTheme={true} />
                    </button>
                    </div>
                ) : (
                    <div
                    onClick={function () {
                        if (isEditMode) handleEditClick("phone");
                    }}
                    className={`bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark ${
                        isEditMode ? 'cursor-pointer hover:bg-secondary' : ''
                    } transition-all duration-200`}
                    >
                    {userData.phone}
                    </div>
                )}
                </div>

                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    Email Address
                </label>
                {editingField === "email" ? (
                    <div className="flex items-center gap-2">
                    <input
                        type="email"
                        value={tempEmail}
                        onChange={function (e) {
                        setTempEmail(e.target.value);
                        }}
                        className="flex-1 bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                    <button
                        onClick={function () {
                        handleCancelEdit("email");
                        }}
                        className="w-8 h-8 bg-error rounded-medium flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 ease-in-out"
                    >
                        <X size={16} isDarkTheme={true} />
                    </button>
                    <button
                        onClick={function () {
                        handleSaveClick("email");
                        }}
                        className="w-8 h-8 bg-primary rounded-medium flex items-center justify-center hover:scale-[0.99] active:scale-[0.99] focus:outline-none transition-all duration-200 ease-in-out"
                    >
                        <Check size={16} isDarkTheme={true} />
                    </button>
                    </div>
                ) : (
                    <div
                    onClick={function () {
                        if (isEditMode) handleEditClick("email");
                    }}
                    className={`bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark ${
                        isEditMode ? 'cursor-pointer hover:bg-secondary' : ''
                    } transition-all duration-200`}
                    >
                    {userData.email}
                    </div>
                )}
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                Certificates
                </label>
                <div
                onClick={function () {
                    navigate("/take-quiz");
                }}
                className="bg-secondary border border-secondary rounded-medium p-4 flex items-center justify-between cursor-pointer hover:bg-primary/5 transition-all duration-200 hover:scale-[0.99] active:scale-[0.99]"
                >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-medium flex items-center justify-center">
                    <Certificate size={20} defaultColor="#1E8E54" />
                    </div>
                    <div>
                    <p className="text-sm font-bold text-secondaryDark">{userData.certificate}</p>
                    <p className="text-xs text-secondaryDark/60">Verified credential</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">View certification</span>
                    <RightArrow size={14} defaultColor="#145B47" />
                </div>
                </div>
            </div>
            </div>
        </div>
        )}

        {showModal && (
            <UpdateContactInfo
            type={modalType}
            value={modalType === "phone" ? tempPhone : tempEmail}
            onClose={function () {
                setShowModal(false);
                setEditingField(null);
            }}
            onConfirm={handleModalConfirm}
            />
        )}

        {showProfileModal && userData.profilePic && (
            <ViewProfileModal
                imageUrl={userData.profilePic}
                onClose={() => setShowProfileModal(false)}
            />
        )}
        
        <ToastContainer />
        </div>
    );
}

export default AboutMe;