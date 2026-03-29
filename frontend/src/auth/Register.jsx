import React, { useState } from 'react';
import { registerUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiBriefcase, FiCheckCircle, FiLock, FiMail, FiUser } from 'react-icons/fi';

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
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-lime-50 to-cyan-50 p-6 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(255,255,255,0.85),transparent_34%),radial-gradient(circle_at_84%_78%,rgba(16,185,129,0.2),transparent_32%)]" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-emerald-200/70 bg-white/90 shadow-[0_30px_65px_rgba(6,78,59,0.16)] backdrop-blur md:grid-cols-1 lg:grid-cols-2"
            >
                <section className="p-7 md:p-10 lg:p-12">
                    <div className="mb-7">
                        <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">
                            Start Your Career Journey
                        </p>
                        <h1 className="mt-3 font-['Manrope'] text-4xl font-extrabold leading-tight text-slate-900">
                            Create your account
                        </h1>
                        <p className="mt-3 text-slate-600">
                            Build your profile once and apply to jobs with confidence.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                            <div className="group relative flex items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
                                <FiUser className="absolute left-3 text-slate-400 group-focus-within:text-emerald-600" />
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="Jane Smith"
                                    className="w-full rounded-xl border-none bg-transparent py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                            <div className="group relative flex items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
                                <FiMail className="absolute left-3 text-slate-400 group-focus-within:text-emerald-600" />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="jane@domain.com"
                                    className="w-full rounded-xl border-none bg-transparent py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Password</label>
                            <div className="group relative flex items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
                                <FiLock className="absolute left-3 text-slate-400 group-focus-within:text-emerald-600" />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Choose a strong password"
                                    className="w-full rounded-xl border-none bg-transparent py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">I am joining as</label>
                            <select
                                name="role"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="STUDENT">Student</option>
                                <option value="RECRUITER">Recruiter</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 px-4 py-3 font-semibold text-white shadow-[0_15px_24px_rgba(5,150,105,0.28)] transition hover:-translate-y-0.5"
                        >
                            Create Account <FiArrowRight />
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-slate-600">
                        Already registered?{' '}
                        <Link to="/login" className="font-bold text-emerald-700 hover:underline">
                            Sign in instead
                        </Link>
                    </p>
                </section>

                <section className="hidden bg-gradient-to-br from-emerald-950 via-green-900 to-lime-800 p-12 text-emerald-50 lg:flex lg:flex-col">
                    <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm text-emerald-100/90 hover:text-white">
                        <FiArrowLeft /> Back to portal
                    </Link>
                    <h2 className="mt-4 font-['Manrope'] text-4xl font-extrabold leading-tight">
                        Find jobs that match your skills, not just your title.
                    </h2>
                    <p className="mt-4 max-w-xl text-emerald-50/90 leading-relaxed">
                        Students and recruiters use TalentFlow to connect faster through meaningful profiles and smarter matching.
                    </p>

                    <div className="mt-10 space-y-3">
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm">
                            <FiCheckCircle className="text-emerald-300" />
                            <span>Role-based onboarding in less than two minutes</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm">
                            <FiBriefcase className="text-emerald-300" />
                            <span>Access to internships, jobs, and hiring pipelines</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm">
                            <FiUser className="text-emerald-300" />
                            <span>Built for freshers, experienced talent, and hiring teams</span>
                        </div>
                    </div>
                </section>
            </motion.div>
        </div>
    );
};

export default Register;