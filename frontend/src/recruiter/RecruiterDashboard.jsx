import React, { useEffect, useState } from 'react';
import { getRecruiterDashboard, getMyPostedJobs } from '../api/recruiterApi';
import axiosInstance from '../api/axiosInstance'; 
import { Users, Trash2, AlertTriangle, PlusCircle, Briefcase } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DashboardShell, PageHeader, SurfaceCard, EmptyState } from '../components/ui/DashboardUI';

const RecruiterDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [isVerified, setIsVerified] = useState(false); // 🚨 Added for Verification check
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch stats and jobs
            await getRecruiterDashboard();
            const jobsData = await getMyPostedJobs();
            setJobs(jobsData);

            // 🚨 Fetch profile to check verification status
            const profileRes = await axiosInstance.get('/recruiter/profile');
            setIsVerified(profileRes.data.verified === true || profileRes.data.isVerified === true);
            
        } catch {
            console.error('Failed to load recruiter data');
        } finally {
            setLoading(false);
        }
    };

    // ✅ FEATURE: Handle Delete
    const handleDeleteJob = async (jobId) => {
        if(!window.confirm("Are you sure you want to delete this job? This will also remove all applications.")) return;

        try {
            await axiosInstance.delete(`/jobs/${jobId}`);
            toast.success("Job deleted successfully");
            loadData(); // Refresh list
        } catch {
            toast.error("Failed to delete job");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold text-xl">Loading Dashboard...</div>;

    return (
        <DashboardShell>
            <PageHeader
                badge="Recruiter Workspace"
                icon={Briefcase}
                title="Company Hiring Dashboard"
                subtitle="Track job postings, review applicants, and use AI ranking to prioritize top talent."
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Link to="/recruiter/ai-matches" className="ui-btn ui-btn-secondary">AI Match Rankings</Link>
                        {isVerified ? (
                            <Link to="/recruiter/post-job" className="ui-btn ui-btn-primary"><PlusCircle className="w-4 h-4"/> Post a New Job</Link>
                        ) : (
                            <button disabled className="ui-btn ui-btn-secondary opacity-60 cursor-not-allowed"><AlertTriangle className="w-4 h-4"/> Post Job Locked</button>
                        )}
                    </div>
                }
            />

                {/* 🚨 THE PENDING BANNER 🚨 */}
                {!isVerified && (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 mb-8 shadow-sm flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-300 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-amber-200 font-bold text-lg">Account Pending Admin Approval</h3>
                            <p className="text-amber-100/90 mt-1">
                                Your company profile is currently being reviewed by our moderation team to ensure platform safety. 
                                <strong> You will be able to post jobs as soon as you are verified.</strong>
                            </p>
                        </div>
                    </div>
                )}

                {/* ... Add your stats cards back here if you have them ... */}

                <SurfaceCard className="mt-8 p-0 overflow-hidden">
                    <table className="ui-table">
                        <thead>
                            <tr>
                                <th className="p-4">Job Title</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Posted Date</th>
                                <th className="p-4">Expires</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8">
                                        <EmptyState title="No jobs posted yet" description="Create your first role to begin receiving applications." />
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job.id}>
                                        <td className="p-4 font-bold text-slate-100">{job.title}</td>
                                        <td className="p-4">{job.location}</td>
                                        <td className="p-4">{new Date(job.postedAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {job.expiresAt ? (
                                                <span className={job.expired ? 'rounded-full border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-300' : 'rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300'}>
                                                    {job.expired ? 'Expired' : new Date(job.expiresAt).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className='text-slate-400'>Not set</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center flex justify-center gap-4">
                                            <Link 
                                                to={`/recruiter/jobs/${job.id}/applicants`} 
                                                className="ui-btn ui-btn-secondary py-1.5"
                                            >
                                                <Users className="w-4 h-4 mr-2"/> Applicants
                                            </Link>
                                            
                                            {/* ✅ Delete Button */}
                                            <button 
                                                onClick={() => handleDeleteJob(job.id)}
                                                className="ui-btn ui-btn-danger py-1.5"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1"/> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </SurfaceCard>
        </DashboardShell>
    );
};

export default RecruiterDashboard;