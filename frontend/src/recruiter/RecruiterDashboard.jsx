import React, { useEffect, useState } from 'react';
import { getRecruiterDashboard, getMyPostedJobs } from '../api/recruiterApi';
import axiosInstance from '../api/axiosInstance'; // Import for Delete call
import Navbar from '../components/Navbar';
import { Users, ArrowRight, Trash2 } from 'lucide-react'; // Import Trash icon
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const RecruiterDashboard = () => {
    const [stats, setStats] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const dashboardData = await getRecruiterDashboard();
            setStats(dashboardData);
            const jobsData = await getMyPostedJobs();
            setJobs(jobsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ FEATURE: Handle Delete
    const handleDeleteJob = async (jobId) => {
        if(!window.confirm("Are you sure you want to delete this job? This will also remove all applications.")) return;

        try {
            await axiosInstance.delete(`/jobs/${jobId}`);
            toast.success("Job deleted successfully");
            loadData(); // Refresh list
        } catch (error) {
            toast.error("Failed to delete job");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* ... Stats Section (Keep as is) ... */}

                <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                            <tr>
                                <th className="p-4">Job Title</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Posted Date</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {jobs.map((job) => (
                                <tr key={job.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{job.title}</td>
                                    <td className="p-4">{job.location}</td>
                                    <td className="p-4">{new Date(job.postedAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-center flex justify-center gap-4">
                                        <Link 
                                            to={`/recruiter/jobs/${job.id}/applicants`} 
                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                                        >
                                            <Users className="w-4 h-4 mr-2"/> Applicants
                                        </Link>
                                        
                                        {/* ✅ Delete Button */}
                                        <button 
                                            onClick={() => handleDeleteJob(job.id)}
                                            className="inline-flex items-center text-red-500 hover:text-red-700 font-semibold"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1"/> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;