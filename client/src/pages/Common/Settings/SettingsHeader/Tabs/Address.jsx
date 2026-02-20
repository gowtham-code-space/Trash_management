import React, { useState, useEffect } from "react";
import { Location, Home, MapPin, Edit, Check, X } from "../../../../../assets/icons/icons";
import ToastNotification from "../../../../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import UpdateAddressInfo from "../../../../../components/Modals/Settings/UpdateAddressInfo";
import { getAddress, updateAddress } from "../../../../../services/features/settingsService";
import { getDistricts, getWardsByDistrict, getStreetsByWard } from "../../../../../services/features/authService";
import { SkeletonLine } from "../../../../../components/skeleton";

function Address() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [canEdit, setCanEdit] = useState(true);
    const [nextEditDate, setNextEditDate] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    
    const [addressData, setAddressData] = useState({
        districtId: null,
        districtName: "",
        wardId: null,
        wardName: "",
        streetId: null,
        streetName: "",
        houseNumber: ""
    });

    const [tempDistrictId, setTempDistrictId] = useState(null);
    const [tempWardId, setTempWardId] = useState(null);
    const [tempStreetId, setTempStreetId] = useState(null);
    const [tempHouseNumber, setTempHouseNumber] = useState("");

    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [streets, setStreets] = useState([]);

    useEffect(function () {
        fetchAddress();
    }, []);

    async function fetchAddress() {
        try {
            const response = await getAddress();
            if (response.success) {
                const addr = response.data;
                setAddressData({
                    districtId: addr.district_id,
                    districtName: addr.district || "",
                    wardId: addr.ward_id,
                    wardName: addr.ward_number && addr.ward_name ? `${addr.ward_number} - ${addr.ward_name}` : "",
                    streetId: addr.street_id,
                    streetName: addr.street_name || "",
                    houseNumber: addr.house_number || ""
                });
                
                if (addr.last_address_change) {
                    const lastChange = new Date(addr.last_address_change);
                    const nextAllowed = new Date(lastChange);
                    nextAllowed.setMonth(nextAllowed.getMonth() + 1);
                    
                    if (new Date() < nextAllowed) {
                        setCanEdit(false);
                        setNextEditDate(nextAllowed);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            ToastNotification(error.response?.data?.message || "Failed to load address", "error");
        } finally {
            setLoading(false);
        }
    }

    async function handleEditButtonClick() {
        if (!canEdit) return;
        setShowModal(true);
    }

    async function handleModalConfirm() {
        setShowModal(false);
        setIsLoadingEdit(true);
        
        setTempDistrictId(addressData.districtId);
        setTempWardId(addressData.wardId);
        setTempStreetId(addressData.streetId);
        setTempHouseNumber(addressData.houseNumber);
        
        try {
            const districtsData = await getDistricts();
            if (districtsData.success) {
                setDistricts(districtsData.data);
            }
            
            if (addressData.districtId) {
                const wardsData = await getWardsByDistrict(addressData.districtId);
                if (wardsData.success) {
                    setWards(wardsData.data);
                }
            }
            
            if (addressData.wardId) {
                const streetsData = await getStreetsByWard(addressData.wardId);
                if (streetsData.success) {
                    setStreets(streetsData.data);
                }
            }
            
            setIsEditMode(true);
        } catch (error) {
            console.error('Error loading dropdowns:', error);
        } finally {
            setIsLoadingEdit(false);
        }
    }

    function handleModalClose() {
        setShowModal(false);
    }

    async function handleDistrictChange(e) {
        const districtId = parseInt(e.target.value);
        setTempDistrictId(districtId);
        setTempWardId(null);
        setTempStreetId(null);
        setWards([]);
        setStreets([]);
        
        if (districtId) {
            try {
                const wardsData = await getWardsByDistrict(districtId);
                if (wardsData.success) {
                    setWards(wardsData.data);
                }
            } catch (error) {
                console.error('Error fetching wards:', error);
            }
        }
    }

    async function handleWardChange(e) {
        const wardId = parseInt(e.target.value);
        setTempWardId(wardId);
        setTempStreetId(null);
        setStreets([]);
        
        if (wardId) {
            try {
                const streetsData = await getStreetsByWard(wardId);
                if (streetsData.success) {
                    setStreets(streetsData.data);
                }
            } catch (error) {
                console.error('Error fetching streets:', error);
            }
        }
    }

    async function handleDoneClick() {
        setIsUpdating(true);
        try {
            const response = await updateAddress({
                district_id: tempDistrictId,
                ward_id: tempWardId,
                street_id: tempStreetId,
                house_number: tempHouseNumber
            });
            
            if (response.sameAsPrevious) {
                ToastNotification(response.message || "Fields same as previous values", "info");
                setIsEditMode(false);
            } else if (response.success) {
                ToastNotification("Address updated successfully", "success");
                setIsEditMode(false);
                await fetchAddress();
            }
        } catch (error) {
            console.error('Error updating address:', error);
            ToastNotification(error.response?.data?.message || "Failed to update address", "error");
        } finally {
            setIsUpdating(false);
        }
    }

    function handleCancelEdit() {
        setTempDistrictId(addressData.districtId);
        setTempWardId(addressData.wardId);
        setTempStreetId(addressData.streetId);
        setTempHouseNumber(addressData.houseNumber);
        setIsEditMode(false);
        setDistricts([]);
        setWards([]);
        setStreets([]);
    }

    if (loading) {
        return (
            <div className="bg-background py-5">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white border border-secondary rounded-large shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <SkeletonLine variant="large" width="1/3" />
                            <SkeletonLine variant="medium" width="1/4" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <SkeletonLine variant="small" width="1/3" />
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
                            <div>
                                <SkeletonLine variant="small" width="1/3" />
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
                    </div>
                </div>
            </div>
        );
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
                    disabled={isLoadingEdit || !canEdit}
                    className="px-4 py-2 rounded-large text-sm font-bold flex items-center gap-2 bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Edit size={16} isDarkTheme={true} />
                    {isLoadingEdit ? 'Loading...' : (!canEdit && nextEditDate ? `Can edit on ${nextEditDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Edit')}
                </button>
                ) : (
                <div className="flex items-center gap-2">
                    <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-large text-sm font-bold flex items-center gap-2 bg-secondary text-primary hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <X size={16} defaultColor="#145B47" />
                    Cancel
                    </button>
                    <button
                    onClick={handleDoneClick}
                    disabled={isUpdating || !tempDistrictId || !tempWardId || !tempStreetId || !tempHouseNumber}
                    className="px-4 py-2 rounded-large text-sm font-bold flex items-center gap-2 bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <Check size={16} isDarkTheme={true} />
                    {isUpdating ? "Saving..." : "Done"}
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
                    value={tempDistrictId || ""}
                    onChange={handleDistrictChange}
                    className="w-full bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
                    >
                    <option value="">Select District</option>
                    {districts.map(function(district) {
                        return <option key={district.district_id} value={district.district_id}>{district.district_name}</option>;
                    })}
                    </select>
                ) : (
                    <div className="bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark">
                    {addressData.districtName || "Not set"}
                    </div>
                )}
                </div>

                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    Ward Number & Name
                </label>
                {isEditMode ? (
                    <select
                    value={tempWardId || ""}
                    onChange={handleWardChange}
                    disabled={!tempDistrictId}
                    className="w-full bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <option value="">Select Ward</option>
                    {wards.map(function(ward) {
                        return <option key={ward.ward_id} value={ward.ward_id}>{ward.ward_number} - {ward.ward_name}</option>;
                    })}
                    </select>
                ) : (
                    <div className="bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark">
                    {addressData.wardName || "Not set"}
                    </div>
                )}
                </div>

                <div>
                <label className="text-xs font-semibold text-secondaryDark/60 mb-2 block">
                    Street Name
                </label>
                {isEditMode ? (
                    <select
                    value={tempStreetId || ""}
                    onChange={function(e) { setTempStreetId(parseInt(e.target.value)); }}
                    disabled={!tempWardId}
                    className="w-full bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <option value="">Select Street</option>
                    {streets.map(function(street) {
                        return <option key={street.street_id} value={street.street_id}>{street.street_name}</option>;
                    })}
                    </select>
                ) : (
                    <div className="bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark">
                    {addressData.streetName || "Not set"}
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
                    placeholder="Enter house/flat number"
                    />
                ) : (
                    <div className="bg-background border border-secondary rounded-medium px-3 py-2 text-sm text-secondaryDark">
                    {addressData.houseNumber || "Not set"}
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