import React, { useEffect, useState, useRef } from 'react';
import { getAllJobs, searchJobs } from '../api/studentApi'; 
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Search, Filter, X, Clock, ChevronRight, Sparkles } from 'lucide-react';

// 🚨 Make sure this path is correct based on your folder structure!
import heroImage from '../assets/job1.png'; 

const StudentDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    
    // Reference to target the jobs section for scrolling
    const jobsSectionRef = useRef(null);

    // Filter State
    const [filters, setFilters] = useState({
        title: '',
        location: '',
        type: '',
        skill: ''
    });

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const data = await getAllJobs();
            setJobs(data);
        } catch {
            console.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanFilters = {};
            Object.keys(filters).forEach(key => {
                if (filters[key]) cleanFilters[key] = filters[key];
            });

            const data = await searchJobs(cleanFilters);
            setJobs(data);
            scrollToJobs(); // Auto-scroll down when searching
        } catch {
            console.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({ title: '', location: '', type: '', skill: '' });
        loadJobs();
    };

    const scrollToJobs = () => {
        jobsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getJobTypeStyles = (jobType) => {
        switch (jobType) {
            case 'FULL_TIME':
                return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
            case 'PART_TIME':
                return 'text-amber-700 bg-amber-50 border border-amber-200';
            case 'INTERNSHIP':
                return 'text-violet-700 bg-violet-50 border border-violet-200';
            case 'REMOTE':
                return 'text-sky-700 bg-sky-50 border border-sky-200';
            case 'CONTRACT':
                return 'text-rose-700 bg-rose-50 border border-rose-200';
            default:
                return 'text-slate-700 bg-slate-100 border border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#e0e7ff_0%,#f8fafc_45%,#f8fafc_100%)] font-sans selection:bg-indigo-100 selection:text-indigo-700">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* --- HERO SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 mt-4 lg:mt-8">
                    
                    {/* LEFT COLUMN: Text & Search */}
                    <div className="space-y-6 z-10">
                        <div className="inline-block bg-white/80 backdrop-blur border border-indigo-100 text-indigo-700 font-extrabold px-4 py-1.5 rounded-full text-xs md:text-sm mb-2 tracking-[0.12em] shadow-sm">
                            #1 PLATFORM FOR JOBS 🔥
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.02] tracking-tight">
                            Find Your <br/> <span className="text-indigo-600">Next Chapter</span>
                        </h1>
                        
                        <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-lg">
                            Search and find your dream job is now easier than ever. Just browse a job and apply if you need to.
                        </p>

                        <div className="pt-4">
                            {/* Polished Search Bar */}
                            <form onSubmit={handleSearch} className="relative max-w-xl">
                                <div className="flex items-center bg-white/95 border border-slate-200 rounded-2xl p-2 pl-5 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:shadow-[0_14px_32px_rgba(15,23,42,0.12)]">
                                    <Search className="w-5 h-5 text-slate-400 mr-3" />
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={filters.title}
                                        onChange={handleFilterChange}
                                        placeholder="Job title, Salary, or Companies..." 
                                        className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-base lg:text-lg"
                                    />
                                    <button 
                                        type="submit" 
                                        className="bg-slate-900 text-white px-6 lg:px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm whitespace-nowrap ml-2"
                                    >
                                        Explore Now
                                    </button>
                                </div>
                            </form>
                            
                            {/* Popular Tags */}
                            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-slate-500 font-semibold mr-1">Popular Categories:</span>
                                <button className="font-bold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3 py-1 rounded-full transition">Java Dev</button>
                                <button className="font-bold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3 py-1 rounded-full transition">Spring Boot</button>
                                <button className="font-bold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3 py-1 rounded-full transition">React</button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive Image & Floating Elements */}
                    <div className="relative flex justify-center items-center h-[400px] md:h-[500px] lg:h-[600px] mt-10 lg:mt-0 group cursor-default">
                        
                        {/* 🌟 BIG INTERACTIVE YELLOW BACKGROUND */}
                        <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-gradient-to-br from-amber-200 to-yellow-300 rounded-[42%_58%_62%_38%/45%_34%_66%_55%] z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-105 shadow-[0_24px_80px_rgba(250,204,21,0.35)] transition-all duration-700 ease-out"></div>
                        
                        {/* Interactive secondary pulse ring */}
                        <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] border border-amber-300 rounded-[42%_58%_62%_38%/45%_34%_66%_55%] z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"></div>

                        {/* Main Person Image */}
                        <img 
                            src={heroImage} 
                            alt="Job Seeker" 
                            className="relative z-10 w-full h-full object-contain drop-shadow-2xl group-hover:-translate-y-3 transition-transform duration-500 ease-out"
                        />

                        {/* Floating Element 1 (Top Left) */}
                        <div className="absolute top-1/4 left-0 md:-left-4 z-20 bg-white p-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-bounce group-hover:scale-110 transition-transform duration-300" style={{animationDuration: '3s'}}>
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                W
                            </div>
                        </div>

                        {/* Floating Element 2 (Middle Left) */}
                        <div className="absolute top-1/2 left-4 md:-left-12 z-20 bg-white/95 backdrop-blur p-3 md:p-4 rounded-2xl shadow-[0_14px_45px_rgb(0,0,0,0.16)] flex items-center gap-3 md:gap-4 transform -translate-y-1/2 group-hover:-translate-x-4 transition-transform duration-500 border border-slate-100">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <div className="text-xl md:text-2xl">🍎</div>
                            </div>
                            <div>
                                <p className="text-[10px] md:text-xs text-gray-500 font-semibold mb-0.5">Tech Corp</p>
                                <p className="text-xs md:text-sm font-bold text-slate-800">Hiring Developer</p>
                                <p className="text-[10px] md:text-xs text-slate-400 mt-1">2 Days ago • Full-time</p>
                            </div>
                        </div>

                        {/* Floating Element 3 (Top Right) */}
                        <div className="absolute top-10 right-4 md:right-12 z-20 bg-white p-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-bounce group-hover:scale-110 transition-transform duration-300" style={{animationDuration: '4s'}}>
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                                <Briefcase className="w-5 h-5"/>
                            </div>
                        </div>

                        {/* Floating Element 4 (Bottom Right) */}
                        <div className="absolute bottom-1/4 right-0 md:-right-4 z-20 bg-white/95 backdrop-blur p-3 md:p-4 rounded-2xl shadow-[0_14px_45px_rgb(0,0,0,0.16)] flex items-center gap-3 group-hover:translate-x-4 transition-transform duration-500 border border-slate-100">
                            <div className="w-8 h-8 md:w-10 md:h-10 border border-slate-200 rounded-full flex items-center justify-center">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-slate-600"/>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-bold text-slate-800">UI/UX Designer</p>
                                <p className="text-[10px] md:text-xs text-slate-500">40 Vacancies</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- JOBS SECTION --- */}
                <div className="max-w-7xl mx-auto pt-10" ref={jobsSectionRef}>
                    
                    {/* 🌟 AI MATCH DASHBOARD BANNER (Moved here!) */}
                    <div className="mb-12 bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-[0_20px_50px_rgba(49,46,129,0.35)] text-white">
                        <div className="text-center md:text-left mb-4 md:mb-0">
                            <h3 className="text-xl md:text-2xl font-extrabold flex items-center justify-center md:justify-start gap-2">
                                <Sparkles className="text-yellow-300 w-6 h-6"/> AI Job Matchmaker
                            </h3>
                            <p className="text-indigo-100 mt-2 font-medium">
                                Let our AI analyze your skills and find the opportunities you are most likely to land.
                            </p>
                        </div>
                        <Link 
                            to="/student/matches" 
                            className="whitespace-nowrap bg-white text-indigo-900 px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-md active:scale-95 flex items-center gap-2"
                        >
                            View AI Matches <ChevronRight className="w-4 h-4"/>
                        </Link>
                    </div>

                    <div className="rounded-[30px] border border-slate-200/90 bg-white/80 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.09)] backdrop-blur md:p-8">
                        {/* Jobs Header & Filter Toggle */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 border-b border-slate-200 pb-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-700">Opportunities</p>
                                <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">All Available Jobs</h2>
                                <p className="mt-1 text-sm text-slate-500">Explore curated roles from trusted employers.</p>
                            </div>
                            
                            <button 
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="mt-4 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
                            >
                                <Filter className="w-4 h-4" /> Advanced Filters
                            </button>
                        </div>

                        {/* EXPANDABLE FILTERS */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out mb-8 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-white via-indigo-50/40 to-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input type="text" name="location" value={filters.location} onChange={handleFilterChange} placeholder="City or State" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700 shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Skill</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input type="text" name="skill" value={filters.skill} onChange={handleFilterChange} placeholder="e.g. React, Node" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700 shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Type</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700 appearance-none cursor-pointer shadow-sm">
                                                <option value="">Any Type</option>
                                                <option value="FULL_TIME">Full Time</option>
                                                <option value="PART_TIME">Part Time</option>
                                                <option value="INTERNSHIP">Internship</option>
                                                <option value="CONTRACT">Contract</option>
                                                <option value="REMOTE">Remote</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={handleSearch} className="rounded-xl bg-slate-900 px-6 py-2 font-semibold text-white transition hover:bg-indigo-700">Apply Filters</button>
                                    <button onClick={clearFilters} className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-2 font-semibold text-red-600 transition hover:bg-red-50"><X className="w-4 h-4"/> Clear</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* JOBS GRID */}
                    {loading ? (
                        <div className="text-center py-20 text-slate-500 font-medium animate-pulse">Searching for opportunities...</div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">No jobs found matching your criteria.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div key={job.id} className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)]">
                                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 opacity-90" />
                                    <div className="relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                {job.companyLogo ? (
                                                    <img src={`data:${job.logoContentType};base64,${job.companyLogo}`} alt={job.companyName} className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-100 p-1 shadow-sm" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                                        <Briefcase className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1" title={job.title}>{job.title}</h3>
                                                    <p className="text-sm font-medium text-slate-500">{job.companyName}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            <span className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                <MapPin className="w-3.5 h-3.5 mr-1"/> {job.location}
                                            </span>
                                            {job.jobType && (
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${getJobTypeStyles(job.jobType)}`}>
                                                    {job.jobType.replace("_", " ")}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {job.requiredSkills && job.requiredSkills.slice(0, 3).map((skill, index) => (
                                                <span key={index} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.requiredSkills && job.requiredSkills.length > 3 && (
                                                <span className="text-xs text-slate-400 font-medium py-1">+{job.requiredSkills.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="font-extrabold text-slate-900 text-lg">
                                            ${job.salary ? job.salary.toLocaleString() : 'N/A'} <span className="text-xs font-medium text-slate-400">/yr</span>
                                        </span>
                                        <Link to={`/student/jobs/${job.id}`} className="rounded-xl bg-gradient-to-r from-slate-900 to-indigo-800 px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-indigo-200">
                                            Apply Now
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;