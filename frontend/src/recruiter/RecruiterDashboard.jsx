import React, { useEffect, useState } from 'react';
import { getRecruiterDashboard, getMyPostedJobs } from '../api/recruiterApi';
import Navbar from '../components/Navbar';
import { Briefcase, Users, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecruiterDashboard = () => {
    const [stats, setStats] = useState(null);
    const [jobs, setJobs] = useState([]); // List of jobs
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardData = await getRecruiterDashboard();
                setStats(dashboardData);
                
                const jobsData = await getMyPostedJobs(); // Fetch jobs list
                setJobs(jobsData);
            } catch (err) {
                console.error("Error loading dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Hello, {stats?.companyName || "Recruiter"} 👋</h1>
                    <p className="text-gray-500">Manage your jobs and applicants here.</p>
                </div>

                {/* Stats Cards (Keep existing code here) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     {/* ... (Your existing stats cards code) ... */}
                     <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                        <p className="text-gray-500">Total Jobs</p>
                        <h2 className="text-3xl font-bold">{stats?.totalJobsPosted}</h2>
                     </div>
                     <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                        <p className="text-gray-500">Total Applicants</p>
                        <h2 className="text-3xl font-bold">{stats?.totalApplicants}</h2>
                     </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Your Posted Jobs</h2>
                    <Link to="/recruiter/post-job" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        + Post New Job
                    </Link>
                </div>

                {/* ✅ JOB LIST WITH "VIEW APPLICANTS" BUTTON */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                    <td className="p-4 text-center">
                                        <Link 
                                            to={`/recruiter/jobs/${job.id}/applicants`} 
                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                                        >
                                            <Users className="w-4 h-4 mr-2"/> View Applicants <ArrowRight className="w-4 h-4 ml-1"/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {jobs.length === 0 && <p className="p-6 text-center text-gray-500">No jobs posted yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;