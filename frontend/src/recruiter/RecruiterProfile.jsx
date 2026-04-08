import React, { useState, useEffect } from 'react';
import { getRecruiterProfile, updateRecruiterProfile } from '../api/recruiterApi';
import { toast } from 'react-toastify';
import { Building, MapPin, Globe, Users, BadgeCheck, Phone, Mail, Briefcase } from 'lucide-react';
import { DashboardShell, PageHeader, SurfaceCard, Input, TextArea, PrimaryButton } from '../components/ui/DashboardUI';

const RecruiterProfile = () => {
    const [loading, setLoading] = useState(true);
    const [profileForm, setProfileForm] = useState({
        companyName: '',
        website: '',
        description: '',
        location: '',
        industry: '',
        companySize: '',
        foundedYear: '',
        companyType: '',
        contactPersonName: '',
        contactPersonDesignation: '',
        contactPhone: '',
        hrEmail: '',
        linkedInUrl: '',
        hiringForRoles: '',
        officeLocations: '',
        benefits: '',
        aboutCulture: '',
        isVerified: false,
    });
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getRecruiterProfile();
            setProfileForm({
                companyName: data.companyName || '',
                website: data.websiteUrl || '',
                description: data.companyDescription || '',
                location: data.headOfficeLocation || '',
                industry: data.industry || '',
                companySize: data.companySize || '',
                foundedYear: data.foundedYear || '',
                companyType: data.companyType || '',
                contactPersonName: data.contactPersonName || '',
                contactPersonDesignation: data.contactPersonDesignation || '',
                contactPhone: data.contactPhone || '',
                hrEmail: data.hrEmail || '',
                linkedInUrl: data.linkedInUrl || '',
                hiringForRoles: data.hiringForRoles || '',
                officeLocations: data.officeLocations || '',
                benefits: data.benefits || '',
                aboutCulture: data.aboutCulture || '',
                isVerified: Boolean(data.isVerified),
            });
        } catch (error) {
            console.log("No profile yet");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append("companyName", profileForm.companyName);
        payload.append("website", profileForm.website);
        payload.append("description", profileForm.description);
        payload.append("location", profileForm.location);
        payload.append("industry", profileForm.industry);
        payload.append("companySize", profileForm.companySize);
        payload.append("foundedYear", profileForm.foundedYear);
        payload.append("companyType", profileForm.companyType);
        payload.append("contactPersonName", profileForm.contactPersonName);
        payload.append("contactPersonDesignation", profileForm.contactPersonDesignation);
        payload.append("contactPhone", profileForm.contactPhone);
        payload.append("hrEmail", profileForm.hrEmail);
        payload.append("linkedInUrl", profileForm.linkedInUrl);
        payload.append("hiringForRoles", profileForm.hiringForRoles);
        payload.append("officeLocations", profileForm.officeLocations);
        payload.append("benefits", profileForm.benefits);
        payload.append("aboutCulture", profileForm.aboutCulture);
        if (logo) {
            payload.append("logo", logo);
        }

        try {
            await updateRecruiterProfile(payload);
            toast.success("Company Profile Saved!");
            await loadProfile();
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
                subtitle="Create a complete company profile so students and admins can trust and evaluate your organization quickly."
            />

            <SurfaceCard>

                    {loading ? <p className='text-slate-400'>Loading...</p> : (
                        <form onSubmit={handleSubmit}>
                            <div className={`mb-6 rounded-xl border p-3 text-sm font-semibold ${profileForm.isVerified ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-400/30 bg-amber-500/10 text-amber-300'}`}>
                                {profileForm.isVerified ? 'Company status: Verified by admin' : 'Company status: Pending admin verification'}
                            </div>

                            <div className="mb-4">
                                <label className="ui-label">Company Name</label>
                                <Input type="text" name="companyName" value={profileForm.companyName} onChange={handleChange} required />
                            </div>

                            <div className="mb-4">
                                <label className="ui-label">Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-5 w-5 text-slate-500"/>
                                    <Input type="text" name="website" value={profileForm.website} onChange={handleChange} className='pl-10' placeholder="https://company.com" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="ui-label">Headquarters Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-500"/>
                                    <Input type="text" name="location" value={profileForm.location} onChange={handleChange} className='pl-10' placeholder="Pune, Maharashtra" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="ui-label"><Briefcase className="inline mr-1 h-4 w-4" /> Industry</label>
                                    <Input type="text" name="industry" value={profileForm.industry} onChange={handleChange} placeholder="Information Technology" />
                                </div>
                                <div>
                                    <label className="ui-label"><Users className="inline mr-1 h-4 w-4" /> Company Size</label>
                                    <Input type="text" name="companySize" value={profileForm.companySize} onChange={handleChange} placeholder="51-200 employees" />
                                </div>
                                <div>
                                    <label className="ui-label">Founded Year</label>
                                    <Input type="text" name="foundedYear" value={profileForm.foundedYear} onChange={handleChange} placeholder="2018" />
                                </div>
                                <div>
                                    <label className="ui-label">Company Type</label>
                                    <Input type="text" name="companyType" value={profileForm.companyType} onChange={handleChange} placeholder="Product / Service / Startup" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="ui-label">About Company</label>
                                <TextArea name="description" value={profileForm.description} onChange={handleChange} className='h-32' placeholder="Tell us about your company, mission, and work areas..." />
                            </div>

                            <div className="mb-6">
                                <label className="ui-label">Work Culture</label>
                                <TextArea name="aboutCulture" value={profileForm.aboutCulture} onChange={handleChange} className='h-24' placeholder="How teams collaborate, growth mindset, values..." />
                            </div>

                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="ui-label"><BadgeCheck className="inline mr-1 h-4 w-4" /> Contact Person Name</label>
                                    <Input type="text" name="contactPersonName" value={profileForm.contactPersonName} onChange={handleChange} placeholder="Riya Sharma" />
                                </div>
                                <div>
                                    <label className="ui-label">Designation</label>
                                    <Input type="text" name="contactPersonDesignation" value={profileForm.contactPersonDesignation} onChange={handleChange} placeholder="Talent Acquisition Lead" />
                                </div>
                                <div>
                                    <label className="ui-label"><Phone className="inline mr-1 h-4 w-4" /> Contact Phone</label>
                                    <Input type="text" name="contactPhone" value={profileForm.contactPhone} onChange={handleChange} placeholder="+91 9000000000" />
                                </div>
                                <div>
                                    <label className="ui-label"><Mail className="inline mr-1 h-4 w-4" /> HR Email</label>
                                    <Input type="email" name="hrEmail" value={profileForm.hrEmail} onChange={handleChange} placeholder="careers@company.com" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="ui-label">LinkedIn URL</label>
                                <Input type="text" name="linkedInUrl" value={profileForm.linkedInUrl} onChange={handleChange} placeholder="https://www.linkedin.com/company/..." />
                            </div>

                            <div className="mb-6">
                                <label className="ui-label">Roles You Are Hiring For</label>
                                <TextArea name="hiringForRoles" value={profileForm.hiringForRoles} onChange={handleChange} className='h-24' placeholder="Backend Engineer, Frontend Engineer, Data Analyst..." />
                            </div>

                            <div className="mb-6">
                                <label className="ui-label">Office Locations</label>
                                <TextArea name="officeLocations" value={profileForm.officeLocations} onChange={handleChange} className='h-24' placeholder="Pune, Bengaluru, Remote" />
                            </div>

                            <div className="mb-6">
                                <label className="ui-label">Benefits and Perks</label>
                                <TextArea name="benefits" value={profileForm.benefits} onChange={handleChange} className='h-24' placeholder="Flexible hours, Medical insurance, Learning budget..." />
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