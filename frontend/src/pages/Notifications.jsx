import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyNotifications, markNotificationAsRead } from '../api/notificationApi';
import { ArrowLeft, Bell, CheckCircle } from 'lucide-react';
import { DashboardShell, PageHeader, SurfaceCard, EmptyState } from '../components/ui/DashboardUI';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await getMyNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            // Update UI locally
            setNotifications(prev => prev.map(n => 
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Error marking read");
        }
    };

    return (
        <DashboardShell contentClassName="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <PageHeader badge="Inbox" icon={Bell} title="Notifications" subtitle="Alerts, updates, and activity from applications and recruiters." />
                {/* Header with Back Button */}
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="mr-4 p-2 rounded-full hover:bg-slate-800 transition text-slate-300"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center">
                        <Bell className="w-6 h-6 mr-2 text-indigo-300" /> Notifications
                    </h1>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <EmptyState title="No notifications yet" description="Important updates will appear here as soon as they arrive." />
                        ) : (
                            notifications.map((notif) => (
                                <SurfaceCard
                                    key={notif.id} 
                                    onClick={() => !notif.read && handleMarkRead(notif.id)}
                                    className={`cursor-pointer flex justify-between items-start transition 
                                        ${notif.read ? 'border-slate-800 bg-slate-900/70' : 'border-indigo-400/30 bg-indigo-500/10'}`}
                                >
                                    <div className="flex-1 pr-4">
                                        <h3 className={`font-semibold text-lg ${notif.read ? 'text-slate-200' : 'text-indigo-200'}`}>
                                            {notif.subject}
                                        </h3>
                                        <p className="text-slate-400 mt-1">{notif.message}</p>
                                        <span className="text-xs text-slate-500 mt-3 block">
                                            {new Date(notif.sentAt).toLocaleString()}
                                        </span>
                                    </div>
                                    
                                    {!notif.read && (
                                        <div className="flex-shrink-0" title="Mark as read">
                                            <div className="w-3 h-3 bg-indigo-400 rounded-full mt-2"></div>
                                        </div>
                                    )}
                                    {notif.read && (
                                         <CheckCircle className="w-5 h-5 text-slate-500 mt-1" />
                                    )}
                                </SurfaceCard>
                            ))
                        )}
                    </div>
                )}
        </DashboardShell>
    );
};

export default Notifications;