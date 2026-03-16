import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, LogOut, Briefcase, Sparkles, ShieldCheck, MessageSquare } from 'lucide-react'; // 🚨 Added ShieldCheck icon
import { getMyNotifications } from '../api/notificationApi'; 

const Navbar = () => {
    const { user, logout, chatUnreadCount } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const data = await getMyNotifications();
            const unread = data.filter(n => !n.read).length; 
            setUnreadCount(unread);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); 
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const normalizedRole = user?.role?.replace(/^ROLE_/, '');
    const isStudent = normalizedRole === 'STUDENT';
    const isRecruiter = normalizedRole === 'RECRUITER';
    const isAdmin = normalizedRole === 'ADMIN';

    return (
        <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
                    <Briefcase className="w-6 h-6 mr-2" /> JobPortal
                </Link>
                <div className="flex items-center space-x-6">
                    {user ? (
                        <>
                            {/* 👑 ADMIN LINKS */}
                            {isAdmin && (
                                <>
                                    <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-800 font-bold flex items-center">
                                        <ShieldCheck className="w-4 h-4 mr-1" /> Admin Dashboard
                                    </Link>
                                </>
                            )}

                            {/* 🎓 STUDENT LINKS */}
                            {isStudent && (
                                <>
                                    <Link to="/student/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Jobs</Link>
                                    <Link to="/student/matches" className="text-purple-600 hover:text-purple-800 font-bold flex items-center">
                                        <Sparkles className="w-4 h-4 mr-1" /> AI Matches
                                    </Link>
                                    <Link to="/student/applications" className="text-gray-600 hover:text-blue-600 font-medium">My Applications</Link>
                                    <Link to="/chat" className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"><MessageSquare className="w-4 h-4"/> Chat</Link>
                                    <Link to="/student/profile" className="text-gray-600 hover:text-blue-600 font-medium">Profile</Link>
                                </>
                            )}

                            {/* 🏢 RECRUITER LINKS */}
                            {isRecruiter && (
                                <>
                                    <Link to="/recruiter/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
                                    <Link to="/recruiter/profile" className="text-gray-600 hover:text-blue-600 font-medium">Company Profile</Link>
                                    <Link to="/chat" className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1 relative"><MessageSquare className="w-4 h-4"/> Chat
                                        {chatUnreadCount > 0 && <span className="absolute -top-1 -right-2 h-2.5 w-2.5 rounded-full bg-red-500" />}
                                    </Link>
                                    <Link to="/recruiter/post-job" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-bold">Post Job</Link>
                                </>
                            )}

                            {/* COMMON LOGGED-IN ELEMENTS */}
                            <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-blue-600 transition">
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>

                            <div className="flex items-center space-x-4 border-l pl-4">
                                <span className="text-sm text-gray-500 hidden md:block">Hello, {user.email}</span>
                                <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700 font-medium">
                                    <LogOut className="w-4 h-4 mr-1" /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;