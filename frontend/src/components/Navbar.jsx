import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, Briefcase } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null; // Don't show Navbar on Login/Register pages

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center text-xl font-bold text-blue-600"
            >
              <Briefcase className="w-6 h-6 mr-2" />
              JobPortal
            </Link>

            {/* Links based on Role */}
            <div className="hidden md:flex ml-10 space-x-8">
              {role === "STUDENT" && (
                <>
                  <Link
                    to="/student/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Jobs
                  </Link>
                  <Link
                    to="/student/match"
                    className="mr-4 hover:text-blue-200 font-bold text-yellow-300"
                  >
                    AI Matches
                  </Link>
                  <Link
                    to="/student/applications"
                    className="mr-4 hover:text-blue-200"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/student/profile"
                    className="mr-4 hover:text-blue-200"
                  >
                    Profile
                  </Link>
                </>
              )}
              {role === "RECRUITER" && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/recruiter/post-job"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/recruiter/my-jobs"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    My Jobs
                  </Link>
                </>
              )}
              {role === "ADMIN" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Stats
                  </Link>
                  <Link
                    to="/admin/users"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Manage Users
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Hello, {user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center text-red-500 hover:text-red-700"
            >
              <LogOut className="w-5 h-5 mr-1" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
