import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle, AlertCircle } from 'lucide-react';

const MatchedJobs = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This calls the "JobMatcherService" we fixed!
        axiosInstance.get('/jobs/match') 
            .then(res => setMatches(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-600 bg-green-100";
        if (score >= 50) return "text-blue-600 bg-blue-100";
        return "text-yellow-600 bg-yellow-100";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        <span role="img" aria-label="fire">🔥</span> Jobs Matched For You
                    </h1>
                </div>
                
                {loading ? <p>Calculating matches based on your skills...</p> : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {matches.length === 0 ? (
                            <div className="col-span-3 text-center py-10">
                                <p className="text-gray-500 text-lg">No matches found yet.</p>
                                <p className="text-sm text-gray-400">Try adding more skills to your profile!</p>
                                <Link to="/student/profile" className="text-blue-600 hover:underline mt-2 block">
                                    Update Profile
                                </Link>
                            </div>
                        ) : (
                            matches.map((item) => (
                                <div key={item.job.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500 relative">
                                    
                                    {/* Match Score Badge */}
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold flex items-center ${getScoreColor(item.matchPercentage)}`}>
                                        {item.matchPercentage}% Match
                                    </div>

                                    <div className="mb-4 mt-2">
                                        <h3 className="text-xl font-bold text-gray-800">{item.job.title}</h3>
                                        <p className="text-gray-600 flex items-center mt-1">
                                            <Briefcase className="w-4 h-4 mr-1"/> {item.job.companyName}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 mb-2">
                                            <span className="font-semibold">Required:</span> {item.job.requiredSkills ? item.job.requiredSkills.join(", ") : "None"}
                                        </p>
                                        <p className="text-sm font-medium text-blue-600">
                                            {item.matchStatus}
                                        </p>
                                    </div>

                                    <Link 
                                        to={`/student/jobs/${item.job.id}`} 
                                        className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
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

export default MatchedJobs;