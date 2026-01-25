import axiosInstance from './axiosInstance';

// Get My Profile
export const getStudentProfile = async () => {
    const response = await axiosInstance.get('/student/profile');
    return response.data;
};

// Create or Update Profile
export const updateStudentProfile = async (profileData) => {
    // profileData = { name, skills, resumeUrl, etc. }
    const response = await axiosInstance.post('/student/profile', profileData);
    return response.data;
};
export const searchJobs = async (keyword) => {
    // Calls: http://localhost:8091/api/jobs/search?keyword=Java
    const response = await axiosInstance.get(`/jobs/search?keyword=${keyword}`);
    return response.data;
};