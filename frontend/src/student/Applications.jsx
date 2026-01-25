import React, { useEffect, useState } from 'react';
import { getMyApplications, withdrawApplication } from '../api/applicationApi';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { Building, MapPin, Calendar, Trash2 } from 'lucide-react';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const data = await getMyApplications();
            setApplications(data);
        } catch (error) {
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (appId) => {
        if (!window.confirm("Are you sure you want to delete/withdraw this application?")) return;

        try {
            await withdrawApplication(appId);
            toast.success("Application removed successfully");
            setApplications(applications.filter(app => app.applicationId !== appId));
        } catch (error) {
            // Check if error is specifically about shortlisting
            const msg = error.response?.data?.message || "Failed to remove application";
            toast.error(msg);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPLIED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SHORTLISTED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Applications</h1>
                
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : (
                    <div className="grid gap-6">
                        {applications.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-lg shadow">
                                <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                            </div>
                        ) : (
                            applications.map((app) => (
                                <div key={app.applicationId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition">
                                    <div className="mb-4 md:mb-0">
                                        <h3 className="text-xl font-bold text-gray-800">{app.jobTitle}</h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 mt-2 space-y-1 sm:space-y-0 sm:space-x-4 text-sm">
                                            <span className="flex items-center"><Building className="w-4 h-4 mr-1.5 text-gray-400"/> {app.companyName}</span>
                                            <span className="hidden sm:inline text-gray-300">|</span>
                                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-gray-400"/> Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>

                                        {/* ✅ FIX: Allow delete for APPLIED OR REJECTED */}
                                        {(app.status === 'APPLIED' || app.status === 'REJECTED') && (
                                            <button 
                                                onClick={() => handleWithdraw(app.applicationId)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                                                title={app.status === 'REJECTED' ? "Delete History" : "Withdraw Application"}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Applications;