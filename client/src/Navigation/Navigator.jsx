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
import AllTasks from "../pages/Common/AllTasks/AllTasks";
import AssignToTrashmen from "../pages/Supervisor/AssignToTrashmen";
import Attendance from "../pages/Supervisor/Attendance";

//Id card
import IdentityCard from "../pages/Common/IdentityCard/IdentityCard";

//search workers
import SearchWorkers from "../pages/Common/SearchWorkers/SearchWorkers";

// sanitary inspector
import SupervisorStats from "../pages/Supervisor/SupervisorStats";
import InspectorDashboard from "../pages/SanitoryInspector/InspectorDashBoard";
import InspectorAttendance from "../pages/SanitoryInspector/InspectorAttendance";
import StatsHeader from "../pages/SanitoryInspector/StatsHeader/StatsHeader";
import AssignToSupervisor from "../pages/SanitoryInspector/AssignToSupervisor";

//MHO
import MHODashboard from "../pages/MHO/MHODashboard";
import ViewZone from "../pages/MHO/ViewZone";
//404
import FileNotFound from "../pages/Common/404/FileNotFound";

//settings
import SettingsHeader from "../pages/Common/Settings/SettingsHeader/SettingsHeader";

import DivisionHeader from "../pages/MHO/DivisionHeader";
import AssignToSI from "../pages/MHO/AssignToSI";
import ConfigHeader from "../pages/Commissioner/ConfigHeader/ConfigHeader";
import RouteConfigHeader from "../pages/SanitoryInspector/RouteConfigHeader/RouteConfigHeader";
import EmployeesOverview from "../pages/Commissioner/ManageEmployees/EmployeesOverview";








// Mock User - Change role to test: "Resident", "TrashMan", "SuperVisor", "SanitaryInspector", "MHO" , "Commissioner"
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
            <Route path="map" element={<Map/>}/>
            <Route path="report-trash" element={<ReportTrash/>} />
            <Route path="route-timings" element={<RouteTimings/>} />
            <Route path="trash-details" element={<TrashDetails/>} />
            <Route path="my-stats" element={<ResidentStats/>} />
            <Route path="quiz" element={<Quiz/>} />
            <Route path="take-quiz" element={<TakeQuiz/>} />
            <Route path="submit-feedback" element={<Feedback/>} />
            <Route path="settings" element={<SettingsHeader/>} />
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
            <Route path="settings" element={<SettingsHeader/>} />
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
            <Route path="assign-task" element={<AssignToTrashmen/>}/>
            <Route path="my-stats" element={<SupervisorStats/>} />
            <Route path="id-card" element={<IdentityCard/>} />
            <Route path="search-workers" element={<SearchWorkers/>} />
            <Route path="quiz" element={<Quiz/>} />
            <Route path="take-quiz" element={<TakeQuiz/>} />
            <Route path="settings" element={<SettingsHeader/>} />
            </>
        )}
        {/* SANITARY INSPECTOR */}
        { mockUser?.role === "SanitaryInspector" && (
            <>
            <Route index element={<InspectorDashboard/>} />
            <Route path="attendance" element={<InspectorAttendance/>} />
            <Route path="trashman-stats" element={<TrashmanStats/>} />
            <Route path="supervisor-stats" element={<SupervisorStats/>} />
            <Route path="all-tasks" element={<AllTasks/>}/>
            <Route path="assign-task" element={<AssignToSupervisor/>}/>
            <Route path="overall-stats" element={<StatsHeader/>} />
            <Route path="id-card" element={<IdentityCard/>} />
            <Route path="search-workers" element={<SearchWorkers/>} />
            <Route path="create-feedback-session" element={<TrashManFeedBack/>} />
            <Route path="config-route" element={<RouteConfigHeader/>} />
            <Route path="quiz" element={<Quiz/>} />
            <Route path="take-quiz" element={<TakeQuiz/>} />
            <Route path="settings" element={<SettingsHeader/>} />
            </>
        )}
        {/* MHO ROUTES */}
        {mockUser?.role === "MHO" && (
            <>
            <Route index element={<MHODashboard/>} />
            <Route path="view-zone" element={<ViewZone/>} />
            <Route path="view-division" element={<DivisionHeader/>} />
            <Route path="all-tasks" element={<AllTasks/>} />
            <Route path="assign-task" element={<AssignToSI/>} />
            <Route path="search-workers" element={<SearchWorkers/>} />
            <Route path="trashman-stats" element={<TrashmanStats/>} />
            <Route path="supervisor-stats" element={<SupervisorStats/>} />
            <Route path="inspector-stats" element={<StatsHeader/>} />
            <Route path="quiz" element={<Quiz/>} />
            <Route path="take-quiz" element={<TakeQuiz/>} />
            <Route path="settings" element={<SettingsHeader/>} />
            <Route path="id-card" element={<IdentityCard/>} />
            </>
            
        )}
        {mockUser?.role === "Commissioner" && (
            <>
            <Route index element={<MHODashboard/>} />
            <Route path="view-zone" element={<ViewZone/>} />
            <Route path="view-division" element={<DivisionHeader/>} />
            <Route path="config-district" element={<ConfigHeader/>} />
            <Route path="trashman-stats" element={<TrashmanStats/>} />
            <Route path="supervisor-stats" element={<SupervisorStats/>} />
            <Route path="inspector-stats" element={<StatsHeader/>} />
            <Route path="appoint-employees" element={<EmployeesOverview/>} />
            <Route path="quiz" element={<Quiz/>} />
            <Route path="take-quiz" element={<TakeQuiz/>} />
            <Route path="settings" element={<SettingsHeader/>} />
            <Route path="id-card" element={<IdentityCard/>} />
            </>)
            }
        </Route>

        {/* Catch-all route for 404 - Must be last */}
        <Route path="*" element={<FileNotFound/>} />
    </Routes>
    </Router>
);
}

export default Navigator;