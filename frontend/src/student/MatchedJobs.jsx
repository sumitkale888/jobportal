import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Sparkles, CheckCircle2, XCircle, BrainCircuit, X } from 'lucide-react';
import { getAiRecommendedJobs, getStudentProfile, getAllJobs } from '../api/studentApi';

const MatchedJobs = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInsight, setSelectedInsight] = useState(null); // Controls the Modal

    useEffect(() => {
        const fetchAiMatches = async () => {
            try {
                const profile = await getStudentProfile();
                const studentId = profile.id || profile.studentId || profile.userId;

                if (!studentId) return setLoading(false);

                const aiData = await getAiRecommendedJobs(studentId);
                const allJobs = await getAllJobs();

                const combinedData = aiData.map(match => {
                    const jobDetails = allJobs.find(j => j.id === match.job_id);
                    return {
                        ...jobDetails,
                        match_score: match.match_score,
                        matched_skills: match.matched_skills || [],
                        missing_skills: match.missing_skills || []
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
        if (score >= 70) return "text-green-700 bg-green-100 border-green-200";
        if (score >= 30) return "text-orange-700 bg-orange-100 border-orange-200";
        return "text-red-700 bg-red-100 border-red-200";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            {/* 🚨 AI INSIGHTS MODAL 🚨 */}
            {selectedInsight && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-start text-white">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <BrainCircuit className="w-6 h-6"/> AI Match Insights
                                </h2>
                                <p className="text-purple-100 mt-1">{selectedInsight.title} at {selectedInsight.companyName}</p>
                            </div>
                            <button onClick={() => setSelectedInsight(null)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Overall Compatibility</span>
                                <span className={`text-4xl font-black ${getScoreColor(selectedInsight.match_score).split(' ')[0]}`}>
                                    {selectedInsight.match_score}%
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Matched Skills Box */}
                                <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                                    <h3 className="font-bold text-green-800 flex items-center gap-1.5 mb-3 text-sm">
                                        <CheckCircle2 className="w-4 h-4"/> Found in Resume
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedInsight.matched_skills.length > 0 ? selectedInsight.matched_skills.map((s, i) => (
                                            <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-semibold border border-green-200">{s}</span>
                                        )) : <span className="text-xs text-green-600/60 italic">No exact matches</span>}
                                    </div>
                                </div>

                                {/* Missing Skills Box */}
                                <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                                    <h3 className="font-bold text-red-800 flex items-center gap-1.5 mb-3 text-sm">
                                        <XCircle className="w-4 h-4"/> Missing/To Learn
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedInsight.missing_skills.length > 0 ? selectedInsight.missing_skills.map((s, i) => (
                                            <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md font-semibold border border-red-200">{s}</span>
                                        )) : <span className="text-xs text-red-600/60 italic">None missing!</span>}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setSelectedInsight(null)} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">
                                Close Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* JOB LISTINGS GRID */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
                    <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-800">AI Recommended Jobs</h1>
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
                            </div>
                        ) : (
                            matches.map((job) => (
                                <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 relative group flex flex-col justify-between">
                                    
                                    <div>
                                        {/* Clickable AI Badge */}
                                        <button 
                                            onClick={() => setSelectedInsight(job)}
                                            className={`absolute -top-3 -right-3 px-3 py-1.5 rounded-full text-xs font-black border-2 shadow-sm flex items-center gap-1 transition hover:scale-105 active:scale-95 cursor-pointer ${getScoreColor(job.match_score)}`}
                                            title="Click to see AI Insights"
                                        >
                                            <BrainCircuit className="w-3 h-3"/> {job.match_score}% MATCH
                                        </button>

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
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button 
                                            onClick={() => setSelectedInsight(job)}
                                            className="flex-1 bg-purple-50 text-purple-700 py-2 rounded-lg hover:bg-purple-100 transition font-bold text-sm border border-purple-200"
                                        >
                                            View AI Match
                                        </button>
                                        <Link 
                                            to={`/student/jobs/${job.id}`} 
                                            className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-bold text-sm shadow-md shadow-blue-200"
                                        >
                                            Apply Job
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

export default MatchedJobs;