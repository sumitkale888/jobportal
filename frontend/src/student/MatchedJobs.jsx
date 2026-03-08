import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Sparkles } from 'lucide-react';
import { getAiRecommendedJobs, getStudentProfile, getAllJobs } from '../api/studentApi';

const MatchedJobs = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAiMatches = async () => {
            try {
                const profile = await getStudentProfile();
                
                // Fallback to handle different database ID field names
                const studentId = profile.id || profile.studentId || profile.userId;

                if (!studentId) {
                    console.error("Profile ID is missing. Profile data:", profile);
                    setLoading(false);
                    return;
                }

                const aiData = await getAiRecommendedJobs(studentId);
                const allJobs = await getAllJobs();

                const combinedData = aiData.map(match => {
                    const jobDetails = allJobs.find(j => j.id === match.job_id);
                    return {
                        ...jobDetails,
                        match_score: match.match_score
                    };
                }).filter(j => j.id);

                setMatches(combinedData);
            } catch (err) {
                console.error("AI matching failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAiMatches();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-600 bg-green-100 border-green-200";
        if (score >= 40) return "text-purple-600 bg-purple-100 border-purple-200";
        return "text-blue-600 bg-blue-100 border-blue-200";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
                    <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-800">
                        AI Recommended Jobs
                    </h1>
                </div>
                
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Scanning your PDF resume with AI...</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {matches.length === 0 ? (
                            <div className="col-span-3 text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                                <p className="text-gray-500 text-lg font-medium">No strong matches found yet.</p>
                                <p className="text-sm text-gray-400 mt-2">Try uploading a more detailed PDF resume!</p>
                                <Link to="/student/profile" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 mt-4">
                                    Update Resume
                                </Link>
                            </div>
                        ) : (
                            matches.map((job) => (
                                <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 relative group">
                                    
                                    <div className={`absolute -top-3 -right-3 px-4 py-1.5 rounded-full text-sm font-black border-2 shadow-sm ${getScoreColor(job.match_score)}`}>
                                        {job.match_score}% MATCH
                                    </div>

                                    <div className="flex items-center gap-3 mb-4 mt-2">
                                        {job.companyLogo ? (
                                            <img src={`data:${job.logoContentType};base64,${job.companyLogo}`} alt={job.companyName} className="w-12 h-12 rounded-lg object-contain border border-gray-200" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{job.title}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{job.companyName}</p>
                                        </div>
                                    </div>

                                    <div className="mb-6 space-y-2">
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" /> {job.location}
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {job.requiredSkills && job.requiredSkills.slice(0, 3).map((skill, index) => (
                                                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <Link 
                                        to={`/student/jobs/${job.id}`} 
                                        className="block w-full text-center bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition font-bold shadow-md shadow-purple-200"
                                    >
                                        View Job Details
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