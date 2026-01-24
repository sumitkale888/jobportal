import React, { useState } from 'react';
import { postJob } from '../api/recruiterApi'; // Ensure this import exists
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PostJob = () => {
    const navigate = useNavigate();
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

    const handleChange = (e) => {
        setJobData({ ...jobData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ✅ Convert comma string "Java, React" -> Array ["Java", "React"]
        const finalData = {
            ...jobData,
            requiredSkills: skillInput.split(',').map(s => s.trim()).filter(s => s !== "")
        };

        console.log("Sending Data:", finalData); // Check Console for debugging

        try {
            await postJob(finalData);
            toast.success("Job Posted Successfully!");
            navigate('/recruiter/dashboard');
        } catch (error) {
            console.error("Post Error:", error);
            // Show exact error from backend if available
            const msg = error.response?.data?.message || "Failed to post job. Check description length or permissions.";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Post a New Job</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input type="text" name="title" placeholder="Job Title" onChange={handleChange} className="p-3 border rounded" required />
                            <input type="text" name="companyName" placeholder="Company Name" onChange={handleChange} className="p-3 border rounded" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input type="text" name="location" placeholder="Location" onChange={handleChange} className="p-3 border rounded" required />
                            <input type="number" name="salary" placeholder="Salary" onChange={handleChange} className="p-3 border rounded" required />
                        </div>

                        <div className="mb-4">
                            <select name="jobType" onChange={handleChange} className="w-full p-3 border rounded">
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <textarea name="description" placeholder="Job Description (Detailed)..." onChange={handleChange} className="w-full p-3 border rounded h-32" required />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (Comma separated)</label>
                            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                className="w-full p-3 border rounded" placeholder="Java, React, Spring Boot" required />
                        </div>

                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700">
                            Publish Job
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostJob;