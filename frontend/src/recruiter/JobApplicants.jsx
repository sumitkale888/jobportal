import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJobApplicants, rankCandidatesForJob, updateApplicationStatus, scheduleInterview, sendChatMessage, downloadResume } from '../api/recruiterApi';
import { toast } from 'react-toastify';
import { FileText, Check, X, User, ExternalLink, MessageSquare, Calendar, Send } from 'lucide-react';
import { DashboardShell, PageHeader, SurfaceCard, Input, PrimaryButton, EmptyState } from '../components/ui/DashboardUI';

const JobApplicants = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [expandedApplicantId, setExpandedApplicantId] = useState(null);
    const [rankedCandidates, setRankedCandidates] = useState([]);
    const [rankStatus, setRankStatus] = useState('idle');
    const [loading, setLoading] = useState(true);
    const [interviewDraft, setInterviewDraft] = useState({});
    const [chatDraft, setChatDraft] = useState({});

    useEffect(() => {
        console.log('📥 JobApplicants mounted or jobId changed:', jobId);
        loadApplicants();
        loadRankedCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    const loadApplicants = async () => {
        try {
            console.log('📥 Loading applicants for job:', jobId);
            const data = await getJobApplicants(jobId);
            console.log('📥 Got applicants:', data);
            data.forEach((app, idx) => {
                console.log(`   [${idx}] applicationId=${app.applicationId}, studentId=${app.studentId}, studentName=${app.studentName}, studentEmail=${app.studentEmail}, status=${app.status}`);
            });
            setApplicants(data);
        } catch (err) {
            console.error('❌ Error loading applicants:', err);
            toast.error("Failed to load applicants");
        } finally {
            setLoading(false);
        }
    };

    const loadRankedCandidates = async () => {
        setRankStatus('loading');
        try {
            const data = await rankCandidatesForJob(jobId);
            setRankedCandidates(data.ranked_candidates || []);
            setRankStatus('success');
        } catch (err) {
            console.error(err);
            setRankStatus('error');
            toast.error('Failed to load AI candidate ranking');
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        try {
            await updateApplicationStatus(appId, newStatus);
            toast.success(`Applicant ${newStatus.toLowerCase()}!`);
            loadApplicants(); // Refresh list
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    const handleSchedule = async (applicationId) => {
        const draft = interviewDraft[applicationId];
        if (!draft?.interviewDateTime || !draft?.interviewLocation) {
            toast.error('Please choose date/time and location');
            return;
        }
        try {
            await scheduleInterview(applicationId, draft.interviewDateTime, draft.interviewLocation, draft.interviewLink || '');
            toast.success('Interview scheduled and student notified');
            setInterviewDraft((prev) => ({ ...prev, [applicationId]: {} }));
            loadApplicants();
        } catch (err) {
            console.error(err);
            toast.error('Failed to schedule interview');
        }
    };

    const handleSendMessage = async (e, applicationId, studentUserId) => {
        e.preventDefault();
        e.stopPropagation();
        
        const content = (chatDraft[applicationId] || '').trim();
        console.log('📤 handleSendMessage called');
        console.log('   applicationId:', applicationId);
        console.log('   studentUserId:', studentUserId);
        console.log('   content:', content);
        console.log('   applicants data:', applicants);
        const applicant = applicants.find(a => a.applicationId === applicationId);
        console.log('   found applicant:', applicant);
        
        if (!content) {
            toast.error('Message cannot be empty');
            return;
        }
        if (!studentUserId) {
            console.error('❌ studentUserId is null/undefined!');
            toast.error('Student ID not found');
            return;
        }
        
        try {
            console.log('📤 Sending message to studentUserId:', studentUserId, 'with applicationId:', applicationId);
            await sendChatMessage(studentUserId, content, applicationId);
            console.log('✅ Message sent successfully');
            toast.success('Message sent');
            setChatDraft((prev) => ({ ...prev, [applicationId]: '' }));
        } catch (err) {
            console.error('❌ Error sending message:', err);
            toast.error('Failed to send message');
        }
    };


    const getStatusBadge = (status) => {
        switch (status) {
            case 'SHORTLISTED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Shortlisted</span>;
            case 'INTERVIEW_SCHEDULED': return <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">Interview Scheduled</span>;
            case 'REJECTED': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">Rejected</span>;
            default: return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">Applied</span>;
        }
    };

    return (
        <DashboardShell>
            <PageHeader
                badge='Recruiter Pipeline'
                icon={User}
                title={`Applicants for Job ID: ${jobId}`}
                subtitle='Review candidates, shortlists, interview schedules, and direct messages from one workspace.'
                actions={<PrimaryButton onClick={loadRankedCandidates}>Refresh AI Rankings</PrimaryButton>}
            />

                <div className="mb-4">
                    <div className="bg-slate-900/80 shadow-sm rounded-lg border border-slate-700 p-3 flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">AI candidate ranking</div>
                            <div className="mt-1 text-slate-300 text-sm">{rankStatus === 'loading' ? 'Loading...' : rankedCandidates.length ? `${rankedCandidates.length} candidates ranked` : 'No ranking available yet.'}</div>
                        </div>
                        {rankStatus === 'error' && <span className="text-rose-300 text-sm font-semibold">Unable to fetch ranking</span>}
                    </div>
                </div>

                {rankedCandidates.length > 0 && (
                    <div className="bg-slate-900/80 p-3 rounded-lg shadow-sm border border-indigo-400/30 mb-6">
                        <div className="text-sm font-semibold text-indigo-300">Top Ranked Candidates</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                            {rankedCandidates.slice(0, 3).map((candidate) => (
                                <div key={candidate.candidate_id} className="rounded-lg border border-indigo-400/30 px-3 py-2 bg-indigo-500/10">
                                    <div className="flex items-center justify-between text-sm"><span className="font-semibold">#{candidate.candidate_rank}</span><span className="font-semibold">{candidate.match_percentage}%</span></div>
                                    <div className="text-xs text-slate-200 mt-1">{candidate.name || 'Candidate'} · ID {candidate.candidate_id}</div>
                                    <div className="text-xs text-slate-300 mt-1"><strong>Matched:</strong> {candidate.matched_skills?.join(', ') || 'None'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? <p>Loading...</p> : (
                    <div className="grid gap-6">
                        {applicants.length === 0 ? (
                            <EmptyState title='No applicants yet' description='Applicants will appear here once candidates start applying.' />
                        ) : (
                            applicants.map((app) => (
                                <SurfaceCard key={app.applicationId}>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                        
                                        {/* Applicant Info */}
                                        <div className="mb-4 md:mb-0">
                                            <h3 className="text-xl font-bold text-slate-100 flex items-center">
                                                <User className="w-5 h-5 mr-2 text-indigo-300"/> {app.name}
                                            </h3>
                                            <p className="text-slate-400 text-sm">{app.email} • {app.phone || 'No phone provided'}</p>
                                            <p className="text-slate-400 text-sm">{app.university || 'N/A'} ({app.degree || 'N/A'}) • {app.location || 'Location not provided'}</p>
                                            {app.headline && <p className="mt-2 text-sm text-indigo-200 font-medium">{app.headline}</p>}
                                            
                                            <div className="mt-3 text-sm">
                                                <p><span className="font-semibold">Skills:</span> {app.skills}</p>
                                                <p className="mt-1"><span className="font-semibold">Experience:</span> {app.experience || "Fresher"}</p>
                                                <p className="mt-1"><span className="font-semibold">CGPA:</span> {app.cgpa}</p>
                                            </div>

                                            <button
                                                onClick={() => setExpandedApplicantId((prev) => prev === app.applicationId ? null : app.applicationId)}
                                                className="mt-3 ui-btn ui-btn-secondary py-1.5 text-xs"
                                            >
                                                {expandedApplicantId === app.applicationId ? 'Hide Full Profile' : 'View Full Profile'}
                                            </button>

                                            {expandedApplicantId === app.applicationId && (
                                                <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200 space-y-3">
                                                    {app.about && <p><span className="font-semibold text-slate-100">About:</span> {app.about}</p>}
                                                    <p><span className="font-semibold text-slate-100">Education:</span> {app.degree || 'N/A'}{app.specialization ? `, ${app.specialization}` : ''} at {app.university || 'N/A'}</p>
                                                    <p><span className="font-semibold text-slate-100">Graduation Year:</span> {app.graduationYear || 'N/A'} | <span className="font-semibold text-slate-100">Semester:</span> {app.currentSemester || 'N/A'} | <span className="font-semibold text-slate-100">Course Type:</span> {app.courseType || 'N/A'}</p>
                                                    {app.projects && <p><span className="font-semibold text-slate-100">Projects:</span> {app.projects}</p>}
                                                    {app.certifications && <p><span className="font-semibold text-slate-100">Certifications:</span> {app.certifications}</p>}
                                                    {app.achievements && <p><span className="font-semibold text-slate-100">Achievements:</span> {app.achievements}</p>}
                                                    {app.preferredRoles && <p><span className="font-semibold text-slate-100">Preferred Roles:</span> {app.preferredRoles}</p>}
                                                    {app.languages && <p><span className="font-semibold text-slate-100">Languages:</span> {app.languages}</p>}
                                                    {app.links && <p><span className="font-semibold text-slate-100">Profile Links:</span> {app.links}</p>}
                                                </div>
                                            )}

                                            {/* ✅ UPDATED: Secure PDF Download Button */}
                                            {app.resumeUrl && (
                                                <button 
                                                    onClick={() => downloadResume(app.studentId)}
                                                    className="inline-flex items-center mt-3 text-indigo-300 hover:text-indigo-200 text-sm font-bold bg-indigo-500/10 px-3 py-1.5 rounded-md transition border border-indigo-400/30"
                                                >
                                                    <FileText className="w-4 h-4 mr-1"/> View PDF Resume <ExternalLink className="w-3 h-3 ml-1"/>
                                                </button>
                                            )}
                                        </div>

                                        {/* Status & Actions */}
                                        <div className="flex flex-col items-end gap-3 w-full">
                                            <div className="mb-2">
                                                {getStatusBadge(app.status)}
                                            </div>
                                            {app.status === 'APPLIED' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleStatusChange(app.applicationId, 'SHORTLISTED')}
                                                        className="ui-btn ui-btn-primary py-2 text-sm">
                                                        <Check className="w-4 h-4 mr-1"/> Shortlist
                                                    </button>
                                                    <button onClick={() => handleStatusChange(app.applicationId, 'REJECTED')}
                                                        className="ui-btn ui-btn-danger py-2 text-sm">
                                                        <X className="w-4 h-4 mr-1"/> Reject
                                                    </button>
                                                </div>
                                            )}

                                            {app.status === 'SHORTLISTED' && (
                                                <div className="bg-slate-950/70 border border-slate-700 rounded p-3 w-full">
                                                    <div className="text-sm font-semibold mb-2 text-slate-200">Schedule Interview</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        <Input type="datetime-local" value={interviewDraft[app.applicationId]?.interviewDateTime || ''} onChange={(e) => setInterviewDraft(prev => ({ ...prev, [app.applicationId]: { ...prev[app.applicationId], interviewDateTime: e.target.value } }))} className='text-sm' />
                                                        <Input type="text" placeholder="Location (Online/Office)" value={interviewDraft[app.applicationId]?.interviewLocation || ''} onChange={(e) => setInterviewDraft(prev => ({ ...prev, [app.applicationId]: { ...prev[app.applicationId], interviewLocation: e.target.value } }))} className='text-sm' />
                                                    </div>
                                                    <Input type="text" placeholder="Meeting link (optional)" value={interviewDraft[app.applicationId]?.interviewLink || ''} onChange={(e) => setInterviewDraft(prev => ({ ...prev, [app.applicationId]: { ...prev[app.applicationId], interviewLink: e.target.value } }))} className='mt-2 text-sm' />
                                                    <button onClick={() => handleSchedule(app.applicationId)} className="mt-2 ui-btn ui-btn-primary text-xs"><Calendar className="w-4 h-4 mr-1" /> Schedule Interview</button>
                                                </div>
                                            )}

                                            {app.status !== 'APPLIED' && (
                                                <div className="mt-2 w-full">
                                                    <div className="text-sm font-semibold mb-1 flex items-center gap-1 text-slate-200"><MessageSquare className="w-4 h-4"/> Message Student</div>
                                                    <div className="flex gap-2">
                                                        <Input type="text" placeholder="Write message..." value={chatDraft[app.applicationId] || ''} onChange={(e) => setChatDraft(prev => ({ ...prev, [app.applicationId]: e.target.value }))} className='text-sm' />
                                                        <button onClick={(e) => handleSendMessage(e, app.applicationId, app.studentUserId)} className="ui-btn ui-btn-secondary whitespace-nowrap"><Send className="w-4 h-4"/></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SurfaceCard>
                            ))
                        )}
                    </div>
                )}
        </DashboardShell>
    );
};

export default JobApplicants;