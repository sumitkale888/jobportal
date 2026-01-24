import axiosInstance from './axiosInstance';

// Get Dashboard Stats
export const getRecruiterDashboard = async () => {
    const response = await axiosInstance.get('/recruiter/dashboard');
    return response.data;
};

// Get Company Profile
export const getRecruiterProfile = async () => {
    const response = await axiosInstance.get('/recruiter/profile');
    return response.data;
};

// Create/Update Profile (Handles File Upload)
export const updateRecruiterProfile = async (formData) => {
    const response = await axiosInstance.post('/recruiter/profile', formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Post a New Job
export const postJob = async (jobData) => {
    const response = await axiosInstance.post('/jobs', jobData);
    return response.data;
};

// Get Recruiter's Posted Jobs
export const getMyPostedJobs = async () => {
    const response = await axiosInstance.get('/jobs/my-jobs');
    return response.data;
};