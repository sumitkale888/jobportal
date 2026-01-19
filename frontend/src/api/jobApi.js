import axiosInstance from './axiosInstance';

// Get All Jobs (For Students)
export const getAllJobs = async () => {
    const response = await axiosInstance.get('/jobs');
    return response.data;
};

// Get Single Job Details
export const getJobById = async (id) => {
    const response = await axiosInstance.get(`/jobs/${id}`);
    return response.data;
};

// RECRUITER: Post a Job
export const createJob = async (jobData) => {
    const response = await axiosInstance.post('/jobs', jobData);
    return response.data;
};

// RECRUITER: Get My Jobs
export const getMyJobs = async () => {
    const response = await axiosInstance.get('/jobs/my-jobs');
    return response.data;
};