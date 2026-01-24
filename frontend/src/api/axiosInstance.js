import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8091/api', // Ensure port is correct
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Automatically attach token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Ensure Login saves 'token'
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
// Get Applicants for a specific Job
export const getJobApplicants = async (jobId) => {
    const response = await axiosInstance.get(`/recruiter/applications/job/${jobId}`);
    return response.data;
};

// Update Application Status (Shortlist/Reject)
export const updateApplicationStatus = async (applicationId, status) => {
    // status can be: APPLIED, SHORTLISTED, REJECTED
    const response = await axiosInstance.put(`/recruiter/applications/${applicationId}/status?status=${status}`);
    return response.data;
};
export default axiosInstance;