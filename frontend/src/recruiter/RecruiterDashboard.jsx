import React, { useEffect, useState } from 'react';
import { getRecruiterDashboard } from '../api/recruiterApi';
import Navbar from '../components/Navbar';
import { Briefcase, Users, CheckCircle, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecruiterDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRecruiterDashboard()
            .then(data => setStats(data))
            .catch(err => console.error("Dashboard error:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Hello, {stats?.companyName || "Recruiter"} 👋
                    </h1>
                    <p className="text-gray-500">Here is what's happening with your jobs today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 flex items-center">
                        <Briefcase className="w-10 h-10 text-blue-500 mr-4" />
                        <div>
                            <p className="text-gray-500 text-sm">Total Jobs Posted</p>
                            <h2 className="text-3xl font-bold">{stats?.totalJobsPosted || 0}</h2>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 flex items-center">
                        <CheckCircle className="w-10 h-10 text-green-500 mr-4" />
                        <div>
                            <p className="text-gray-500 text-sm">Active Jobs</p>
                            <h2 className="text-3xl font-bold">{stats?.activeJobs || 0}</h2>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500 flex items-center">
                        <Users className="w-10 h-10 text-purple-500 mr-4" />
                        <div>
                            <p className="text-gray-500 text-sm">Total Applicants</p>
                            <h2 className="text-3xl font-bold">{stats?.totalApplicants || 0}</h2>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/recruiter/post-job" className="bg-blue-600 text-white p-4 rounded-lg text-center font-bold hover:bg-blue-700 transition">
                        + Post a New Job
                    </Link>
                    <Link to="/recruiter/profile" className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg text-center font-bold hover:bg-gray-50 transition">
                        Manage Company Profile
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;