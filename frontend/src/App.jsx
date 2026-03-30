import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./auth/Login";
import Register from "./auth/Register";
import StudentDashboard from "./student/Dashboard"; 
import Profile from "./student/Profile";
import JobDetails from "./student/JobDetails";
import Applications from "./student/Applications";
import MatchedJobs from "./student/MatchedJobs";
import RecruiterDashboard from "./recruiter/RecruiterDashboard";
import AiMatches from "./recruiter/AiMatches";
import PostJob from "./recruiter/PostJob";
import RecruiterProfile from "./recruiter/RecruiterProfile";
import JobApplicants from "./recruiter/JobApplicants";
import Chat from "./components/Chat";
import Notifications from "./pages/Notifications";
import AdminDashboard from './admin/AdminDashboard';
import Footer from './components/Footer';

function AppLayout() {
  const location = useLocation();
  const footerAllowedPaths = [
    '/student/dashboard',
    '/recruiter/dashboard',
    '/admin/dashboard'
  ];
  const showFooter = footerAllowedPaths.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col ui-shell">
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* STUDENT ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'ROLE_STUDENT', 'ROLE_RECRUITER']} />}>
             <Route path="/notifications" element={<Notifications />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["STUDENT", "ROLE_STUDENT"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/jobs/:id" element={<JobDetails />} />
            <Route path="/student/applications" element={<Applications />} />
            <Route path="/student/matches" element={<MatchedJobs />} />
          </Route>

          {/* RECRUITER ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["RECRUITER", "ROLE_RECRUITER"]} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/profile" element={<RecruiterProfile />} />
            <Route path="/recruiter/post-job" element={<PostJob />} />
            <Route path="/recruiter/ai-matches" element={<AiMatches />} />
            <Route path="/recruiter/jobs/:jobId/applicants" element={<JobApplicants />} />
          </Route>

          {/* CHAT ROUTE (Student & Recruiter) */}
          <Route element={<ProtectedRoute allowedRoles={["STUDENT", "ROLE_STUDENT", "RECRUITER", "ROLE_RECRUITER"]} />}>
            <Route path="/chat" element={<Chat />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ROLE_ADMIN"]} />}>
             <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;