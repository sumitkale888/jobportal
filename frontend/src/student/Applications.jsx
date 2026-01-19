import React, { useEffect, useState } from 'react';
import { getMyApplications } from '../api/applicationApi';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { Building, MapPin, Calendar, Clock } from 'lucide-react';

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPLIED': return 'bg-blue-100 text-blue-800';
            case 'SHORTLISTED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Applications</h1>
                
                {loading ? <p>Loading...</p> : (
                    <div className="grid gap-6">
                        {applications.length === 0 ? (
                            <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                        ) : (
                            applications.map((app) => (
                                <div key={app.applicationId} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{app.jobTitle}</h3>
                                        <div className="flex items-center text-gray-600 mt-1 space-x-4">
                                            <span className="flex items-center"><Building className="w-4 h-4 mr-1"/> {app.companyName}</span>
                                            {/* Format Date if needed */}
                                            <span className="flex items-center text-sm"><Calendar className="w-4 h-4 mr-1"/> Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
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