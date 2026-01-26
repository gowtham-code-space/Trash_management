import React, { useState } from "react";
import { Location, Home, MapPin, Edit, Check, X } from "../../../../../assets/icons/icons";
import ToastNotification from "../../../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import UpdateAddressInfo from "../../../../../components/Modals/Settings/UpdateAddressInfo";

function Address() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const [addressData, setAddressData] = useState({
        district: "Chennai Central",
        wardNumber: "142 - T. Nagar",
        streetName: "North Usman Road",
        houseNumber: "No. 45/2, Green Apartments"
    });

    const [tempDistrict, setTempDistrict] = useState(addressData.district);
    const [tempWardNumber, setTempWardNumber] = useState(addressData.wardNumber);
    const [tempStreetName, setTempStreetName] = useState(addressData.streetName);
    const [tempHouseNumber, setTempHouseNumber] = useState(addressData.houseNumber);

    const districts = [
        "Chennai Central", "Chennai North", "Chennai South", "Tambaram",
        "Ambattur", "Alandur", "Pallavaram", "Sholinganallur"
    ];

    const wardNumbers = [
        "142 - T. Nagar", "143 - Kodambakkam", "144 - Nungambakkam",
        "145 - Anna Nagar", "146 - Vadapalani", "147 - Ashok Nagar",
        "148 - KK Nagar", "149 - Saidapet", "150 - Guindy"
    ];

    const streets = [
        "North Usman Road", "South Usman Road", "Rangarajapuram Main Road",
        "GN Chetty Road", "Habibullah Road", "Venkatanarayana Road",
        "Natesan Street", "Thanikachalam Road", "Duraisamy Street",
        "Bazullah Road"
    ];

    function handleEditButtonClick() {
        setShowModal(true);
    }

    function handleModalConfirm() {
        setShowModal(false);
        setIsEditMode(true);
    }

    function handleModalClose() {
        setShowModal(false);
    }

    function handleDoneClick() {
        setAddressData({
        district: tempDistrict,
        wardNumber: tempWardNumber,
        streetName: tempStreetName,
        houseNumber: tempHouseNumber
        });
        setIsEditMode(false);
        ToastNotification("Address updated successfully", "success");
    }

    function handleCancelEdit() {
        setTempDistrict(addressData.district);
        setTempWardNumber(addressData.wardNumber);
        setTempStreetName(addressData.streetName);
        setTempHouseNumber(addressData.houseNumber);
        setIsEditMode(false);
    }

    return (
        <div className="bg-background py-5">
        <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-secondary rounded-large shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-primary">Your Address</h3>
                {!isEditMode ? (
                <button
                    onClick={handleEditButtonClick}
                    className="px-4 py-2 rounded-large text-sm font-bold flex items-center gap-2 bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                >
                    <Edit size={16} isDarkTheme={true} />
                    Edit
                </button>
                ) : (
                <div className="flex items-center gap-2">
                    <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-large text-sm font-bold flex items-center gap-2 bg-secondary text-primary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    >
                    <X size={16} defaultColor="#145B47" />
                    Cancel
                    </button>
                    <button
                    onClick={handleDoneClick}
                    className="px-4 py-2 rounded-large text-sm font-bold flex items-center gap-2 bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out"
                    >
                    <Check size={16} isDarkTheme={true} />
                    Done
                    </button>
                </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    District
                </label>
                {isEditMode ? (
                    <select
                    value={tempDistrict}
                    onChange={function (e) {
                        setTempDistrict(e.target.value);
                    }}
                    className="w-full bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
                    >
                    {districts.map(function(district) {
                        return <option key={district} value={district}>{district}</option>;
                    })}
                    </select>
                ) : (
                    <div className="bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark">
                    {addressData.district}
                    </div>
                )}
                </div>

                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    Ward Number & Name
                </label>
                {isEditMode ? (
                    <select
                    value={tempWardNumber}
                    onChange={function (e) {
                        setTempWardNumber(e.target.value);
                    }}
                    className="w-full bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
                    >
                    {wardNumbers.map(function(ward) {
                        return <option key={ward} value={ward}>{ward}</option>;
                    })}
                    </select>
                ) : (
                    <div className="bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark">
                    {addressData.wardNumber}
                    </div>
                )}
                </div>

                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    Street Name
                </label>
                {isEditMode ? (
                    <select
                    value={tempStreetName}
                    onChange={function (e) {
                        setTempStreetName(e.target.value);
                    }}
                    className="w-full bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
                    >
                    {streets.map(function(street) {
                        return <option key={street} value={street}>{street}</option>;
                    })}
                    </select>
                ) : (
                    <div className="bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark">
                    {addressData.streetName}
                    </div>
                )}
                </div>

                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    House / Flat Number
                </label>
                {isEditMode ? (
                    <input
                    type="text"
                    value={tempHouseNumber}
                    onChange={function (e) {
                        setTempHouseNumber(e.target.value);
                    }}
                    className="w-full bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                ) : (
                    <div className="bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark">
                    {addressData.houseNumber}
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>

        {showModal && (
            <UpdateAddressInfo
            onClose={handleModalClose}
            onConfirm={handleModalConfirm}
            />
        )}
        
        <ToastContainer/>
        </div>
    );
}

export default Address;