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
export const searchJobs = async (filters) => {
    // Filters is an object: { title: '...', location: '...', type: '...', skill: '...' }
    // We convert it to query string params
    const params = new URLSearchParams();
    if (filters.title) params.append('title', filters.title);
    if (filters.location) params.append('location', filters.location);
    if (filters.type) params.append('type', filters.type);
    if (filters.skill) params.append('skill', filters.skill);

    const response = await axiosInstance.get(`/jobs/search?${params.toString()}`);
    return response.data;
};
export const getAllJobs = async () => {
    const response = await axiosInstance.get('/jobs');
    return response.data;
};