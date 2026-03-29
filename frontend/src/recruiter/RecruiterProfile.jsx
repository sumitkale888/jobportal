import React, { useState, useEffect } from 'react';
import { getRecruiterProfile, updateRecruiterProfile } from '../api/recruiterApi';
import { toast } from 'react-toastify';
import { Building, MapPin, Globe } from 'lucide-react';
import { DashboardShell, PageHeader, SurfaceCard, Input, TextArea, PrimaryButton } from '../components/ui/DashboardUI';

const RecruiterProfile = () => {
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getRecruiterProfile();
            setCompanyName(data.companyName || '');
            setWebsite(data.websiteUrl || '');
            setDescription(data.companyDescription || '');
            setLocation(data.headOfficeLocation || '');
        } catch (error) {
            console.log("No profile yet");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // We MUST use FormData for file uploads
        const formData = new FormData();
        formData.append("companyName", companyName);
        formData.append("website", website);
        formData.append("description", description);
        formData.append("location", location);
        if (logo) {
            formData.append("logo", logo);
        }

        try {
            await updateRecruiterProfile(formData);
            toast.success("Company Profile Saved!");
        } catch (error) {
            toast.error("Failed to save profile.");
        }
    };

    return (
        <DashboardShell contentClassName="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <PageHeader
                badge="Recruiter Profile"
                icon={Building}
                title="Company Profile"
                subtitle="Showcase your brand identity and keep company information updated for applicants."
            />

            <SurfaceCard>

                    {loading ? <p className='text-slate-400'>Loading...</p> : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="ui-label">Company Name</label>
                                <Input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                            </div>

                            <div className="mb-4">
                                <label className="ui-label">Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-5 w-5 text-slate-500"/>
                                    <Input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className='pl-10' placeholder="https://company.com" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="ui-label">Headquarters Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-500"/>
                                    <Input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className='pl-10' placeholder="New York, NY" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="ui-label">About Company</label>
                                <TextArea value={description} onChange={(e) => setDescription(e.target.value)} className='h-32' placeholder="Tell us about your company..." />
                            </div>

                            <div className="mb-6">
                                <label className="ui-label">Company Logo</label>
                                <input type="file" onChange={(e) => setLogo(e.target.files[0])} 
                                    className="ui-input p-2" accept="image/*" />
                            </div>

                            <PrimaryButton type="submit" className='w-full'>
                                Save Profile
                            </PrimaryButton>
                        </form>
                    )}
            </SurfaceCard>
        </DashboardShell>
    );
};

export default RecruiterProfile;