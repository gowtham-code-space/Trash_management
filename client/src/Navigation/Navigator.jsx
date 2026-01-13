import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SideTab from "../components/SideTab/SideTab";
import Login from "../pages/Common/Login/Login";
import Signup from "../pages/Common/Signup/Signup";

//residents
import Home from "../pages/Residents/Home";
import Map from "../pages/Residents/Map";
import ReportTrash from "../pages/Residents/ReportTrash";
import TrashDetails from "../pages/Residents/TrashDetails"
import Feedback from "../pages/Residents/Feedback";
import Settings from "../pages/Residents/Settings";
import ResidentStats from "../pages/Residents/ResidentStats";
import RouteTimings from "../pages/Common/RouteTimings/RouteTimings";

//Quiz
import Quiz from "../pages/Common/Quiz/Quiz";
import TakeQuiz from "../pages/Common/Quiz/TakeQuiz";

//TrashMan
import TrashManDashboard from "../pages/TrashMan/TrashManDashBoard";
import UploadAttendance from "../pages/TrashMan/Attendance/UploadAttendance";
import TrashManFeedBack from "../pages/TrashMan/TrashmanFeedback";
import ImmediateTasks from "../pages/TrashMan/ImmediateTasks/ImmediateTasks";
import TrashmanStats from "../pages/TrashMan/TrashmanStats";

//Supervisor
import SupervisorDashboard from "../pages/Supervisor/SupervisorDashBoard";
import AllTasks from "../pages/Supervisor/Task/AllTasks";
import AssignTask from "../pages/Supervisor/Task/AssignTask";
import Attendance from "../pages/Supervisor/Attendance";

//Id card
import IdentityCard from "../pages/Common/IdentityCard/IdentityCard";

//search workers
import SearchWorkers from "../pages/Common/SearchWorkers/SearchWorkers";

// sanitary inspector
import SupervisorStats from "../pages/Supervisor/SupervisorStats";
import InspectorDashboard from "../pages/SanitoryInspector/InspectorDashBoard";
import InspectorAttendance from "../pages/SanitoryInspector/InspectorAttendance";

//404
import FileNotFound from "../pages/Common/404/FileNotFound";
import StatsHeader from "../pages/SanitoryInspector/StatsHeader/StatsHeader";






// Mock User - Change role to test: "Resident", "TrashMan", "SuperVisor", "SanitaryInspector", "MHO"
const mockUser = { role: "SanitaryInspector", name: "Alex Rivera" };

function Navigator() {
return (
    <Router>
    <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />

        {/* ROLE-BASED PROTECTED ROUTES */}
        <Route path="/" element={<SideTab user={mockUser} />}>
        
        {/* RESIDENT ROUTES */}
        {mockUser?.role === "Resident" && (
            <>
            <Route index element={<Home/>} />
            <Route path="map" element={<Map/>} />
            <Route path="report-trash" element={<ReportTrash/>} />
            <Route path="route-timings" element={<RouteTimings/>} />
            <Route path="trash-details" element={<TrashDetails/>} />
            <Route path="my-stats" element={<ResidentStats/>} />
            <Route path="quiz" element={<Quiz/>} />
            <Route path="take-quiz" element={<TakeQuiz/>} />
            <Route path="submit-feedback" element={<Feedback/>} />
            <Route path="settings" element={<Settings/>} />
            </>
        )}

        {/* TRASH MAN ROUTES */}
        {mockUser?.role === "TrashMan" && (
            <>
            <Route index element={<TrashManDashboard/>} />
            <Route path="route-timings" element={<RouteTimings/>} />
            <Route path="immediate-tasks" element={<ImmediateTasks/>} />
            <Route path="upload-attendance" element={<UploadAttendance/>} />
            <Route path="my-stats" element={<TrashmanStats/>} />
            <Route path="create-feedback-session" element={<TrashManFeedBack/>} />
            <Route path="submit-feedback" element={<Feedback/>} />
            <Route path="quiz" element={<Quiz/>} />
            <Route path="take-quiz" element={<TakeQuiz/>} />
            <Route path="settings" element={<Settings/>} />
            <Route path="id-card" element={<IdentityCard/>} />
            </>
        )}

        {/* SUPERVISOR */}
        {mockUser?.role === "SuperVisor" && (
            <>
            <Route index element={<SupervisorDashboard/>} />
            <Route path="trashman-stats" element={<TrashmanStats/>} />
            <Route path="attendance" element={<Attendance/>} />
            <Route path="create-feedback-session" element={<TrashManFeedBack/>} />
            <Route path="submit-feedback" element={<Feedback/>} />
            <Route path="all-tasks" element={<AllTasks/>}/>
            <Route path="assign-task" element={<AssignTask/>}/>
            <Route path="my-stats" element={<SupervisorStats/>} />
            <Route path="id-card" element={<IdentityCard/>} />
            <Route path="search-workers" element={<SearchWorkers/>} />
            <Route path="take-quiz" element={<Quiz/>} />
            <Route path="settings" element={<Settings/>} />
            </>
        )}
        {/* SANITARY INSPECTOR */}
        { mockUser?.role === "SanitaryInspector" && (
            <>
            <Route index element={<InspectorDashboard/>} />
            <Route path="attendance" element={<InspectorAttendance/>} />
            <Route path="immediate-tasks" element={<div>Task Assignment</div>} />
            <Route path="trashman-stats" element={<TrashmanStats/>} />
            <Route path="supervisor-stats" element={<SupervisorStats/>} />
            <Route path="all-tasks" element={<AllTasks/>}/>
            <Route path="overall-stats" element={<StatsHeader/>} />
            <Route path="id-card" element={<IdentityCard/>} />
            <Route path="search-workers" element={<SearchWorkers/>} />
            <Route path="settings" element={<Settings/>} />
            </>
        )}
        {/* MHO ROUTES */}
        {mockUser?.role === "MHO" && (
            <>
            <Route index element={<div>Health Officer Dashboard</div>} />
            <Route path="immediate-tasks" element={<div>Priority Tasks</div>} />
            <Route path="trashman-stats" element={<div>Attendance Logs</div>} />
            <Route path="supervisor-stats" element={<div>Attendance Logs</div>} />
            <Route path="inspector-stats" element={<div>inspector stats</div>} />
            <Route path="my-stats" element={<div>City-wide Analytics</div>} />
            <Route path="zones" element={<div>Zone Management</div>} />
            <Route path="settings" element={<div>System Settings</div>} />
            </>
        )}
        </Route>

        {/* Catch-all route for 404 - Must be last */}
        <Route path="*" element={<FileNotFound/>} />
    </Routes>
    </Router>
);
}

export default Navigator;