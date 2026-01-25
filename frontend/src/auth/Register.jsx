import React, { useState } from 'react';
import { registerUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiBriefcase, FiArrowLeft } from 'react-icons/fi';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser(formData);
            toast.success("Account created successfully!");
            navigate('/login');
        } catch (error) {
            toast.error("Registration failed.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row-reverse w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
            >
                {/* Form Area */}
                <div className="w-full md:w-1/2 p-10 lg:p-14">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                        <p className="text-gray-500 mt-1 text-sm">Join our platform to start your journey.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Full Name</label>
                            <input name="name" type="text" placeholder="John Doe" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" onChange={handleChange} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Email</label>
                            <input name="email" type="email" placeholder="john@example.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" onChange={handleChange} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Password</label>
                            <input name="password" type="password" placeholder="Min. 8 characters" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" onChange={handleChange} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 uppercase">Role</label>
                            <select name="role" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer" value={formData.role} onChange={handleChange}>
                                <option value="STUDENT">Student</option>
                                <option value="RECRUITER">Recruiter</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg mt-4 transition-all">
                            Register Account
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
                    </p>
                </div>

                {/* Left Side: Solid Blue Info Panel */}
                <div className="hidden md:flex w-1/2 bg-blue-600 p-12 text-white flex-col justify-between relative overflow-hidden">
                    <div>
                        <Link to="/" className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-12">
                            <FiArrowLeft /> Back to Website
                        </Link>
                        <h2 className="text-4xl font-bold leading-tight">Ready to start the next chapter?</h2>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><FiBriefcase /></div>
                            <p className="font-medium text-blue-50">Curated Jobs & Internships</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><FiUser /></div>
                            <p className="font-medium text-blue-50">Verified Recruiters</p>
                        </div>
                    </div>
                    
                    {/* Subtle Background Pattern */}
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-700/50 to-transparent"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;