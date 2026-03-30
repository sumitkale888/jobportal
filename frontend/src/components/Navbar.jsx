import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, LogOut, Briefcase, Sparkles, ShieldCheck, MessageSquare, PlusCircle, LayoutDashboard, UserCircle2, Moon, Sun } from 'lucide-react';
import { getMyNotifications } from '../api/notificationApi';
import { getMyMessages } from '../api/recruiterApi';

const LEGACY_THEME_STORAGE_KEY = 'jobportal-theme';
const getThemeStorageKey = (email) => `jobportal-theme:${email || 'guest'}`;

const Navbar = () => {
    const { user, logout, chatUnreadCount, setChatUnreadCount } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [unreadCount, setUnreadCount] = useState(0);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const storageKey = getThemeStorageKey(user?.email);
        const savedTheme = localStorage.getItem(storageKey)
            || localStorage.getItem(LEGACY_THEME_STORAGE_KEY)
            || 'dark';

        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, [user?.email]);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        const storageKey = getThemeStorageKey(user?.email);

        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem(storageKey, nextTheme);
    };

    const fetchUnreadCount = useCallback(async (forceChatRefresh = false) => {
        try {
            const notifData = await getMyNotifications();
            const unreadNotifs = notifData.filter(n => !n.read).length; 
            setUnreadCount(unreadNotifs);

            // Fetch chat messages and rely strictly on the backend 'isRead' flag
            if (forceChatRefresh || location.pathname !== '/chat') {
                const msgs = await getMyMessages();
                
                const unreadSenders = new Set();
                msgs.forEach((m) => {
                    // Use email for direction to avoid depending on optional user.id in auth context
                    if (m.recipientEmail === user.email && m.isRead === false) {
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

    useEffect(() => {
        if (!user) {
            return;
        }

        const handleNotificationUpdate = () => fetchUnreadCount(true);
        const handleChatUpdate = () => fetchUnreadCount(true);

        window.addEventListener('notifications:updated', handleNotificationUpdate);
        window.addEventListener('chat:updated', handleChatUpdate);

        return () => {
            window.removeEventListener('notifications:updated', handleNotificationUpdate);
            window.removeEventListener('chat:updated', handleChatUpdate);
        };
    }, [user, fetchUnreadCount]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const normalizedRole = user?.role?.replace(/^ROLE_/, '');
    const isStudent = normalizedRole === 'STUDENT';
    const isRecruiter = normalizedRole === 'RECRUITER';
    const isAdmin = normalizedRole === 'ADMIN';

    const navItem = 'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-slate-100';
    const navItemAccent = 'inline-flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/25';

    return (
        <nav className="theme-navbar sticky top-0 z-50 border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-3">
                    <Link to="/" className="group inline-flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_12px_30px_rgba(99,102,241,0.4)] transition group-hover:scale-105">
                        <Briefcase className="w-5 h-5" />
                        </span>
                        <div>
                            <p className="text-lg font-black tracking-tight text-slate-100">JobPortal</p>
                            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Premium Hiring Suite</p>
                        </div>
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link to="/notifications" className="relative rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-slate-300 transition hover:border-indigo-400/40 hover:text-slate-100">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <button onClick={toggleTheme} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-slate-800">
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                {theme === 'dark' ? 'Light' : 'Dark'}
                            </button>
                            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:border-rose-400/40 hover:bg-rose-500/10">
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={toggleTheme} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-slate-800">
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                {theme === 'dark' ? 'Light' : 'Dark'}
                            </button>
                            <Link to="/login" className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-slate-800">Login</Link>
                            <Link to="/register" className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)] transition hover:scale-[1.02]">Sign Up</Link>
                        </div>
                    )}
                </div>

                {user && (
                    <div className="theme-toolbar flex flex-wrap items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-2">
                        {isAdmin && (
                            <Link to="/admin/dashboard" className={navItemAccent}>
                                <ShieldCheck className="h-4 w-4" /> Admin Dashboard
                            </Link>
                        )}

                        {isStudent && (
                            <>
                                <Link to="/student/dashboard" className={navItem}><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                                <Link to="/student/matches" className={navItemAccent}><Sparkles className="h-4 w-4" /> AI Matches</Link>
                                <Link to="/student/applications" className={navItem}>Applications</Link>
                                <Link to="/chat" className={navItem + ' relative'}>
                                    <MessageSquare className="h-4 w-4" /> Chat
                                    {chatUnreadCount > 0 && location.pathname !== '/chat' && (
                                        <span className="absolute right-1 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
                                    )}
                                </Link>
                                <Link to="/student/profile" className={navItem}><UserCircle2 className="h-4 w-4" /> Profile</Link>
                            </>
                        )}

                        {isRecruiter && (
                            <>
                                <Link to="/recruiter/dashboard" className={navItem}><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                                <Link to="/recruiter/profile" className={navItem}><UserCircle2 className="h-4 w-4" /> Company Profile</Link>
                                <Link to="/chat" className={navItem + ' relative'}>
                                    <MessageSquare className="h-4 w-4" /> Chat
                                    {chatUnreadCount > 0 && location.pathname !== '/chat' && (
                                        <span className="absolute right-1 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
                                    )}
                                </Link>
                                <Link to="/recruiter/post-job" className={navItemAccent}><PlusCircle className="h-4 w-4" /> Post Job</Link>
                            </>
                        )}

                        <span className="ml-auto rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-400 sm:text-sm">
                            {user.email}
                        </span>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;