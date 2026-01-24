import axiosInstance from './axiosInstance';

// Get My Notifications
export const getMyNotifications = async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
};

// Mark Notification as Read
export const markNotificationAsRead = async (id) => {
    await axiosInstance.put(`/notifications/${id}/read`);
};