import axiosInstance from "../api/axiosInstance";

export const getDashboardStats = () => axiosInstance.get("/admin/dashboard-stats");
export const getUsers = () => axiosInstance.get("/admin/users");
export const updateUserRole = (userId, role) => axiosInstance.put(`/admin/users/${userId}/role`, { role });
export const banUser = (userId) => axiosInstance.put(`/admin/users/${userId}/ban`);
export const unbanUser = (userId) => axiosInstance.put(`/admin/users/${userId}/unban`);
export const deleteUser = (userId) => axiosInstance.delete(`/admin/users/${userId}`);

export const getRecruiterProfiles = (verified) => {
	const query = typeof verified === "boolean" ? `?verified=${verified}` : "";
	return axiosInstance.get(`/admin/recruiters${query}`);
};
export const verifyRecruiter = (profileId) => axiosInstance.put(`/admin/verify-recruiter/${profileId}`);
export const rejectRecruiter = (profileId) => axiosInstance.delete(`/admin/reject-recruiter/${profileId}`);

export const getJobs = (status) => axiosInstance.get(`/admin/jobs${status ? `?status=${status}` : ""}`);
export const getReportedJobs = () => axiosInstance.get("/admin/jobs/reported");
export const approveJob = (jobId) => axiosInstance.put(`/admin/jobs/${jobId}/approve`);
export const rejectJob = (jobId) => axiosInstance.put(`/admin/jobs/${jobId}/reject`);
export const editJob = (jobId, payload) => axiosInstance.put(`/admin/jobs/${jobId}`, payload);
export const deleteJob = (jobId) => axiosInstance.delete(`/admin/jobs/${jobId}`);
export const removeJobDescription = (jobId) => axiosInstance.put(`/admin/jobs/${jobId}/remove-description`);

export const getApplications = () => axiosInstance.get("/admin/applications");
export const markApplicationSpam = (appId) => axiosInstance.put(`/admin/applications/${appId}/mark-spam`);

export const getCategories = () => axiosInstance.get("/admin/categories");
export const addCategory = (name) => axiosInstance.post("/admin/categories", { name });
export const deleteCategory = (name) => axiosInstance.delete(`/admin/categories/${encodeURIComponent(name)}`);
export const getJobTypes = () => axiosInstance.get("/admin/job-types");
export const getFeatureToggles = () => axiosInstance.get("/admin/feature-toggles");
export const toggleFeature = (feature, enabled) => axiosInstance.put(`/admin/feature-toggles/${feature}`, { enabled });

export const getMaintenanceMode = () => axiosInstance.get("/admin/maintenance");
export const setMaintenanceMode = (enabled) => axiosInstance.put("/admin/maintenance", { enabled });
