import React, { useEffect, useState } from 'react';
import { getAllJobs } from '../api/jobApi';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign } from 'lucide-react';

const StudentDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added error state

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const data = await getAllJobs();
            console.log("🔥 DEBUG: Received Jobs from Backend:", data); // Check Console!
            if (Array.isArray(data)) {
                setJobs(data);
            } else {
                console.error("API did not return an array:", data);
                setJobs([]);
            }
        } catch (err) {
            console.error("Failed to fetch jobs", err);
            setError("Failed to load jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Latest Job Openings</h1>

                {loading && <p>Loading jobs...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {!loading && !error && jobs.length === 0 && (
                    <p className="text-gray-500">No jobs available at the moment.</p>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                            <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                            <p className="text-gray-600 mb-2 flex items-center">
                                <Briefcase className="w-4 h-4 mr-1"/> {job.companyName}
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                                <MapPin className="w-4 h-4 mr-1 inline"/> {job.location}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                <DollarSign className="w-4 h-4 mr-1 inline"/> ${job.salary}
                            </p>
                            
                            {/* Skills Tag */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(job.requiredSkills || []).slice(0, 3).map((skill, i) => (
                                    <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <Link to={`/student/jobs/${job.id}`} className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;