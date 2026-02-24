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

// ✅ ADD THESE NEW FUNCTIONS (This fixes your error)
// =================================================

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

// ✅ ADD THIS FUNCTION
// ✅ CORRECTED FUNCTION
export const downloadResume = async (studentId) => {
    try {
        // ❌ OLD: axiosInstance.get(`/student/profile/resume/${studentId}`...
        // ✅ NEW: Removed "/profile" to match the backend controller perfectly
        const response = await axiosInstance.get(`/student/resume/${studentId}`, {
            responseType: 'blob' // Crucial for downloading files
        });
        
        // Create a temporary URL to open the PDF in a new tab
        const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        window.open(fileURL, '_blank');
    } catch (error) {
        console.error("Error downloading resume:", error);
        alert("Could not load the resume. The student might not have uploaded one.");
    }
};