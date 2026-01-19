import axiosInstance from './axiosInstance';

// Apply for a Job
export const applyForJob = async (jobId) => {
    const response = await axiosInstance.post(`/student/applications/${jobId}`);
    return response.data;
};

// Get My Applications (History)
export const getMyApplications = async () => {
    const response = await axiosInstance.get('/student/applications');
    return response.data;
};