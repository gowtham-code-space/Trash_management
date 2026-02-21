import {UpArrow,DownArrow,RightArrow, MapPin} from "../../../assets/icons/icons"
import { useState } from "react";
import CurrentPriorityModal from "../../../components/Modals/SuperVisor/CurrentPriorityModal";
import ThemeStore from "../../../store/ThemeStore";
import { useNavigate } from "react-router-dom";

function TaskCard({ complaint }) {

    const { isDarkTheme } = ThemeStore();
    const navigate = useNavigate();

    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    function handleCloseModal() {
    setIsModalOpen(false);
    }
    function handlePriorityClick(complaint) {
        setSelectedComplaint(complaint);
        setIsModalOpen(true);
    }
    function getPriorityColor(level) {
        if (level === 1) return "bg-warning";
        if (level === 2) return "bg-[#FF8C42]";
        return "bg-error";
    }

    function getPriorityLabel(level) {
        if (level === 1) return "Level 1";
        if (level === 2) return "Level 2";
        return "Level 3";
    }

    function getStatusColor(status) {
        if (status === "COMPLETED" || status === "RESOLVED") return "bg-success text-white";
        if (status === "ASSIGNED") return "bg-primaryLight text-white";
        return "bg-warning text-white";
    }
    return (
        <div
            key={complaint.id}
            className=" my-3 bg-white rounded-veryLarge border-2 border-secondary hover:border-primaryLight overflow-hidden transition-all duration-200 ease-in-out shadow-sm"
        >
            <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-48 h-48 md:h-auto shrink-0 m-3">
                <img
                src={complaint.image}
                alt={complaint.title}
                className="w-full h-full object-cover rounded-medium"
                />
            </div>

            <div className="flex-1 p-5">
                <div className="flex flex-col h-full">
                <div className="flex-1 mb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-bold text-primary leading-tight">
                        {complaint.title}
                    </h3>
                    <button
                        onClick={() => handlePriorityClick(complaint)}
                        className={`${getPriorityColor(complaint.priority)} text-white px-3 py-1 rounded-medium text-xs font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out shrink-0`}
                    >
                        {getPriorityLabel(complaint.priority)}
                    </button>
                    </div>

                    <div className="space-y-1 mb-3">
                    <p className="text-xs text-secondaryDark">
                        {complaint.date}
                    </p>
                    <p className="text-sm text-secondaryDark">
                        Reported by <span className="font-semibold text-primary">{complaint.author}</span>
                    </p>
                    <p className="text-xs text-secondaryDark flex flex-row justify-start items-center">
                        <span className="mr-1"><MapPin size={18} defaultColor="#145B47"/> </span>{complaint.location}
                    </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-secondary">
                    <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-medium">
                        <UpArrow size={14} defaultColor="#1E8E54" />
                        <span className="text-xs font-semibold text-primary">{complaint.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-medium">
                        <DownArrow size={14} defaultColor="#E75A4C" />
                        <span className="text-xs font-semibold text-secondaryDark">{complaint.downvotes}</span>
                    </div>
                    <span className={`${getStatusColor(complaint.status)} px-3 py-1 rounded-medium text-xs font-medium`}>
                        {complaint.status}
                    </span>
                    </div>

                    <button
                    onClick={() =>navigate("/assign-task")}
                    className="bg-primary text-white px-5 py-2 rounded-medium text-xs font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out flex items-center gap-2"
                    >
                    <span>View Details</span>
                    <RightArrow size={14} isDarkTheme={true} />
                    </button>
                </div>
                </div>
            </div>
            </div>
        <CurrentPriorityModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            complaint={selectedComplaint}
            isDarkTheme={isDarkTheme}
        />

        </div>
    );
}
export default TaskCard