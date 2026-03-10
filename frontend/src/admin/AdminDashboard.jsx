import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar'; 
import { Users, Building2, Briefcase, ShieldCheck, CheckCircle, XCircle, Globe, MapPin } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalRecruiters: 0, totalStudents: 0, activeJobs: 0 });
    const [pendingRecruiters, setPendingRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                axios.get('http://localhost:8091/api/admin/dashboard-stats', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8091/api/admin/pending-recruiters', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStats(statsRes.data);
            setPendingRecruiters(pendingRes.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 🚨 Handle Approval
    const handleApprove = async (profileId, companyName) => {
        if (!window.confirm(`Are you sure you want to approve ${companyName}? They will be able to post jobs.`)) return;
        try {
            await axios.put(`http://localhost:8091/api/admin/verify-recruiter/${profileId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`${companyName} has been approved!`);
            fetchData(); // Refresh lists
        } catch (error) {
            toast.error("Failed to approve recruiter.");
        }
    };

    // 🚨 Handle Rejection
    const handleReject = async (profileId, companyName) => {
        if (!window.confirm(`Are you sure you want to reject and delete ${companyName}?`)) return;
        try {
            await axios.delete(`http://localhost:8091/api/admin/reject-recruiter/${profileId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.warning(`${companyName} was rejected.`);
            fetchData(); // Refresh lists
        } catch (error) {
            toast.error("Failed to reject recruiter.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Boss Mode: Admin Dashboard</h1>
                </div>
                
                {loading ? (
                    <div className="text-center py-20 text-gray-500 font-bold">Loading live database stats...</div>
                ) : (
                    <>
                        {/* 📊 PLATFORM METRICS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div><h3 className="text-gray-500 font-medium mb-1">Total Recruiters</h3><p className="text-4xl font-black text-orange-600">{stats.totalRecruiters}</p></div>
                                <div className="p-4 bg-orange-50 rounded-full text-orange-600"><Building2 size={32}/></div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div><h3 className="text-gray-500 font-medium mb-1">Total Students</h3><p className="text-4xl font-black text-blue-600">{stats.totalStudents}</p></div>
                                <div className="p-4 bg-blue-50 rounded-full text-blue-600"><Users size={32}/></div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div><h3 className="text-gray-500 font-medium mb-1">Active Jobs</h3><p className="text-4xl font-black text-green-600">{stats.activeJobs}</p></div>
                                <div className="p-4 bg-green-50 rounded-full text-green-600"><Briefcase size={32}/></div>
                            </div>
                        </div>

                        {/* 🛑 PENDING RECRUITERS TABLE */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                                <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-md text-sm">{pendingRecruiters.length}</span>
                                Pending Recruiter Approvals
                            </h2>
                            
                            {pendingRecruiters.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 font-medium">No pending recruiters to review!</div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingRecruiters.map(recruiter => (
                                        <div key={recruiter.id} className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition">
                                            
                                            {/* Company Info */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{recruiter.companyName || "Unnamed Company"}</h3>
                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                                    {recruiter.headOfficeLocation && (
                                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {recruiter.headOfficeLocation}</span>
                                                    )}
                                                    {recruiter.websiteUrl && (
                                                        <a href={recruiter.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Globe className="w-4 h-4"/> {recruiter.websiteUrl}</a>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{recruiter.companyDescription}</p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                                <button 
                                                    onClick={() => handleReject(recruiter.id, recruiter.companyName)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold transition"
                                                >
                                                    <XCircle className="w-4 h-4"/> Reject
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(recruiter.id, recruiter.companyName)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-bold transition shadow-md shadow-green-200"
                                                >
                                                    <CheckCircle className="w-4 h-4"/> Approve
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;