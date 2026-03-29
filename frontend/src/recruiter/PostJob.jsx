import React, { useState, useEffect } from 'react';
import { postJob } from '../api/recruiterApi'; 
import axiosInstance from '../api/axiosInstance'; // ✅ Needed to fetch profile status
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react'; // ✅ Icon for the restricted screen
import { DashboardShell, PageHeader, SurfaceCard, Input, Select, TextArea, PrimaryButton, SecondaryButton } from '../components/ui/DashboardUI';

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
            <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
                <p className="text-slate-400 font-bold text-xl">Verifying permissions...</p>
            </div>
        );
    }

    // 🛑 SHOW LOCKED SCREEN IF NOT VERIFIED
    if (!isVerified) {
        return (
            <DashboardShell contentClassName="mx-auto w-full max-w-3xl px-4 py-20 text-center">
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-10">
                        <AlertTriangle className="w-20 h-20 text-amber-300 mx-auto mb-6" />
                        <h1 className="text-3xl font-black text-slate-100 mb-4">Access Restricted</h1>
                        <p className="text-amber-100/90 mb-8 text-lg">
                            You must wait for Admin approval before you can access the job creation form. 
                            Our team is reviewing your company details.
                        </p>
                        <Link to="/recruiter/dashboard" className="ui-btn ui-btn-primary px-8 py-3">
                            Return to Dashboard
                        </Link>
                    </div>
            </DashboardShell>
        );
    }

    // ✅ NORMAL FORM RENDERS IF VERIFIED
    return (
        <DashboardShell contentClassName="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <PageHeader
                    badge='Job Publishing'
                    title='Post a New Job'
                    subtitle='Create a high-quality listing with clear role details and skills requirements.'
                    actions={<Link to='/recruiter/dashboard' className='ui-btn ui-btn-secondary'>Back</Link>}
                />

                <SurfaceCard>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input type="text" name="title" placeholder="Job Title" onChange={handleChange} required />
                            <Input type="text" name="companyName" placeholder="Company Name" onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input type="text" name="location" placeholder="Location" onChange={handleChange} required />
                            <Input type="number" name="salary" placeholder="Salary" onChange={handleChange} required />
                        </div>

                        <div className="mb-4">
                            <Select name="jobType" onChange={handleChange}>
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="INTERNSHIP">Internship</option>
                            </Select>
                        </div>

                        <div className="mb-4">
                            <TextArea name="description" placeholder="Job Description (Detailed)..." onChange={handleChange} className='h-32' required />
                        </div>

                        <div className="mb-6">
                            <label className="ui-label">Required Skills (Comma separated)</label>
                            <Input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Java, React, Spring Boot" required />
                        </div>

                        <div className='flex gap-2'>
                            <PrimaryButton type="submit" className='w-full'>Publish Job</PrimaryButton>
                            <SecondaryButton type='button' className='w-full' onClick={() => navigate('/recruiter/dashboard')}>Cancel</SecondaryButton>
                        </div>
                    </form>
                </SurfaceCard>
        </DashboardShell>
    );
};

export default PostJob;