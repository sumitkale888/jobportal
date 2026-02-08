import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyNotifications, markNotificationAsRead } from '../api/notificationApi';
import Navbar from '../components/Navbar';
import { ArrowLeft, Bell, CheckCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header with Back Button */}
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="mr-4 p-2 rounded-full hover:bg-gray-200 transition text-gray-600"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Bell className="w-6 h-6 mr-2 text-blue-600" /> Notifications
                    </h1>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-lg shadow text-gray-500">
                                You have no notifications yet.
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => !notif.read && handleMarkRead(notif.id)}
                                    className={`p-5 rounded-lg shadow-sm border transition flex justify-between items-start cursor-pointer 
                                        ${notif.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
                                >
                                    <div className="flex-1 pr-4">
                                        <h3 className={`font-semibold text-lg ${notif.read ? 'text-gray-700' : 'text-blue-800'}`}>
                                            {notif.subject}
                                        </h3>
                                        <p className="text-gray-600 mt-1">{notif.message}</p>
                                        <span className="text-xs text-gray-400 mt-3 block">
                                            {new Date(notif.sentAt).toLocaleString()}
                                        </span>
                                    </div>
                                    
                                    {!notif.read && (
                                        <div className="flex-shrink-0" title="Mark as read">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                                        </div>
                                    )}
                                    {notif.read && (
                                         <CheckCircle className="w-5 h-5 text-gray-300 mt-1" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;