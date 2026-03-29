import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiShield, FiTrendingUp, FiBriefcase } from 'react-icons/fi';

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
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1220] px-6 py-10 md:px-10 md:py-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.25),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(14,116,144,0.25),transparent_36%)]" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-700/70 bg-slate-900/85 shadow-[0_30px_65px_rgba(2,6,23,0.55)] backdrop-blur md:grid-cols-1 lg:grid-cols-2"
            >
                <section className="hidden bg-gradient-to-br from-slate-900 via-sky-900 to-cyan-700 p-12 text-slate-100 lg:flex lg:flex-col">
                    <p className="w-fit rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">
                        TalentFlow Jobs
                    </p>
                    <h2 className="mt-4 font-['Manrope'] text-4xl font-extrabold leading-tight">
                        A smarter way to meet the right opportunities.
                    </h2>
                    <p className="mt-4 max-w-xl text-slate-100/90 leading-relaxed">
                        Track applications, chat with recruiters, and manage your career moves from one place.
                    </p>

                    <div className="mt-10 space-y-3">
                        <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
                            <FiShield className="text-sky-300" />
                            <span>Verified company profiles and safe communication</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
                            <FiTrendingUp className="text-sky-300" />
                            <span>Role-based dashboards that keep your progress visible</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
                            <FiBriefcase className="text-sky-300" />
                            <span>Curated openings from fast-growing teams</span>
                        </div>
                    </div>
                </section>

                <section className="p-7 md:p-10 lg:p-12">
                    <div className="mb-8">
                        <p className="inline-flex rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-indigo-300">
                            Welcome Back
                        </p>
                        <h1 className="mt-3 font-['Manrope'] text-4xl font-extrabold leading-tight text-slate-100">
                            Sign in to continue
                        </h1>
                        <p className="mt-3 text-slate-400">
                            Use your registered email and password to access your dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-300">Work Email</label>
                            <div className="group relative flex items-center rounded-xl border border-slate-700 bg-slate-900 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/20">
                                <FiMail className="absolute left-3 text-slate-500 group-focus-within:text-indigo-300" />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full rounded-xl border-none bg-transparent py-3 pl-10 pr-3 text-slate-100 placeholder:text-slate-500 focus:outline-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-300">Password</label>
                            <div className="group relative flex items-center rounded-xl border border-slate-700 bg-slate-900 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/20">
                                <FiLock className="absolute left-3 text-slate-500 group-focus-within:text-indigo-300" />
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border-none bg-transparent py-3 pl-10 pr-3 text-slate-100 placeholder:text-slate-500 focus:outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 font-semibold text-white shadow-[0_15px_24px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5"
                        >
                            Login to Dashboard <FiArrowRight />
                        </button>
                    </form>

                    <p className="mt-7 text-sm text-slate-400">
                        New to TalentFlow?{' '}
                        <Link to="/register" className="font-bold text-indigo-300 hover:underline">
                            Create your account
                        </Link>
                    </p>
                </section>
            </motion.div>
        </div>
    );
};

export default Login;