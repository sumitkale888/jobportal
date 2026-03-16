import React, { useEffect, useState } from 'react';
import { getRecruiterDashboard, getMyPostedJobs } from '../api/recruiterApi';
import axiosInstance from '../api/axiosInstance'; 
import Navbar from '../components/Navbar';
import { Users, Trash2, AlertTriangle, PlusCircle, Briefcase } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const RecruiterDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [isVerified, setIsVerified] = useState(false); // 🚨 Added for Verification check
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch stats and jobs
            await getRecruiterDashboard();
            const jobsData = await getMyPostedJobs();
            setJobs(jobsData);

            // 🚨 Fetch profile to check verification status
            const profileRes = await axiosInstance.get('/recruiter/profile');
            setIsVerified(profileRes.data.verified === true || profileRes.data.isVerified === true);
            
        } catch {
            console.error('Failed to load recruiter data');
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
        } catch {
            toast.error("Failed to delete job");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold text-xl">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-8 h-8 text-blue-600" />
                          <h1 className="text-3xl font-bold text-gray-800">Company Dashboard</h1>
                        </div>
                        <Link to="/recruiter/ai-matches" className="text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-50">AI Match Rankings</Link>
                    </div>
                    
                    {/* ✅ Conditional Post Job Button */}
                    {isVerified ? (
                        <Link to="/recruiter/post-job" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
                            <PlusCircle className="w-5 h-5"/> Post a New Job
                        </Link>
                    ) : (
                        <button disabled className="bg-gray-200 text-gray-500 px-5 py-2.5 rounded-lg font-bold cursor-not-allowed flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5"/> Post Job (Locked)
                        </button>
                    )}
                </div>

                {/* 🚨 THE PENDING BANNER 🚨 */}
                {!isVerified && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 mb-8 rounded-r-xl shadow-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                        <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-yellow-800 font-bold text-lg">Account Pending Admin Approval</h3>
                            <p className="text-yellow-700 mt-1">
                                Your company profile is currently being reviewed by our moderation team to ensure platform safety. 
                                <strong> You will be able to post jobs as soon as you are verified.</strong>
                            </p>
                        </div>
                    </div>
                )}

                {/* ... Add your stats cards back here if you have them ... */}

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
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                                        No jobs posted yet.
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-bold text-gray-900">{job.title}</td>
                                        <td className="p-4">{job.location}</td>
                                        <td className="p-4">{new Date(job.postedAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-center flex justify-center gap-4">
                                            <Link 
                                                to={`/recruiter/jobs/${job.id}/applicants`} 
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-3 py-1.5 rounded-md"
                                            >
                                                <Users className="w-4 h-4 mr-2"/> Applicants
                                            </Link>
                                            
                                            {/* ✅ Delete Button */}
                                            <button 
                                                onClick={() => handleDeleteJob(job.id)}
                                                className="inline-flex items-center text-red-500 hover:text-red-700 font-semibold bg-red-50 px-3 py-1.5 rounded-md"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1"/> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;