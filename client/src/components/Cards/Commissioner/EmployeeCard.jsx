import { More, MapPin, Edit ,Transfer } from "../../../assets/icons/icons";


function EmployeeCard({ employee, onViewDetails, onTransfer, onEdit, isDarkTheme }) {
    function getStatusColor(status) {
        if (status === "Active") return "text-success";
        if (status === "Suspended") return "text-error";
        if (status === "On Leave") return "text-warning";
        return "text-secondaryDark";
    }

    function getRoleBg(role) {
        if (role === "Municipal Health Officer") return "bg-secondary text-primary";
        if (role === "Sanitary Inspector") return "bg-secondary text-primary";
        if (role === "Supervisor") return "bg-secondary text-primary";
        if (role === "Trash Collector") return "bg-secondary text-primary";
        return "bg-secondary text-secondaryDark";
    }

    return (
        <div className="bg-white p-4 rounded-large border border-secondary transition-all duration-200 ease-in-out">
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
            <img 
                src={employee.profile_pic || "https://via.placeholder.com/48"} 
                alt={employee.first_name}
                className="w-12 h-12 rounded-full object-cover"
            />
            <div>
                <h3 className="text-base font-bold text-secondaryDark">
                {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-xs text-secondaryDark">ID: {employee.id}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-small text-xs font-medium ${getRoleBg(employee.role)}`}>
                {employee.role}
                </span>
            </div>
            </div>
        </div>

        <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs">
            <MapPin size={16} isDarkTheme={isDarkTheme} defaultColor="#1E8E54" />
            <span className="text-secondaryDark">Zone: {employee.zone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
            <MapPin size={16} isDarkTheme={isDarkTheme} defaultColor="#1E8E54" />
            <span className="text-secondaryDark">
                Division: {employee.role === "MHO" ? "-" : employee.division}
            </span>
            </div>
            <div className="flex items-center justify-between text-xs">
            <span className="text-secondaryDark">Joined:</span>
            <span className="text-secondaryDark font-medium">{employee.joined}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
            <span className="text-secondaryDark">Status:</span>
            <span className={`font-medium ${getStatusColor(employee.status)}`}>
                {employee.status}
            </span>
            </div>
        </div>

        <div className="flex gap-2">
            <button
            onClick={() => onTransfer(employee)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-primary rounded-large text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
            >
            <Transfer size={16} color="#145B47" />
            <span>Transfer</span>
            </button>
            <button
            onClick={() => onEdit(employee)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-large text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
            >
            <Edit size={16} isDarkTheme={true} />
            <span>Edit</span>
            </button>
        </div>
        </div>
    );
}

export default EmployeeCard;