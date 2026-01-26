import React, { useState } from "react";
import ThemeStore from "../../../store/ThemeStore";
import CurrentPriorityModal from "../../../components/Modals/SuperVisor/CurrentPriorityModal";
import CalendarModal from "../../../components/Modals/Calendar/CalendarModal";
import Pagination from "../../../utils/Pagination";
import { Search ,Calendar} from "../../../assets/icons/icons";
import TaskCard from "../../../components/Cards/Supervisor/TaskCard";

function AllTasks() {
    const { isDarkTheme } = ThemeStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const allComplaints = [
        {
            id: 1,
            title: "Overflowing Bin",
            date: "2026-01-09 04:15 PM",
            author: "Rajesh",
            role: "Resident",
            status: "RESOLVED",
            priority: 3,
            location: "MG Road, Bangalore",
            trashType: "Mixed Waste",
            description: "The bin near the bus stop has been overflowing for three days. It's causing a foul smell and attracting stray animals. Immediate action is required to clean and empty the bin. The bin near the bus stop has been overflowing for three days. It's causing a foul smell and attracting stray animals. Immediate action is required to clean and empty the bin. The bin near the bus stop has been overflowing for three days. It's causing a foul smell and attracting stray animals. Immediate action is required to clean and empty the bin.",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
            upvotes: 42,
            downvotes: 8
        },
        {
            id: 2,
            title: "Illegal Dumping",
            date: "2026-01-08 03:30 PM",
            author: "Suresh",
            role: "Sanitary Inspector",
            status: "RESOLVED",
            priority: 2,
            location: "Brigade Road, Bangalore",
            trashType: "Construction Debris",
            description: "Construction debris has been illegally dumped on the roadside. This is blocking pedestrian movement and creating safety hazards.",
            image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&h=300&fit=crop",
            upvotes: 35,
            downvotes: 5
        },
        {
        id: 3,
        title: "Illegal Dumping",
        date: "2026-01-08 03:30 PM",
        author: "Suresh",
        role: "Municipal Health Officer (MHO)",
        status: "PENDING",
        priority: 1,
        location: "Indiranagar, Bangalore",
        trashType: "Plastic Waste",
        description: "Large amounts of plastic waste have been found dumped in the park area. Need immediate cleanup and investigation.",
        image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400&h=300&fit=crop",
        upvotes: 28,
        downvotes: 12
        },
        {
        id: 4,
        title: "Broken Waste Container",
        date: "2026-01-07 02:15 PM",
        author: "Priya",
        role: "Resident",
        status: "ASSIGNED",
        priority: 2,
        location: "Koramangala, Bangalore",
        trashType: "General Waste",
        description: "The waste container is broken and needs replacement. Waste is spilling out onto the street.",
        image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&h=300&fit=crop",
        upvotes: 19,
        downvotes: 3
        },
        {
        id: 5,
        title: "Medical Waste Disposal",
        date: "2026-01-07 11:00 AM",
        author: "Dr. Kumar",
        role: "Sanitary Inspector",
        status: "COMPLETED",
        priority: 3,
        location: "Whitefield, Bangalore",
        trashType: "Medical Waste",
        description: "Medical waste found improperly disposed near residential area. Requires immediate specialized cleanup.",
        image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=300&fit=crop",
        upvotes: 56,
        downvotes: 2
        },
        {
        id: 6,
        title: "Street Littering",
        date: "2026-01-06 05:30 PM",
        author: "Anita",
        role: "Resident",
        status: "PENDING",
        priority: 1,
        location: "JP Nagar, Bangalore",
        trashType: "Food Waste",
        description: "Excessive littering on the street after market hours. Need regular cleaning schedule.",
        image: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400&h=300&fit=crop",
        upvotes: 15,
        downvotes: 7
        },
        {
        id: 7,
        title: "Abandoned Vehicle Waste",
        date: "2026-01-06 10:00 AM",
        author: "Ramesh",
        role: "Municipal Health Officer (MHO)",
        status: "ASSIGNED",
        priority: 2,
        location: "Electronic City, Bangalore",
        trashType: "Hazardous Waste",
        description: "Abandoned vehicle leaking fluids and creating environmental hazard.",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
        upvotes: 31,
        downvotes: 4
        },
        {
        id: 8,
        title: "Park Area Cleanup",
        date: "2026-01-05 03:45 PM",
        author: "Lakshmi",
        role: "Resident",
        status: "COMPLETED",
        priority: 1,
        location: "Cubbon Park, Bangalore",
        trashType: "General Waste",
        description: "Park needs general cleanup after weekend visitors left trash behind.",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
        upvotes: 22,
        downvotes: 6
        }
    ];

    const filteredComplaints = allComplaints.filter((complaint) => {
        const matchesSearch = 
        complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.author.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDate = !selectedDate || 
        new Date(complaint.date).toDateString() === selectedDate.toDateString();
        
        return matchesSearch && matchesDate;
    });

    function handleDateSelect(date) {
        setSelectedDate(date);
    }

    function formatDate(date) {
        return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
        });
    }

    return (
        <div className={isDarkTheme ? "dark" : ""}>
                    <div className="mt-8 bg-secondary rounded-veryLarge p-6 border-2 border-primary mb-5">
                <h2 className="text-lg font-bold text-primary mb-4">Priority Level Guide</h2>
                <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <span className="bg-warning text-white px-3 py-1 rounded-medium text-xs font-medium shrink-0">
                    Level 1
                    </span>
                    <p className="text-sm text-secondaryDark">
                    <span className="font-semibold text-primary">Resident ⟶ supervisor: </span>
                    Issues requiring attention within 3 days. failing to complete, will forward to Sanitary inspector (SI)
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <span className="bg-[#FF8C42] text-white px-3 py-1 rounded-medium text-xs font-medium shrink-0">
                    Level 2
                    </span>
                    <p className="text-sm text-secondaryDark">
                    <span className="font-semibold text-primary">Sanitary inspector (SI) ⟶ supervisor: </span>
                    Issues requiring attention within 2 days. failing to complete, will forward to Municipal Health Officer (MHO)
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <span className="bg-error text-white px-3 py-1 rounded-medium text-xs font-medium shrink-0">
                    Level 3
                    </span>
                    <p className="text-sm text-secondaryDark">
                    <span className="font-semibold text-primary">Municipal Health Officer (MHO) ⟶ Sanitary inspector (SI): </span>
                    Issues requiring attention within 1 day. failing to complete, results in remarks
                    </p>
                </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto">
                <div className="sticky z-10 -top-8 bg-background py-5 -mx-1 flex flex-row gap-3">
                    <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by title, location, or reporter..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border-2 border-secondary rounded-large px-4 py-3 pl-12 text-sm text-secondaryDark placeholder-secondaryDark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ease-in-out"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Search size={20} defaultColor="#316F5D" isDarkTheme={isDarkTheme} />
                    </div>
                    </div>
                        <div
                        onClick={() => setIsCalendarOpen(true)}
                        className="flex flex-row bg-primary border-2 border-secondary px-4 py-3 rounded-large text-sm text-white font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out whitespace-nowrap"
                        >
                            <div className="mr-2">
                                <Calendar size={20} defaultColor="white" isDarkTheme={isDarkTheme}/>
                            </div>
                            {selectedDate ? formatDate(selectedDate) : "Pick Date"}
                        </div>
                </div>

            {filteredComplaints.length === 0 ? (
                <div className="bg-secondary rounded-veryLarge p-8 text-center">
                <p className="text-secondaryDark text-base">No complaints found matching your criteria.</p>
                </div>
            ) : (
                <div className="space-y-4 mb-6">
                <Pagination
                    data={filteredComplaints}
                    itemsPerPage={6}
                    renderItem={(complaint) => (
                        <TaskCard key={complaint.id} complaint={complaint} />
                    )}
                    gridDisplay={false}
                />
                </div>
            )}
            </div>

        <CurrentPriorityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            complaint={selectedComplaint}
            isDarkTheme={isDarkTheme}
        />

        <CalendarModal
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
            onDateSelect={handleDateSelect}
            isDarkTheme={isDarkTheme}
        />
        </div>
    );
}

export default AllTasks;