import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJobApplicants, updateApplicationStatus } from '../api/recruiterApi';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { FileText, Check, X, User, ExternalLink } from 'lucide-react';

const JobApplicants = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'SHORTLISTED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Shortlisted</span>;
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

                                            {/* Resume Link */}
                                            {app.resumeUrl && (
                                                <a href={app.resumeUrl} target="_blank" rel="noreferrer" 
                                                   className="inline-flex items-center mt-3 text-blue-600 hover:underline text-sm font-medium">
                                                    <FileText className="w-4 h-4 mr-1"/> View Resume <ExternalLink className="w-3 h-3 ml-1"/>
                                                </a>
                                            )}
                                        </div>

                                        {/* Status & Actions */}
                                        <div className="flex flex-col items-end gap-3">
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