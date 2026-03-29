import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Sparkles, CheckCircle2, XCircle, BrainCircuit, X } from 'lucide-react';
import { getAiRecommendedJobs, getStudentProfile, getAllJobs } from '../api/studentApi';
import { DashboardShell, PageHeader, SurfaceCard, PrimaryButton, SecondaryButton, EmptyState } from '../components/ui/DashboardUI';

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
        if (score >= 70) return "text-emerald-300 bg-emerald-500/15 border-emerald-400/40";
        if (score >= 30) return "text-amber-300 bg-amber-500/15 border-amber-400/40";
        return "text-rose-300 bg-rose-500/15 border-rose-400/40";
    };

    return (
        <DashboardShell>
            
            {/* 🚨 AI INSIGHTS MODAL 🚨 */}
            {selectedInsight && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                            <div className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl border border-slate-700">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Compatibility</span>
                                <span className={`text-4xl font-black ${getScoreColor(selectedInsight.match_score).split(' ')[0]}`}>
                                    {selectedInsight.match_score}%
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Matched Skills Box */}
                                <div className="bg-emerald-500/10 border border-emerald-400/30 p-4 rounded-xl">
                                    <h3 className="font-bold text-emerald-300 flex items-center gap-1.5 mb-3 text-sm">
                                        <CheckCircle2 className="w-4 h-4"/> Found in Resume
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedInsight.matched_skills.length > 0 ? selectedInsight.matched_skills.map((s, i) => (
                                            <span key={i} className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded-md font-semibold border border-emerald-400/30">{s}</span>
                                        )) : <span className="text-xs text-emerald-200/60 italic">No exact matches</span>}
                                    </div>
                                </div>

                                {/* Missing Skills Box */}
                                <div className="bg-rose-500/10 border border-rose-400/30 p-4 rounded-xl">
                                    <h3 className="font-bold text-rose-300 flex items-center gap-1.5 mb-3 text-sm">
                                        <XCircle className="w-4 h-4"/> Missing/To Learn
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedInsight.missing_skills.length > 0 ? selectedInsight.missing_skills.map((s, i) => (
                                            <span key={i} className="text-xs bg-rose-500/20 text-rose-200 px-2 py-1 rounded-md font-semibold border border-rose-400/30">{s}</span>
                                        )) : <span className="text-xs text-rose-200/60 italic">None missing!</span>}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setSelectedInsight(null)} className="ui-btn ui-btn-secondary w-full py-3">
                                Close Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* JOB LISTINGS GRID */}
            <PageHeader badge='AI Matching' icon={Sparkles} title='AI Recommended Jobs' subtitle='Ranked opportunities based on your profile and skill similarity.' />
                
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-slate-400 font-medium">Scanning your resume with AI...</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {matches.length === 0 ? (
                            <div className='col-span-3'><EmptyState title='No strong matches yet' description='Complete your profile and add more skills to improve AI recommendations.' /></div>
                        ) : (
                            matches.map((job) => (
                                <SurfaceCard key={job.id} className="relative group flex flex-col justify-between transition hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-[0_24px_55px_rgba(99,102,241,0.22)]">
                                    
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
                                                <img src={`data:${job.logoContentType};base64,${job.companyLogo}`} alt={job.companyName} className="w-12 h-12 rounded-lg object-contain border border-slate-700" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-300">
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-100 line-clamp-1">{job.title}</h3>
                                                <p className="text-sm text-slate-400 font-medium">{job.companyName}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6 space-y-2">
                                            <p className="text-sm text-slate-400 flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-slate-500" /> {job.location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <SecondaryButton 
                                            onClick={() => setSelectedInsight(job)}
                                            className="flex-1"
                                        >
                                            View AI Match
                                        </SecondaryButton>
                                        <Link 
                                            to={`/student/jobs/${job.id}`} 
                                            className="ui-btn ui-btn-primary flex-1"
                                        >
                                            Apply Job
                                        </Link>
                                    </div>
                                </SurfaceCard>
                            ))
                        )}
                    </div>
                )}
        </DashboardShell>
    );
};

export default MatchedJobs;