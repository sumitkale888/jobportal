import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./auth/Login";
import Register from "./auth/Register";
import StudentDashboard from "./student/Dashboard"; // Import the new dashboard
import Profile from "./student/Profile";
import JobDetails from "./student/JobDetails";
import Applications from "./student/Applications";
import MatchedJobs from "./student/MatchedJobs";
import RecruiterDashboard from "./recruiter/RecruiterDashboard";
import PostJob from "./recruiter/PostJob";
import RecruiterProfile from "./recruiter/RecruiterProfile";

// Placeholder for now

const AdminDashboard = () => <div>Admin Dashboard (Coming Soon)</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* STUDENT ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<Profile />} /> {/* NEW */}
            <Route path="/student/jobs/:id" element={<JobDetails />} />
            <Route path="/student/applications" element={<Applications />} />
            <Route path="/student/match" element={<MatchedJobs />} />{" "}
            {/* NEW */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["RECRUITER"]} />}>
            <Route
              path="/recruiter/dashboard"
              element={<RecruiterDashboard />}
            />
            <Route path="/recruiter/profile" element={<RecruiterProfile />} />
            <Route path="/recruiter/post-job" element={<PostJob />} />
          </Route>

          {/* RECRUITER ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["RECRUITER"]} />}>
            <Route
              path="/recruiter/dashboard"
              element={<RecruiterDashboard />}
            />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
