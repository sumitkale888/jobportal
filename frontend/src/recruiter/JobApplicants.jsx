import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJobApplicants, updateApplicationStatus, scheduleInterview, sendChatMessage, getConversation, downloadResume } from '../api/recruiterApi'; // ✅ Added scheduleInterview
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { FileText, Check, X, User, ExternalLink, MessageSquare, Calendar, Send } from 'lucide-react';

const JobApplicants = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [interviewDraft, setInterviewDraft] = useState({});
    const [chatDraft, setChatDraft] = useState({});

    useEffect(() => {
        loadApplicants();
    }, [jobId]);

    const loadApplicants = async () => {
        try {
            const data = await getJobApplicants(jobId);
            setApplicants(data);
        } catch (error) {
            toast.error("Failed to load applicants");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        try {
            await updateApplicationStatus(appId, newStatus);
            toast.success(`Applicant ${newStatus.toLowerCase()}!`);
            loadApplicants(); // Refresh list
        } catch (error) {
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
        } catch (error) {
            toast.error('Failed to schedule interview');
        }
    };

    const handleSendMessage = async (applicationId, studentEmail) => {
        const content = (chatDraft[applicationId] || '').trim();
        if (!content) {
            toast.error('Message cannot be empty');
            return;
        }
        try {
            await sendChatMessage(studentEmail, content, applicationId);
            toast.success('Message sent');
            setChatDraft((prev) => ({ ...prev, [applicationId]: '' }));
        } catch (error) {
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
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Applicants for Job ID: {jobId}</h1>

                {loading ? <p>Loading...</p> : (
                    <div className="grid gap-6">
                        {applicants.length === 0 ? (
                            <div className="bg-white p-10 text-center rounded shadow">
                                <p className="text-gray-500">No applicants yet for this job.</p>
                            </div>
                        ) : (
                            applicants.map((app) => (
                                <div key={app.applicationId} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                        
                                        {/* Applicant Info */}
                                        <div className="mb-4 md:mb-0">
                                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                                <User className="w-5 h-5 mr-2 text-blue-600"/> {app.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm">{app.email} • {app.university} ({app.degree})</p>
                                            
                                            <div className="mt-3 text-sm">
                                                <p><span className="font-semibold">Skills:</span> {app.skills}</p>
                                                <p className="mt-1"><span className="font-semibold">Experience:</span> {app.experience || "Fresher"}</p>
                                                <p className="mt-1"><span className="font-semibold">CGPA:</span> {app.cgpa}</p>
                                            </div>

                                            {/* ✅ UPDATED: Secure PDF Download Button */}
                                            {app.resumeUrl && (
                                                <button 
                                                    onClick={() => downloadResume(app.studentId)}
                                                    className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 hover:underline text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-md transition"
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
                                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
                                                        <Check className="w-4 h-4 mr-1"/> Shortlist
                                                    </button>
                                                    <button onClick={() => handleStatusChange(app.applicationId, 'REJECTED')}
                                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm">
                                                        <X className="w-4 h-4 mr-1"/> Reject
                                                    </button>
                                                </div>
                                            )}

                                            {app.status === 'SHORTLISTED' && (
                                                <div className="bg-gray-50 border border-gray-200 rounded p-3 w-full">
                                                    <div className="text-sm font-semibold mb-2 text-slate-700">Schedule Interview</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        <input type="datetime-local" value={interviewDraft[app.applicationId]?.interviewDateTime || ''} onChange={(e) => setInterviewDraft(prev => ({ ...prev, [app.applicationId]: { ...prev[app.applicationId], interviewDateTime: e.target.value } }))} className="border rounded px-2 py-1 w-full text-sm" />
                                                        <input type="text" placeholder="Location (Online/Office)" value={interviewDraft[app.applicationId]?.interviewLocation || ''} onChange={(e) => setInterviewDraft(prev => ({ ...prev, [app.applicationId]: { ...prev[app.applicationId], interviewLocation: e.target.value } }))} className="border rounded px-2 py-1 w-full text-sm" />
                                                    </div>
                                                    <input type="text" placeholder="Meeting link (optional)" value={interviewDraft[app.applicationId]?.interviewLink || ''} onChange={(e) => setInterviewDraft(prev => ({ ...prev, [app.applicationId]: { ...prev[app.applicationId], interviewLink: e.target.value } }))} className="mt-2 border rounded px-2 py-1 w-full text-sm" />
                                                    <button onClick={() => handleSchedule(app.applicationId)} className="mt-2 inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-semibold"><Calendar className="w-4 h-4 mr-1" /> Schedule Interview</button>
                                                </div>
                                            )}

                                            {app.status !== 'APPLIED' && (
                                                <div className="mt-2 w-full">
                                                    <div className="text-sm font-semibold mb-1 flex items-center gap-1 text-slate-700"><MessageSquare className="w-4 h-4"/> Message Student</div>
                                                    <div className="flex gap-2">
                                                        <input type="text" placeholder="Write message..." value={chatDraft[app.applicationId] || ''} onChange={(e) => setChatDraft(prev => ({ ...prev, [app.applicationId]: e.target.value }))} className="border rounded px-2 py-1 w-full text-sm" />
                                                        <button onClick={() => handleSendMessage(app.applicationId, app.email)} className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"><Send className="w-4 h-4"/></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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

export default JobApplicants;