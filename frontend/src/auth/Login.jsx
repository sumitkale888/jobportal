import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser(email, password);
            login(data.token); 
            toast.success("Welcome back!");
            const decoded = jwtDecode(data.token);
            let role = decoded.roles || decoded.role || decoded.authorities;
            if (Array.isArray(role)) role = role[0];
            if (typeof role === 'object' && role.authority) role = role.authority;
            
            if (role === 'STUDENT' || role === 'ROLE_STUDENT') navigate('/student/dashboard');
            else if (role === 'RECRUITER' || role === 'ROLE_RECRUITER') navigate('/recruiter/dashboard');
            else navigate('/admin/dashboard');
        } catch (error) {
            toast.error("Invalid Credentials");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
            >
                {/* Left Side: Form Area */}
                <div className="w-full md:w-1/2 p-10 lg:p-16">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">Login</h1>
                        <p className="text-gray-500 mt-2">Enter your details to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <div className="relative flex items-center group">
                                <FiMail className="absolute left-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="email" 
                                    placeholder="name@company.com" 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <div className="relative flex items-center group">
                                <FiLock className="absolute left-3 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2">
                            Sign In <FiArrowRight />
                        </button>
                    </form>
                    
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register now</Link>
                    </p>
                </div>

                {/* Right Side: Simple Blue Info Panel */}
                <div className="hidden md:flex w-1/2 bg-blue-600 p-12 text-white flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold leading-tight">Connect with the best companies.</h2>
                        <p className="mt-4 text-blue-100 text-lg font-light">Join thousands of professionals finding their dream jobs every day.</p>
                    </div>
                    {/* Minimalist Graphic Element */}
                    <div className="absolute top-0 right-0 p-8">
                        <FiUser size={120} className="text-blue-500 opacity-30" />
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-20"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;