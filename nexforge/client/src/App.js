import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";
import ProjectsPage from "./pages/ProjectsPage";
import TeamActivity from "./pages/TeamActivity";

// import MentorDashboard from './pages/MentorDashboard';
// import RecruiterDashboard from './pages/RecruiterDashboard';
// import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* TODO: swap these placeholder elements for the real dashboard components above */}
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/projects" element={<ProjectsPage />} />
        <Route path="/dashboard/team-activity" element={<TeamActivity />} />
        <Route
          path="/dashboard/mentor"
          element={<div>Mentor dashboard — build me next</div>}
        />
        <Route
          path="/dashboard/recruiter"
          element={<div>Recruiter dashboard — build me next</div>}
        />
        <Route
          path="/dashboard/admin"
          element={<div>Admin dashboard — build me next</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
