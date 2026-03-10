import React, { useState, useEffect } from 'react';
import { postJob } from '../api/recruiterApi'; 
import axiosInstance from '../api/axiosInstance'; // ✅ Needed to fetch profile status
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react'; // ✅ Icon for the restricted screen

const PostJob = () => {
    const navigate = useNavigate();
    
    // ✅ Verification States
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    const [jobData, setJobData] = useState({
        title: '',
        companyName: '',
        location: '',
        jobType: 'FULL_TIME',
        salary: '',
        description: '',
        requiredSkills: []
    });
    const [skillInput, setSkillInput] = useState('');

    // ✅ Fetch Profile Status on Page Load
    useEffect(() => {
        const checkVerification = async () => {
            try {
                const profileRes = await axiosInstance.get('/recruiter/profile');
                setIsVerified(profileRes.data.verified === true || profileRes.data.isVerified === true);
            } catch (error) {
                console.error("Could not fetch profile", error);
                // If they don't even have a profile yet, they definitely aren't verified
                setIsVerified(false); 
            } finally {
                setLoading(false);
            }
        };
        checkVerification();
    }, []);

    const handleChange = (e) => {
        setJobData({ ...jobData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Convert comma string "Java, React" -> Array ["Java", "React"]
        const finalData = {
            ...jobData,
            requiredSkills: skillInput.split(',').map(s => s.trim()).filter(s => s !== "")
        };

        try {
            await postJob(finalData);
            toast.success("Job Posted Successfully!");
            navigate('/recruiter/dashboard');
        } catch (error) {
            console.error("Post Error:", error);
            const msg = error.response?.data?.message || "Failed to post job. Check description length or permissions.";
            toast.error(msg);
        }
    };

    // ⏳ Show loading screen while checking database
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 font-bold text-xl">Verifying permissions...</p>
            </div>
        );
    }

    // 🛑 SHOW LOCKED SCREEN IF NOT VERIFIED
    if (!isVerified) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                        <AlertTriangle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-black text-gray-800 mb-4">Access Restricted</h1>
                        <p className="text-gray-600 mb-8 text-lg">
                            You must wait for Admin approval before you can access the job creation form. 
                            Our team is reviewing your company details.
                        </p>
                        <Link to="/recruiter/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ NORMAL FORM RENDERS IF VERIFIED
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Post a New Job</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input type="text" name="title" placeholder="Job Title" onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                            <input type="text" name="companyName" placeholder="Company Name" onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input type="text" name="location" placeholder="Location" onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                            <input type="number" name="salary" placeholder="Salary" onChange={handleChange} className="p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>

                        <div className="mb-4">
                            <select name="jobType" onChange={handleChange} className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <textarea name="description" placeholder="Job Description (Detailed)..." onChange={handleChange} className="w-full p-3 border rounded h-32 focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (Comma separated)</label>
                            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Java, React, Spring Boot" required />
                        </div>

                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition">
                            Publish Job
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostJob;