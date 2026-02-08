import React, { useEffect, useState } from 'react';
import { getAllJobs, searchJobs } from '../api/studentApi';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Search, Filter, X, DollarSign, Clock, Building2, ChevronRight ,RotateCcw,  ChevronDown} from 'lucide-react';

const StudentDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    
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
        } catch (error) {
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
        } catch (error) {
            console.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({ title: '', location: '', type: '', skill: '' });
        loadJobs();
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* 🔍 SEARCH HERO SECTION */}
                <div className="mb-14">
                    <div className="text-center mb-10 max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            Find Your <span className="text-indigo-600">Next Chapter</span>
                        </h1>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            Discover career opportunities perfectly matched to your skills and ambitions.
                        </p>
                    </div>
                    
                    {/* Floating Search Container */}
                    <div className="bg-white p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-5xl mx-auto transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                        <form onSubmit={handleSearch}>
                            <div className="flex flex-col md:flex-row gap-2">
                                
                                {/* Input Group */}
                                <div className="relative flex-grow group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={filters.title}
                                        onChange={handleFilterChange}
                                        placeholder="Job title, keywords, or company..." 
                                        className="w-full pl-12 pr-12 py-4 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-lg rounded-2xl focus:bg-slate-50 transition-colors"
                                    />
                                    
                                    {/* Filter Toggle */}
                                    <button 
                                        type="button"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all duration-200 border ${showFilters ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        title="Filters"
                                    >
                                        <Filter className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Search Button */}
                                <button type="submit" className="md:w-auto w-full bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                                    Search
                                </button>
                            </div>

                            {/* 🔽 EXPANDABLE FILTERS */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100 mt-4 pt-4 border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2 pb-2">
                                    
                                    {/* Location Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="text" name="location" 
                                                value={filters.location} onChange={handleFilterChange}
                                                placeholder="City or State" 
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Skills Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Skill</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="text" name="skill" 
                                                value={filters.skill} onChange={handleFilterChange}
                                                placeholder="e.g. React, Node" 
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Type Select */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Type</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <select 
                                                name="type" 
                                                value={filters.type} onChange={handleFilterChange}
                                                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-700 appearance-none cursor-pointer"
                                            >
                                                <option value="">Any Type</option>
                                                <option value="FULL_TIME">Full Time</option>
                                                <option value="PART_TIME">Part Time</option>
                                                <option value="INTERNSHIP">Internship</option>
                                                <option value="CONTRACT">Contract</option>
                                                <option value="REMOTE">Remote</option>
                                            </select>
                                            <div className="absolute right-3 top-3 pointer-events-none">
                                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clear Action */}
                                    <div className="flex items-end">
                                        <button 
                                            type="button" 
                                            onClick={clearFilters}
                                            className="w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4"/> Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

               {/* ✅ JOB LISTINGS */}
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Searching...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 flex flex-col justify-between h-full group">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            
                                            {/* ✅ LOGO LOGIC */}
                                            <div className="flex items-center gap-3">
                                                {job.companyLogo ? (
                                                    <img 
                                                        src={`data:${job.logoContentType};base64,${job.companyLogo}`} 
                                                        alt={job.companyName} 
                                                        className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <Briefcase className="w-6 h-6" />
                                                    </div>
                                                )}
                                                
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition line-clamp-1" title={job.title}>
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{job.companyName}</p>
                                                </div>
                                            </div>

                                            {job.jobType && (
                                                <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {job.jobType.replace("_", " ")}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 mb-4 ml-1">
                                            <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400"/> {job.location}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {job.requiredSkills.slice(0, 3).map((skill, index) => (
                                                <span key={index} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <span className="font-bold text-gray-900">
                                            ${job.salary ? job.salary.toLocaleString() : 'N/A'}
                                        </span>
                                        <Link 
                                            to={`/student/jobs/${job.id}`} 
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                                        >
                                            View Details
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