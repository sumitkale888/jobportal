import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../api/jobApi';
import { applyForJob } from '../api/applicationApi';
import { matchResumeToJob } from '../api/studentApi';
import { toast } from 'react-toastify';
import { MapPin, DollarSign, Building, Briefcase, CheckCircle } from 'lucide-react';
import { DashboardShell, PageHeader, SurfaceCard, TextArea, PrimaryButton, SecondaryButton } from '../components/ui/DashboardUI';

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

    if (loading) return <div className='min-h-screen bg-[#0b1220] text-slate-400 grid place-items-center'>Loading...</div>;
    if (!job) return null;

    return (
        <DashboardShell contentClassName='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
            <PageHeader
                badge='Job Details'
                icon={Briefcase}
                title={job.title}
                subtitle='Review requirements, run AI match, and submit your application.'
            />
            <SurfaceCard className='overflow-hidden p-0'>
                    <div className="bg-gradient-to-r from-indigo-700 to-violet-700 p-8 text-white">
                        <div className="flex flex-wrap items-center gap-6 opacity-90">
                            <span className="flex items-center"><Building className="w-5 h-5 mr-2"/> {job.companyName}</span>
                            <span className="flex items-center"><MapPin className="w-5 h-5 mr-2"/> {job.location}</span>
                            <span className="flex items-center"><DollarSign className="w-5 h-5 mr-2"/> {job.salary}</span>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-indigo-300"/> Job Description
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-8 whitespace-pre-line">
                            {job.description}
                        </p>

                        <div className="border-t border-slate-800 pt-8">
                            <div className="mb-4">
                                <label className="ui-label">Paste your resume text for AI matching</label>
                                <TextArea
                                    rows={4}
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    className="resize-none"
                                    placeholder="Enter a short resume summary or bullet points..."
                                />
                            </div>
                            <div className="flex flex-col md:flex-row items-start gap-2">
                                <PrimaryButton
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
                                >
                                    {aiLoading ? 'Matching...' : 'Calculate AI Match'}
                                </PrimaryButton>
                                <SecondaryButton onClick={handleApply}>
                                    <CheckCircle className="w-4 h-4 mr-1 inline"/> Apply Now
                                </SecondaryButton>
                            </div>

                            {aiError && <p className="mt-3 text-sm text-rose-300">{aiError}</p>}
                            {matchResult && (
                                <div className="mt-4 rounded-lg border border-indigo-400/30 p-3 bg-indigo-500/10">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-indigo-200">AI Match Summary</h4>
                                        <span className="text-sm font-semibold text-indigo-300">{matchResult.match_percentage}%</span>
                                    </div>
                                    <div className="mt-2 text-sm text-slate-300">
                                        <p><span className="font-semibold">Matched Skills:</span> {matchResult.matched_skills?.join(', ') || 'None'}</p>
                                        <p><span className="font-semibold">Missing Skills:</span> {matchResult.missing_skills?.join(', ') || 'None'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
            </SurfaceCard>
        </DashboardShell>
    );
};

export default JobDetails;