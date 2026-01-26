import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Certificate, Check, RightArrow, Edit, X } from "../../../../../assets/icons/icons";
import ToastNotification from "../../../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import UpdateContactInfo from "../../../../../components/Modals/Settings/UpdateContactInfo";

function AboutMe() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [userData, setUserData] = useState({
        firstName: "Arjun",
        lastName: "Kumar",
        phone: "+91 98765 43210",
        email: "arjun.k@greencity.in",
        profilePic: null,
        certificate: "View your certifications"
    });

    const [editingField, setEditingField] = useState(null);
    const [tempFirstName, setTempFirstName] = useState(userData.firstName);
    const [tempLastName, setTempLastName] = useState(userData.lastName);
    const [tempPhone, setTempPhone] = useState(userData.phone);
    const [tempEmail, setTempEmail] = useState(userData.email);

    function handleProfilePicChange(e) {
        const file = e.target.files[0];
        if (file) {
        if (!file.type.startsWith('image/')) {
            ToastNotification("Please select a valid image file", "error");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = function () {
            setUserData(function (prev) {
            return { ...prev, profilePic: reader.result };
            });
            ToastNotification("Profile picture updated successfully", "success");
        };
        reader.readAsDataURL(file);
        }
    }

    function handleEditClick(field) {
        setEditingField(field);
        if (field === "firstName") setTempFirstName(userData.firstName);
        if (field === "lastName") setTempLastName(userData.lastName);
        if (field === "phone") setTempPhone(userData.phone);
        if (field === "email") setTempEmail(userData.email);
    }

    function handleSaveClick(field) {
        if (field === "firstName" || field === "lastName") {
        setUserData(function (prev) {
            return {
            ...prev,
            firstName: field === "firstName" ? tempFirstName : prev.firstName,
            lastName: field === "lastName" ? tempLastName : prev.lastName
            };
        });
        setEditingField(null);
        ToastNotification("Name updated successfully", "success");
        } else if (field === "phone") {
        setModalType("phone");
        setShowModal(true);
        } else if (field === "email") {
        setModalType("email");
        setShowModal(true);
        }
    }

    function handleCancelEdit(field) {
        setEditingField(null);
        if (field === "firstName") setTempFirstName(userData.firstName);
        if (field === "lastName") setTempLastName(userData.lastName);
        if (field === "phone") setTempPhone(userData.phone);
        if (field === "email") setTempEmail(userData.email);
    }

    function handleModalConfirm() {
        if (modalType === "phone") {
        setUserData(function (prev) {
            return { ...prev, phone: tempPhone };
        });
        ToastNotification("Phone number updated successfully", "success");
        } else if (modalType === "email") {
        setUserData(function (prev) {
            return { ...prev, email: tempEmail };
        });
        ToastNotification("Email address updated successfully", "success");
        }
        setShowModal(false);
        setEditingField(null);
        setIsEditMode(false);
    }

    function getUserInitial() {
        return userData.firstName.charAt(0).toUpperCase();
    }

    function toggleEditMode() {
        setIsEditMode(function (prev) {
        return !prev;
        });
        setEditingField(null);
    }

    return (
        <div className="bg-background py-5">
        <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-secondary rounded-large shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                <div className="relative">
                    {userData.profilePic ? (
                    <img
                        src={userData.profilePic}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-secondary"
                    />
                    ) : (
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center border-2 border-secondary">
                        <span className="text-white text-xl font-bold">
                        {getUserInitial()}
                        </span>
                    </div>
                    )}
                    {isEditMode && (
                    <label
                        htmlFor="profile-pic-input"
                        className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out shadow-md"
                    >
                        <Camera size={14} isDarkTheme={true} />
                    </label>
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
                    <p className="text-xs text-secondaryDark/60">JPG, GIF or PNG</p>
                </div>
                </div>

                <button
                onClick={toggleEditMode}
                className={`px-4 py-2 rounded-large text-sm font-bold flex items-center gap-2 hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out ${
                    isEditMode 
                    ? 'bg-secondary text-primary' 
                    : 'bg-primary text-white'
                }`}
                >
                <Edit size={16} isDarkTheme={!isEditMode} />
                {isEditMode ? 'Done' : 'Edit'}
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
        <ToastContainer />
        </div>
    );
}

export default AboutMe;