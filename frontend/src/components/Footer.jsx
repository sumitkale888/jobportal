import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, ChevronUp, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
    const { user } = useAuth();
    const location = useLocation();

    const normalizedRole = user?.role?.replace(/^ROLE_/, '');
    const isStudentContext = normalizedRole === 'STUDENT' || location.pathname.startsWith('/student');
    const isRecruiterContext = normalizedRole === 'RECRUITER' || location.pathname.startsWith('/recruiter');
    const isAdminContext = normalizedRole === 'ADMIN' || location.pathname.startsWith('/admin');

    let dashboardPath = '/login';
    if (normalizedRole === 'STUDENT') dashboardPath = '/student/dashboard';
    if (normalizedRole === 'RECRUITER') dashboardPath = '/recruiter/dashboard';
    if (normalizedRole === 'ADMIN') dashboardPath = '/admin/dashboard';

    const quickLinks = [
        { label: 'Dashboard', to: dashboardPath },
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
        { label: 'Notifications', to: '/notifications' }
    ];

    let portalLinks = [
        { label: 'Find Jobs', to: '/student/dashboard' },
        { label: 'AI Matches', to: '/student/matches' },
        { label: 'Post a Job', to: '/recruiter/post-job' },
        { label: 'Recruiter Dashboard', to: '/recruiter/dashboard' }
    ];

    if (isStudentContext) {
        portalLinks = [
            { label: 'Student Dashboard', to: '/student/dashboard' },
            { label: 'Matched Jobs', to: '/student/matches' },
            { label: 'My Applications', to: '/student/applications' },
            { label: 'My Profile', to: '/student/profile' }
        ];
    } else if (isRecruiterContext) {
        portalLinks = [
            { label: 'Recruiter Dashboard', to: '/recruiter/dashboard' },
            { label: 'Post a Job', to: '/recruiter/post-job' },
            { label: 'AI Match Rankings', to: '/recruiter/ai-matches' },
            { label: 'Company Profile', to: '/recruiter/profile' }
        ];
    } else if (isAdminContext) {
        portalLinks = [
            { label: 'Admin Dashboard', to: '/admin/dashboard' },
            { label: 'Notifications', to: '/notifications' },
            { label: 'Student Portal', to: '/student/dashboard' },
            { label: 'Recruiter Portal', to: '/recruiter/dashboard' }
        ];
    }

    const currentYear = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
            <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <h3 className="font-['Manrope'] text-2xl font-extrabold text-white">JobPortal</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                            Career platform connecting students, professionals, and recruiters with faster hiring workflows.
                        </p>
                        <div className="mt-5 space-y-2 text-sm text-slate-300">
                            <a href="mailto:support@jobportal.com" className="flex items-center gap-2 hover:text-white">
                                <Mail className="h-4 w-4" /> support@jobportal.com
                            </a>
                            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-white">
                                <Phone className="h-4 w-4" /> +91 98765 43210
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Quick Links</h4>
                        <ul className="mt-4 space-y-2 text-sm">
                            {quickLinks.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                                    >
                                        {item.label} <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Portal</h4>
                        <ul className="mt-4 space-y-2 text-sm">
                            {portalLinks.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                                    >
                                        {item.label} <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Current Page</h4>
                        <p className="mt-4 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
                            {location.pathname}
                        </p>
                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500 hover:text-white"
                        >
                            Back to Top <ChevronUp className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-10 border-t border-slate-800 pt-5 text-sm text-slate-400 sm:flex sm:items-center sm:justify-between">
                    <p>Copyright {currentYear} JobPortal. All rights reserved.</p>
                    <p className="mt-2 sm:mt-0">Built for hiring teams and job seekers.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
