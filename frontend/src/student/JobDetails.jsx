import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../api/jobApi';
import { applyForJob } from '../api/applicationApi';
import { matchResumeToJob } from '../api/studentApi';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { MapPin, DollarSign, Building, Briefcase, CheckCircle } from 'lucide-react';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resumeText, setResumeText] = useState('');
    const [matchResult, setMatchResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    useEffect(() => {
        loadJob();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadJob = async () => {
        try {
            const data = await getJobById(id);
            setJob(data);
        } catch {
            toast.error("Job not found");
            navigate('/student/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        try {
            await applyForJob(id);
            toast.success("Application Submitted Successfully!");
            navigate('/student/applications'); // Redirect to see your application
        } catch (error) {
            console.error("Apply Error:", error);
            
            // ✅ FIX: Read the ACTUAL error message from backend
            const errorMsg = error.response?.data?.message || error.response?.data || "Failed to apply";
            
            if (errorMsg.includes("complete your profile")) {
                toast.error("Please complete your profile first!");
                navigate('/student/profile');
            } else if (errorMsg.includes("already applied")) {
                toast.info("You have already applied for this job.");
            } else {
                toast.error(errorMsg);
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!job) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-blue-600 p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                        <div className="flex items-center space-x-6 opacity-90">
                            <span className="flex items-center"><Building className="w-5 h-5 mr-2"/> {job.companyName}</span>
                            <span className="flex items-center"><MapPin className="w-5 h-5 mr-2"/> {job.location}</span>
                            <span className="flex items-center"><DollarSign className="w-5 h-5 mr-2"/> {job.salary}</span>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-blue-500"/> Job Description
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
                            {job.description}
                        </p>

                        <div className="border-t pt-8">
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Paste your resume text for AI matching</label>
                                <textarea
                                    rows={4}
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="Enter a short resume summary or bullet points..."
                                />
                            </div>
                            <div className="flex flex-col md:flex-row items-start gap-2">
                                <button
                                    onClick={async () => {
                                        if (!resumeText.trim() || !job?.requiredSkills?.length) {
                                            setAiError('Please provide resume text and ensure job has required skills.');
                                            return;
                                        }
                                        setAiError('');
                                        setAiLoading(true);
                                        try {
                                            const result = await matchResumeToJob(resumeText, job.requiredSkills || []);
                                            setMatchResult(result);
                                        } catch (err) {
                                            setAiError('AI service currently unavailable.');
                                            console.error(err);
                                        } finally {
                                            setAiLoading(false);
                                        }
                                    }}
                                    className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                                >
                                    {aiLoading ? 'Matching...' : 'Calculate AI Match'}
                                </button>
                                <button 
                                    onClick={handleApply}
                                    className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                                >
                                    <CheckCircle className="w-4 h-4 mr-1 inline"/> Apply Now
                                </button>
                            </div>

                            {aiError && <p className="mt-3 text-sm text-red-600">{aiError}</p>}
                            {matchResult && (
                                <div className="mt-4 rounded-lg border border-indigo-100 p-3 bg-indigo-50">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-indigo-800">AI Match Summary</h4>
                                        <span className="text-sm font-semibold text-indigo-700">{matchResult.match_percentage}%</span>
                                    </div>
                                    <div className="mt-2 text-sm text-slate-700">
                                        <p><span className="font-semibold">Matched Skills:</span> {matchResult.matched_skills?.join(', ') || 'None'}</p>
                                        <p><span className="font-semibold">Missing Skills:</span> {matchResult.missing_skills?.join(', ') || 'None'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;