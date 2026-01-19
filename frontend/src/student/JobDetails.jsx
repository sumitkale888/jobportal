import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../api/jobApi';
import { applyForJob } from '../api/applicationApi';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { MapPin, DollarSign, Building, Briefcase, CheckCircle } from 'lucide-react';

const JobDetails = () => {
    const { id } = useParams(); // Get Job ID from URL
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJob();
    }, [id]);

    const loadJob = async () => {
        try {
            const data = await getJobById(id);
            setJob(data);
        } catch (error) {
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
            // Optional: navigate to 'My Applications' page
        } catch (error) {
            // Check if it's the "Profile missing" error
            if (error.response && error.response.status === 500) {
                 toast.error("Please complete your profile first!");
                 navigate('/student/profile');
            } else {
                 toast.error(error.response?.data || "Failed to apply");
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
                    {/* Header */}
                    <div className="bg-blue-600 p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                        <div className="flex items-center space-x-6 opacity-90">
                            <span className="flex items-center"><Building className="w-5 h-5 mr-2"/> {job.companyName}</span>
                            <span className="flex items-center"><MapPin className="w-5 h-5 mr-2"/> {job.location}</span>
                            <span className="flex items-center"><DollarSign className="w-5 h-5 mr-2"/> {job.salary}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-blue-500"/> Job Description
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
                            {job.description}
                        </p>

                        <div className="border-t pt-8">
                            <button 
                                onClick={handleApply}
                                className="flex items-center justify-center w-full md:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg"
                            >
                                <CheckCircle className="w-5 h-5 mr-2"/>
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;