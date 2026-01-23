import { BiHomeAlt } from "react-icons/bi";
import { LuMap } from "react-icons/lu";
import { BiPlusCircle } from "react-icons/bi";
import { LuSettings } from "react-icons/lu";
import { RiChat1Line } from "react-icons/ri";
import { FaTasks } from "react-icons/fa";
import { ImStatsBars } from "react-icons/im";

// login/signUp
import { AiOutlineMobile } from "react-icons/ai";
import { MdOutlineEmail } from "react-icons/md";

import { MdOutlineCameraAlt } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";
import { FiCrosshair } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import { FaCheck } from "react-icons/fa6";
import { MdOutlinePeople } from "react-icons/md";
import { ImEarth } from "react-icons/im"; // near language swithing
import { MdBrightnessMedium } from "react-icons/md"; // dark/light
import { GrCertificate } from "react-icons/gr"; //certificate
import { IoSearch } from "react-icons/io5";
import { IoIosQrScanner } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5"; // X
import { RiExpandDiagonalLine } from "react-icons/ri" // for expanding screen
// arrows
import { FaChevronRight } from "react-icons/fa";
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";

// trashman
import { FaStar } from "react-icons/fa"; //ratings
import { MdQrCodeScanner } from "react-icons/md"; //QR

// trash routes
import { BsTruck } from "react-icons/bs";
import { TbRouteSquare } from "react-icons/tb";

//map zoom
import { MdAdd } from "react-icons/md";
import { RiSubtractLine } from "react-icons/ri";

//info
import { FaInfo } from "react-icons/fa6";

import { LuCalendarDays } from "react-icons/lu"; //calendar
import { MdLocationOn } from "react-icons/md"; // map pin
import { GoPencil } from "react-icons/go"; //edit --> pencil
import { LuFilter } from "react-icons/lu"; // filter cone
import { HiDownload } from "react-icons/hi"; // download
import { GrConfigure } from "react-icons/gr"; // configure
import { IoMdMore } from "react-icons/io"; // ... more

const defaultSize = 25;
const defaultColor = "black";
const DarkThemeColor = "#fff";
const OnpressColor = "#1E8E54";

// reusable function
function Icons(props) {
    var IconComponent = props.Icon;
    var size = props.size || defaultSize;
    var color = props.isPressed
        ? props.OnpressColor || OnpressColor
        : props.isDarkTheme
        ? props.DarkThemeColor || DarkThemeColor
        : props.defaultColor || defaultColor;
    
    return <IconComponent size={size} color={color} />;
}

export function Home({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={BiHomeAlt} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Map({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={LuMap} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Add({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={BiPlusCircle} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Settings({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={LuSettings} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function FeedBack({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={RiChat1Line} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Task({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FaTasks} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Stats({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={ImStatsBars} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Notification({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={IoMdNotificationsOutline} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function LogOut({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FiLogOut} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Mobile({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={AiOutlineMobile} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Email({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={MdOutlineEmail} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Camera({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={MdOutlineCameraAlt} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function People({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={MdOutlinePeople} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Language({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={ImEarth} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Brightness({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={MdBrightnessMedium} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Certificate({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={GrCertificate} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Search({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={IoSearch} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Location({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FiCrosshair} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Trash({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FiTrash2} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Check({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FaCheck} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Star({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FaStar} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function QR({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={MdQrCodeScanner} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

// arrows
export function RightArrow({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FaChevronRight} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function LeftArrow({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FaChevronLeft} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function UpArrow({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FaChevronUp} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function DownArrow({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FaChevronDown} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function QRScanner({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={IoIosQrScanner} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}
export function X({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={IoCloseSharp} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Expand({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={RiExpandDiagonalLine} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function TrashVehicle({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={BsTruck} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function TrashRoute({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={TbRouteSquare} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}
export function ZoomIn({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={MdAdd} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}
export function ZoomOut({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={RiSubtractLine} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}
export function Info({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={FaInfo} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}
export function Calendar({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={LuCalendarDays} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function MapPin({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={MdLocationOn} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Edit({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={GoPencil} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Filter({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={LuFilter} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Download({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={HiDownload} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}

export function Configure({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={GrConfigure} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}
export function More({ size, isPressed = false, isDarkTheme = false, defaultColor = "black", DarkThemeColor = "#fff", OnpressColor = "#1E8E54" }) {
    return <Icons Icon={IoMdMore} size={size} isPressed={isPressed} isDarkTheme={isDarkTheme} defaultColor={defaultColor} DarkThemeColor={DarkThemeColor} OnpressColor={OnpressColor} />;
}
