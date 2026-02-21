import React, { useState, useEffect } from "react";
import TNgovLogo from "../../../assets/TNgov.png";
import frontSvg from "../../../assets/front.svg";
import backSvg from "../../../assets/back.svg";
import ThemeStore from "../../../store/ThemeStore";
import place_holder from "../../../assets/avator_placeholder.png"
import { getIdCard } from "../../../services/features/idCardService";
import { SkeletonLine, SkeletonAvatar, SkeletonBlock, SkeletonCard } from "../../../components/skeleton";

export default function IdentityCard() {
    const { isDarkTheme } = ThemeStore();
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cardData, setCardData] = useState(null);

    useEffect(() => {
        const fetchIdCard = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getIdCard();
                
                const names = response?.fullName?.split(' ') || [];
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || '';
                
                setCardData({
                    firstName: firstName.toUpperCase(),
                    lastName: lastName.toUpperCase(),
                    position: 'Government Employee',
                    idNo: response.employeeId,
                    joinDate: new Date(response.issuedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }),
                    phone: response.phoneNumber,
                    profileImage: response.profilePic || place_holder,
                    qrData: response.qrCode,
                    address: response.address,
                    cardStatus: response.cardStatus,
                });
            } catch (err) {
                setError(err.message || 'Failed to load ID card');
            } finally {
                setLoading(false);
            }
        };

        fetchIdCard();
    }, []);

    function handleFlip() {
        setIsFlipped(function(prev) {
        return !prev;
        });
    }

    if (loading) {
        return (
            <div className={`min-h-screen transition-colors duration-300 ${isDarkTheme ? 'bg-darkBackground' : 'bg-background'}`}>
                <div className="relative z-10 min-h-screen">
                    {/* Header Section */}
                    <div className="text-center mb-12 max-w-full">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="w-12 h-12">
                                <img src={TNgovLogo} alt="TN Government" className="w-full h-full object-contain"/>
                            </div>
                            <div className="text-left">
                                <h1 className={`text-xl font-bold ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>Identity Card</h1>
                                <p className={`text-xs ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/70'}`}>Tamil Nadu Government</p>
                            </div>
                        </div>
                        <SkeletonLine variant="small" width="1/3" className="mx-auto" />
                    </div>

                    {/* Main Content Grid */}
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Left Side - ID Card Skeleton */}
                        <div className="flex flex-col items-center">
                            <div className="w-85 h-135">
                                <SkeletonBlock variant="large" height="xlarge" className="rounded-[36px]! h-135!" />
                            </div>
                            <SkeletonLine variant="small" width="3/4" className="mt-6" />
                        </div>

                        {/* Right Side - Information Cards Skeleton */}
                        <div className="space-y-6">
                            {/* Card Details Skeleton */}
                            <SkeletonCard variant="medium">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <SkeletonAvatar variant="medium" />
                                        <SkeletonLine variant="large" width="1/2" />
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="space-y-1">
                                                <SkeletonLine variant="small" width="1/4" />
                                                <SkeletonLine variant="medium" width="1/2" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SkeletonCard>

                            {/* Card Status Skeleton */}
                            <SkeletonCard variant="medium">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <SkeletonAvatar variant="medium" />
                                        <SkeletonLine variant="large" width="1/2" />
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center justify-between">
                                                <SkeletonLine variant="small" width="1/4" />
                                                <SkeletonLine variant="small" width="1/3" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SkeletonCard>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center ${isDarkTheme ? 'bg-darkBackground' : 'bg-background'}`}>
                <div className={`p-8 rounded-large shadow-lg border ${isDarkTheme ? 'bg-darkBackgroundSecondary border-darkBorder' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className={`text-lg font-semibold ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>Error Loading ID Card</h2>
                            <p className={`text-sm ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/70'}`}>{error}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-large hover:bg-primary/90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!cardData) {
        return null;
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${isDarkTheme ? 'bg-darkBackground' : 'bg-background'}`}>
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
            <div className={`absolute top-20 left-20 w-96 h-96 border-2 rounded-veryLarge transform rotate-12 ${isDarkTheme ? 'border-primaryLight' : 'border-primary'}`}></div>
            <div className={`absolute bottom-20 right-32 w-80 h-80 border-2 rounded-veryLarge transform -rotate-12 ${isDarkTheme ? 'border-primary' : 'border-primaryLight'}`}></div>
        </div>

        <div className="relative z-10 min-h-screen">
            {/* Header Section */}
            <div className="text-center mb-12 max-w-full">
            <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12">
                <img src={TNgovLogo} alt="TN Government" className="w-full h-full object-contain"/>
                </div>
                <div className="text-left">
                <h1 className={`text-xl font-bold ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>Identity Card</h1>
                <p className={`text-xs ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/70'}`}>Tamil Nadu Government</p>
                </div>
            </div>
            <p className={`text-xs ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/60'}`}>
                Official identification card for government employees. Click card to flip.
            </p>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - ID Card */}
            <div className="flex flex-col items-center">
                {/* Card Container */}
                <div className="perspective-container">
                <div
                    className={`card-container ${isFlipped ? "flipped" : ""}`}
                    onClick={handleFlip}
                >
                {/* Front Side */}
                <div className="card-face card-front relative overflow-hidden">
                    {/* SVG Background */}
                    <img 
                        src={frontSvg} 
                        alt="ID Card Front"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-start pt-8 px-8">
                        {/* Government Logo */}
                        <div className="mb-8">
                            <div className="w-17 h-17 bg-white rounded-full p-1.75 shadow-lg">
                                <img src={TNgovLogo} alt="TN Government" className="w-full h-full object-contain"/>
                            </div>
                        </div>

                        {/* Photo Circle */}
                        <div className="mb-8">
                            <div className="w-37.5 h-37.5 rounded-full border-[5px] border-[#43A047] overflow-hidden bg-white shadow-xl">
                                <img 
                                    src={cardData.profileImage} 
                                    alt={`${cardData.firstName} ${cardData.lastName}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Name and Position */}
                        <div className="text-center mb-6">
                            <h1 className="text-[19px] font-bold mb-1 leading-tight">
                                <span className="text-[#37474F]">{cardData.firstName} </span>
                                <span className="text-[#43A047]">{cardData.lastName}</span>
                            </h1>
                            <p className="text-[12px] text-[#6B7280] font-normal">{cardData.position}</p>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 px-4 w-full">
                            <div className="flex justify-between items-center">
                                <span className="text-[#43A047] font-semibold text-[12px]">ID no :</span>
                                <span className="text-[#37474F] font-medium text-[12px]">{cardData.idNo}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#43A047] font-semibold text-[12px]">Join Date :</span>
                                <span className="text-[#37474F] font-medium text-[12px]">{cardData.joinDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#43A047] font-semibold text-[12px]">Phone :</span>
                                <span className="text-[#37474F] font-medium text-[12px]">{cardData.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Side */}
                <div className="card-face card-back relative overflow-hidden">
                    {/* SVG Background */}
                    <img 
                        src={backSvg} 
                        alt="ID Card Back"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex flex-col px-8 py-10">
                        {/* Header */}
                        <div className="mb-5">
                            <h2 className="text-[16px] font-bold text-[#43A047]">Address:</h2>
                        </div>

                        {/* Address */}
                        <div className="flex-1 mb-8">
                            <p className="text-[12px] text-[#B0BEC5] leading-relaxed">
                                {cardData.address}
                            </p>
                        </div>

                        {/* Footer with Logo and QR */}
                        <div className="flex justify-between items-end">
                            <div className="w-15 h-15 bg-white rounded-full p-2.5 shadow-xl">
                                <img src={TNgovLogo} alt="TN Government" className="w-full h-full object-contain"/>
                            </div>
                            
                            <div className="w-21.25 h-21.25 bg-white p-1.5 rounded-md shadow-xl">
                                <img 
                                    src={cardData.qrData}
                                    alt="QR Code"
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>

                {/* Info Text Below Card */}
                <div className="mt-6 text-center max-w-md">
                <p className={`text-[11px] leading-relaxed ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/50'}`}>
                    This card is property of Tamil Nadu Government. If found, please return to the nearest government office.
                </p>
                </div>
            </div>

            {/* Right Side - Information Cards */}
            <div className="space-y-6">
                {/* Card Details */}
                <div className={`rounded-large p-6 shadow-lg border ${isDarkTheme ? 'bg-darkBackgroundSecondary border-darkBorder' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    </div>
                    <h2 className={`text-lg font-semibold ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>Card Details</h2>
                </div>
                <div className="space-y-3">
                    <div>
                    <p className={`text-xs ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/60'}`}>Full Name</p>
                    <p className={`text-sm font-medium ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>{`${cardData.firstName} ${cardData.lastName}`}</p>
                    </div>
                    <div>
                    <p className={`text-xs ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/60'}`}>Position</p>
                    <p className={`text-sm font-medium ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>{cardData.position}</p>
                    </div>
                    <div>
                    <p className={`text-xs ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/60'}`}>Employee ID</p>
                    <p className={`text-sm font-medium ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>{cardData.idNo}</p>
                    </div>
                    <div>
                    <p className={`text-xs ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/60'}`}>Contact Number</p>
                    <p className={`text-sm font-medium ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>{cardData.phone}</p>
                    </div>
                </div>
                </div>

                {/* Card Status */}
                <div className={`rounded-large p-6 shadow-lg border ${isDarkTheme ? 'bg-darkBackgroundSecondary border-darkBorder' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full ${cardData.cardStatus === 'Active' ? 'bg-success/10' : 'bg-error/10'} flex items-center justify-center`}>
                    <svg className={`w-5 h-5 ${cardData.cardStatus === 'Active' ? 'text-success' : 'text-error'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cardData.cardStatus === 'Active' ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                    </div>
                    <h2 className={`text-lg font-semibold ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>Card Status</h2>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/70'}`}>Status</span>
                    <span className={`px-3 py-1 ${cardData.cardStatus === 'Active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'} text-xs font-medium rounded-full`}>{cardData.cardStatus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkTheme ? 'text-darkTextSecondary' : 'text-secondaryDark/70'}`}>Issued Date</span>
                    <span className={`text-sm font-medium ${isDarkTheme ? 'text-darkTextPrimary' : 'text-secondaryDark'}`}>{cardData.joinDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                    
                    </div>
                </div>
                </div>

            </div>
            </div>
        </div>

        <style>{`
            .perspective-container {
            perspective: 1500px;
            cursor: pointer;
            }

            .card-container {
            width: 340px;
            height: 540px;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
            }

            .card-container.flipped {
            transform: rotateY(180deg);
            }

            .card-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 36px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }

            .card-front {
            background: white;
            }

            .card-back {
            transform: rotateY(180deg);
            }

            .card-container:active {
            transform: scale(0.98);
            }

            .card-container.flipped:active {
            transform: rotateY(180deg) scale(0.98);
            }
        `}</style>
        </div>
    );
}