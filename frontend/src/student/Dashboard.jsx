import React, { useEffect, useState } from 'react';
import { getAllJobs } from '../api/jobApi';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MapPin, DollarSign, Building } from 'lucide-react';

const StudentDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const data = await getAllJobs();
            setJobs(data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Latest Job Openings</h1>
                
                {loading ? (
                    <p>Loading jobs...</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.length === 0 ? (
                            <p className="text-gray-500">No jobs available at the moment.</p>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                                    <h3 className="text-xl font-bold text-blue-600 mb-2">{job.title}</h3>
                                    
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <Building className="w-4 h-4 mr-2" />
                                        <span>{job.companyName || "Tech Company"}</span>
                                    </div>

                                    <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                                        <span className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" /> {job.location}
                                        </span>
                                        <span className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-1" /> ${job.salary}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {job.description}
                                    </p>

                                    <Link 
                                        to={`/student/jobs/${job.id}`} 
                                        className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;