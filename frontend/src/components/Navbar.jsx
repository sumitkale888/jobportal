import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, LogOut, Briefcase, Sparkles, ShieldCheck, MessageSquare } from 'lucide-react';
import { getMyNotifications } from '../api/notificationApi';
import { getMyMessages } from '../api/recruiterApi';

const Navbar = () => {
    const { user, logout, chatUnreadCount, setChatUnreadCount } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const notifData = await getMyNotifications();
            const unreadNotifs = notifData.filter(n => !n.read).length; 
            setUnreadCount(unreadNotifs);

            // Fetch chat messages and rely strictly on the backend 'isRead' flag
            if (location.pathname !== '/chat') {
                const msgs = await getMyMessages();
                
                const unreadSenders = new Set();
                msgs.forEach((m) => {
                    // If the message was sent TO the current user and is NOT read
                    if (m.recipientId === user.id && m.isRead === false) {
                        unreadSenders.add(m.senderId);
                    }
                });
                
                // Set the count to the number of unique contacts with unread messages
                if (setChatUnreadCount) {
                    setChatUnreadCount(unreadSenders.size);
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications or chats", error);
        }
    }, [location.pathname, setChatUnreadCount, user]);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); 
            return () => clearInterval(interval);
        }
    }, [user, location.pathname, fetchUnreadCount]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const normalizedRole = user?.role?.replace(/^ROLE_/, '');
    const isStudent = normalizedRole === 'STUDENT';
    const isRecruiter = normalizedRole === 'RECRUITER';
    const isAdmin = normalizedRole === 'ADMIN';

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                        <Briefcase className="w-5 h-5" />
                    </span>
                    <span className="bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent">JobPortal</span>
                </Link>
                <div className="flex items-center space-x-5">
                    {user ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin/dashboard" className="text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                                    <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                                </Link>
                            )}

                            {isStudent && (
                                <>
                                    <Link to="/student/dashboard" className="text-slate-600 hover:text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Jobs</Link>
                                    <Link to="/student/matches" className="text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition">
                                        <Sparkles className="w-4 h-4" /> AI Matches
                                    </Link>
                                    <Link to="/student/applications" className="text-slate-600 hover:text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">My Applications</Link>
                                    <Link to="/chat" className="text-slate-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 relative px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
                                        <MessageSquare className="w-4 h-4" /> Chat
                                        {chatUnreadCount > 0 && location.pathname !== '/chat' && (
                                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                                        )}
                                    </Link>
                                    <Link to="/student/profile" className="text-slate-600 hover:text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Profile</Link>
                                </>
                            )}

                            {isRecruiter && (
                                <>
                                    <Link to="/recruiter/dashboard" className="text-slate-600 hover:text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Dashboard</Link>
                                    <Link to="/recruiter/profile" className="text-slate-600 hover:text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Company Profile</Link>
                                    <Link to="/chat" className="text-slate-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 relative px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
                                        <MessageSquare className="w-4 h-4" /> Chat
                                        {chatUnreadCount > 0 && location.pathname !== '/chat' && (
                                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                                        )}
                                    </Link>
                                    <Link to="/recruiter/post-job" className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 text-sm font-bold transition shadow-sm hover:shadow-md">Post Job</Link>
                                </>
                            )}

                            <Link to="/notifications" className="relative p-2.5 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-xl transition">
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>

                            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                                <span className="text-sm text-slate-500 hidden md:block font-medium">Hello, {user.email}</span>
                                <button onClick={handleLogout} className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-semibold transition">
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-x-3">
                            <Link to="/login" className="text-slate-600 hover:text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Login</Link>
                            <Link to="/register" className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-semibold transition shadow-sm hover:shadow-md">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;