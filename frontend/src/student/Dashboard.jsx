import React, { useEffect, useState } from 'react';
import { getAllJobs, searchJobs } from '../api/studentApi';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Search, Filter, X, DollarSign, Clock, Building2, ChevronRight } from 'lucide-react';

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

                {/* 📋 JOB LISTINGS GRID */}
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                             <div className="relative">
                                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                             </div>
                             <p className="mt-4 text-slate-400 font-medium">Curating opportunities...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.length === 0 ? (
                                <div className="col-span-full py-24 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                                        <Search className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">No jobs found</h3>
                                    <p className="text-slate-500 max-w-md mx-auto mb-8">We couldn't find any matches for your search. Try broadening your terms or clearing filters.</p>
                                    <button onClick={clearFilters} className="text-indigo-600 font-bold hover:text-indigo-800 underline underline-offset-4">
                                        View All Jobs
                                    </button>
                                </div>
                            ) : (
                                jobs.map((job) => (
                                    <div key={job.id} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
                                        
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2.5 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-colors duration-300">
                                                <Building2 className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                                            </div>
                                            {job.jobType && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                                                    {job.jobType.replace(/_/g, " ")}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500 mb-3">
                                                {job.companyName}
                                            </p>
                                            
                                            <div className="flex items-center text-xs font-medium text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                {job.location}
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {job.requiredSkills.slice(0, 3).map((skill, index) => (
                                                <span key={index} className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.requiredSkills.length > 3 && (
                                                <span className="px-2 py-1 text-xs text-slate-400 font-medium">
                                                    +{job.requiredSkills.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Salary</p>
                                                <p className="text-sm font-bold text-slate-900 flex items-center">
                                                    <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-500" />
                                                    {job.salary ? job.salary.toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                            
                                            <Link 
                                                to={`/student/jobs/${job.id}`} 
                                                className="group/btn flex items-center gap-2 bg-slate-900 text-white pl-4 pr-3 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 transition-all duration-300"
                                            >
                                                Details
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/btn:text-white transition-colors" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;