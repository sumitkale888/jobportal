import React, { useEffect, useState } from 'react';
import { getMyApplications, withdrawApplication } from '../api/applicationApi';
import { toast } from 'react-toastify';
import { Building, MapPin, Calendar, Trash2 } from 'lucide-react';
import { DashboardShell, PageHeader, SurfaceCard, EmptyState } from '../components/ui/DashboardUI';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const data = await getMyApplications();
            setApplications(data);
        } catch (error) {
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (appId) => {
        if (!window.confirm("Are you sure you want to delete/withdraw this application?")) return;

        try {
            await withdrawApplication(appId);
            toast.success("Application removed successfully");
            setApplications(applications.filter(app => app.applicationId !== appId));
        } catch (error) {
            // Check if error is specifically about shortlisting
            const msg = error.response?.data?.message || "Failed to remove application";
            toast.error(msg);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPLIED': return 'bg-indigo-500/15 text-indigo-300 border-indigo-400/40';
            case 'SHORTLISTED': return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40';
            case 'REJECTED': return 'bg-rose-500/15 text-rose-300 border-rose-400/40';
            default: return 'bg-slate-700/70 text-slate-300 border-slate-600';
        }
    };

    return (
        <DashboardShell>
            <PageHeader
                badge="Application Tracker"
                title="My Job Applications"
                subtitle="Monitor progress, review status changes, and manage active submissions."
            />
                
                {loading ? (
                    <p className="text-center text-slate-400">Loading...</p>
                ) : (
                    <div className="grid gap-6">
                        {applications.length === 0 ? (
                            <EmptyState title="No applications yet" description="Apply to roles from the dashboard and your activity will appear here." />
                        ) : (
                            applications.map((app) => (
                                <SurfaceCard key={app.applicationId} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="mb-4 md:mb-0">
                                        <h3 className="text-xl font-bold text-slate-100">{app.jobTitle}</h3>
                                        <div className="mt-2 flex flex-col space-y-1 text-sm text-slate-400 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                                            <span className="flex items-center"><Building className="w-4 h-4 mr-1.5 text-slate-500"/> {app.companyName}</span>
                                            <span className="hidden sm:inline text-slate-700">|</span>
                                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-slate-500"/> Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                        {app.status === 'INTERVIEW_SCHEDULED' && app.interviewDateTime && (
                                            <span className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700">Interview: {new Date(app.interviewDateTime).toLocaleString()}</span>
                                        )}

                                        {(app.status === 'APPLIED' || app.status === 'REJECTED') && (
                                            <button 
                                                onClick={() => handleWithdraw(app.applicationId)}
                                                className="p-2 rounded-full text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition"
                                                title={app.status === 'REJECTED' ? "Delete History" : "Withdraw Application"}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </SurfaceCard>
                            ))
                        )}
                    </div>
                )}
        </DashboardShell>
    );
};

export default Applications;