import { More, MapPin, Edit ,Transfer } from "../../../assets/icons/icons";
import { useTranslation } from "react-i18next";


function EmployeeCard({ employee, onViewDetails, onTransfer, onEdit, isDarkTheme }) {
    const { t } = useTranslation(["pages", "common"]);

    function getStatusText(status) {
        if (status === "Active") return t('common:active');
        if (status === "Suspended") return t('common:suspended');
        if (status === "On Leave") return t('common:on_leave');
        if (status === "Resigned") return t('common:resigned');
        return status;
    }

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
            <span className="text-secondaryDark">{t('pages:cards.employee.zone')} {employee.zone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
            <MapPin size={16} isDarkTheme={isDarkTheme} defaultColor="#1E8E54" />
            <span className="text-secondaryDark">
                {t('pages:cards.employee.division')} {employee.role === "MHO" ? "-" : employee.division}
            </span>
            </div>
            <div className="flex items-center justify-between text-xs">
            <span className="text-secondaryDark">{t('pages:cards.employee.joined')}</span>
            <span className="text-secondaryDark font-medium">{employee.joined}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
            <span className="text-secondaryDark">{t('pages:cards.employee.status')}</span>
            <span className={`font-medium ${getStatusColor(employee.status)}`}>
                {getStatusText(employee.status)}
            </span>
            </div>
        </div>

        <div className="flex gap-2">
            <button
            onClick={() => onTransfer(employee)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-primary rounded-large text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
            >
            <Transfer size={16} color="#145B47" />
            <span>{t('pages:cards.employee.transfer')}</span>
            </button>
            <button
            onClick={() => onEdit(employee)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-large text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
            >
            <Edit size={16} isDarkTheme={true} />
            <span>{t('pages:cards.employee.edit')}</span>
            </button>
        </div>
        </div>
    );
}

export default EmployeeCard;