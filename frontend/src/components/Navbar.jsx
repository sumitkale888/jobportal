import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, User, LogOut, Briefcase } from 'lucide-react';
import { getMyNotifications, markNotificationAsRead } from '../api/notificationApi';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    // ✅ MOVED UP: Defined before useEffect calls it
    const fetchNotifications = async () => {
        try {
            const data = await getMyNotifications();
            setNotifications(data);
            const unread = data.filter(n => !n.read).length; 
            setUnreadCount(unread);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); 
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            try {
                await markNotificationAsRead(notification.id);
                setNotifications(prev => prev.map(n => 
                    n.id === notification.id ? { ...n, read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Error marking read");
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        // ... (Keep your existing JSX for the UI) ...
        <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
                    <Briefcase className="w-6 h-6 mr-2" /> JobPortal
                </Link>
                <div className="flex items-center space-x-6">
                    {user ? (
                        <>
                            {user.role === 'STUDENT' ? (
                                <>
                                    <Link to="/student/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Jobs</Link>
                                    <Link to="/student/matches" className="text-gray-600 hover:text-blue-600 font-medium text-yellow-600">AI Matches</Link>
                                    <Link to="/student/applications" className="text-gray-600 hover:text-blue-600 font-medium">My Applications</Link>
                                    <Link to="/student/profile" className="text-gray-600 hover:text-blue-600 font-medium">Profile</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/recruiter/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
                                    <Link to="/recruiter/post-job" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-bold">Post Job</Link>
                                </>
                            )}
                            {/* Notification Bell Logic Here (same as your code) */}
                             <div className="relative">
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)} 
                                    className="relative p-2 text-gray-600 hover:text-blue-600 transition"
                                >
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                                        <div className="p-3 bg-gray-50 border-b font-bold text-gray-700">Notifications</div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <p className="p-4 text-sm text-gray-500 text-center">No notifications yet.</p>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div 
                                                        key={notif.id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${notif.read ? 'opacity-50' : 'bg-blue-50'}`}
                                                    >
                                                        <p className="text-sm font-bold text-gray-800">{notif.subject}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
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