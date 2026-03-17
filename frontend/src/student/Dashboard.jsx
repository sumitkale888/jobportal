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

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-700">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* --- HERO SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 mt-4 lg:mt-8">
                    
                    {/* LEFT COLUMN: Text & Search */}
                    <div className="space-y-6 z-10">
                        <div className="inline-block bg-orange-50 text-orange-600 font-bold px-4 py-1.5 rounded-full text-sm mb-2 tracking-wide border border-orange-100">
                            #1 PLATFORM FOR JOBS 🔥
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            Find Your <br/> <span className="text-indigo-600">Next Chapter</span>
                        </h1>
                        
                        <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-lg">
                            Search and find your dream job is now easier than ever. Just browse a job and apply if you need to.
                        </p>

                        <div className="pt-4">
                            {/* Polished Search Bar */}
                            <form onSubmit={handleSearch} className="relative max-w-xl">
                                <div className="flex items-center bg-white border-2 border-slate-200 rounded-full p-1.5 pl-6 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all shadow-sm hover:shadow-md">
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
                                        className="bg-[#c2f04b] text-slate-900 px-6 lg:px-8 py-3.5 rounded-full font-bold hover:bg-[#aee030] active:scale-95 transition-all shadow-sm whitespace-nowrap ml-2"
                                    >
                                        Explore Now
                                    </button>
                                </div>
                            </form>
                            
                            {/* Popular Tags */}
                            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                                <span className="text-slate-400 font-medium mr-1">Popular Categories:</span>
                                <button className="font-bold text-slate-700 hover:text-indigo-600 border-b-2 border-slate-700 hover:border-indigo-600 pb-0.5 transition">Java Dev</button>
                                <button className="font-bold text-slate-700 hover:text-indigo-600 border-b-2 border-slate-700 hover:border-indigo-600 pb-0.5 transition">Spring Boot</button>
                                <button className="font-bold text-slate-700 hover:text-indigo-600 border-b-2 border-slate-700 hover:border-indigo-600 pb-0.5 transition">React</button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive Image & Floating Elements */}
                    <div className="relative flex justify-center items-center h-[400px] md:h-[500px] lg:h-[600px] mt-10 lg:mt-0 group cursor-default">
                        
                        {/* 🌟 BIG INTERACTIVE YELLOW BACKGROUND */}
                        <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-[#ffea75] rounded-full z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-105 group-hover:bg-[#fde242] shadow-[0_0_0_0_rgba(255,234,117,0)] group-hover:shadow-[0_0_60px_20px_rgba(255,234,117,0.4)] transition-all duration-700 ease-out"></div>
                        
                        {/* Interactive secondary pulse ring */}
                        <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] border-2 border-[#ffea75] rounded-full z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"></div>

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
                        <div className="absolute top-1/2 left-4 md:-left-12 z-20 bg-white p-3 md:p-4 rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.15)] flex items-center gap-3 md:gap-4 transform -translate-y-1/2 group-hover:-translate-x-4 transition-transform duration-500">
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
                        <div className="absolute bottom-1/4 right-0 md:-right-4 z-20 bg-white p-3 md:p-4 rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.15)] flex items-center gap-3 group-hover:translate-x-4 transition-transform duration-500">
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
                <div className="max-w-6xl mx-auto pt-10" ref={jobsSectionRef}>
                    
                    {/* 🌟 AI MATCH DASHBOARD BANNER (Moved here!) */}
                    <div className="mb-12 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
                        <div className="text-center md:text-left mb-4 md:mb-0">
                            <h3 className="text-xl md:text-2xl font-extrabold text-indigo-950 flex items-center justify-center md:justify-start gap-2">
                                <Sparkles className="text-indigo-600 w-6 h-6"/> AI Job Matchmaker
                            </h3>
                            <p className="text-indigo-700/80 mt-2 font-medium">
                                Let our AI analyze your skills and find the opportunities you are most likely to land.
                            </p>
                        </div>
                        <Link 
                            to="/student/matches" 
                            className="whitespace-nowrap bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            View AI Matches <ChevronRight className="w-4 h-4"/>
                        </Link>
                    </div>

                    {/* Jobs Header & Filter Toggle */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-200 pb-4">
                        <h2 className="text-3xl font-extrabold text-slate-900">All Available Jobs</h2>
                        
                        <button 
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
                        >
                            <Filter className="w-4 h-4" /> Advanced Filters
                        </button>
                    </div>

                    {/* EXPANDABLE FILTERS */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out mb-8 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <input type="text" name="location" value={filters.location} onChange={handleFilterChange} placeholder="City or State" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Skill</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <input type="text" name="skill" value={filters.skill} onChange={handleFilterChange} placeholder="e.g. React, Node" className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Type</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700 appearance-none cursor-pointer">
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
                                <button onClick={handleSearch} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition">Apply Filters</button>
                                <button onClick={clearFilters} className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-semibold transition flex items-center gap-2"><X className="w-4 h-4"/> Clear</button>
                            </div>
                        </div>
                    </div>
                    
                    {/* JOBS GRID */}
                    {loading ? (
                        <div className="text-center py-20 text-slate-500 font-medium animate-pulse">Searching for opportunities...</div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-300">No jobs found matching your criteria.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col justify-between h-full group">
                                    <div>
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
                                            <span className="flex items-center text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                                <MapPin className="w-3.5 h-3.5 mr-1"/> {job.location}
                                            </span>
                                            {job.jobType && (
                                                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                                                    {job.jobType.replace("_", " ")}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {job.requiredSkills && job.requiredSkills.slice(0, 3).map((skill, index) => (
                                                <span key={index} className="text-xs border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.requiredSkills && job.requiredSkills.length > 3 && (
                                                <span className="text-xs text-slate-400 font-medium py-1">+{job.requiredSkills.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                        <span className="font-extrabold text-slate-900 text-lg">
                                            ${job.salary ? job.salary.toLocaleString() : 'N/A'} <span className="text-xs font-medium text-slate-400">/yr</span>
                                        </span>
                                        <Link to={`/student/jobs/${job.id}`} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all">
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