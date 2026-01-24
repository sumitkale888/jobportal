import React, { useState, useEffect } from 'react';
import { getRecruiterProfile, updateRecruiterProfile } from '../api/recruiterApi';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { Building, MapPin, Globe } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <Building className="mr-2 text-blue-600"/> Company Profile
                    </h2>

                    {loading ? <p>Loading...</p> : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Company Name</label>
                                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full p-3 border rounded-lg" required />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Website URL</label>
                                <div className="flex items-center border rounded-lg bg-white">
                                    <Globe className="ml-3 text-gray-400 w-5 h-5"/>
                                    <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full p-3 outline-none" placeholder="https://company.com" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Headquarters Location</label>
                                <div className="flex items-center border rounded-lg bg-white">
                                    <MapPin className="ml-3 text-gray-400 w-5 h-5"/>
                                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                                        className="w-full p-3 outline-none" placeholder="New York, NY" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">About Company</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 border rounded-lg h-32" placeholder="Tell us about your company..." />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">Company Logo</label>
                                <input type="file" onChange={(e) => setLogo(e.target.files[0])} 
                                    className="w-full p-2 border rounded bg-gray-50" accept="image/*" />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                                Save Profile
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruiterProfile;