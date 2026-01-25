import React, { useEffect, useState } from 'react';
import { getAllJobs } from '../api/jobApi';
import { searchJobs } from '../api/studentApi';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign,Search } from 'lucide-react';

const StudentDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added error state
    const [searchTerm, setSearchTerm] = useState('');
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
    // ✅ Handle Search Submit
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await searchJobs(searchTerm);
            setJobs(data);
        } catch (error) {
            console.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

   return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                {/* Header & Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">Latest Job Openings 🚀</h1>
                    
                    {/* ✅ Search Form */}
                    <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
                        <input 
                            type="text" 
                            placeholder="Search by title or location..." 
                            className="w-full p-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 text-white px-6 rounded-r-lg hover:bg-blue-700 transition flex items-center">
                            <Search className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                {loading ? <p className="text-center text-gray-500">Loading jobs...</p> : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.length === 0 ? (
                            <p className="col-span-3 text-center text-gray-500">No jobs found matching "{searchTerm}".</p>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                                    <p className="text-gray-600 flex items-center mb-2">
                                        <Briefcase className="w-4 h-4 mr-2"/> {job.companyName}
                                    </p>
                                    <p className="text-gray-500 flex items-center mb-4">
                                        <MapPin className="w-4 h-4 mr-2"/> {job.location}
                                    </p>
                                    
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                        <span className="text-blue-600 font-bold">
                                            ${job.salary ? job.salary.toLocaleString() : 'N/A'}
                                        </span>
                                        <Link to={`/student/jobs/${job.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                                            View Details
                                        </Link>
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

export default StudentDashboard;