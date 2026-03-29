import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight, Clock3, Filter, MapPin, Search, Sparkles, Wallet } from 'lucide-react';
import { getAllJobs, searchJobs } from '../api/studentApi';
import heroImage from '../assets/job1.png';
import {
  DashboardShell,
  PageHeader,
  SurfaceCard,
  GlassPanel,
  Input,
  Select,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  EmptyState,
} from '../components/ui/DashboardUI';

const StudentDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    title: '',
    location: '',
    type: '',
    skill: '',
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
      console.error('Failed to fetch jobs');
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
      Object.keys(filters).forEach((key) => {
        if (filters[key]) cleanFilters[key] = filters[key];
      });
      const data = await searchJobs(cleanFilters);
      setJobs(data);
    } catch {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ title: '', location: '', type: '', skill: '' });
    loadJobs();
  };

  const salaryAverage = useMemo(() => {
    if (!jobs.length) return 0;
    const total = jobs.reduce((sum, job) => sum + (Number(job.salary) || 0), 0);
    return Math.round(total / jobs.length);
  }, [jobs]);

  const getJobTypeStyles = (jobType) => {
    switch (jobType) {
      case 'FULL_TIME':
        return 'bg-emerald-500/10 border-emerald-400/40 text-emerald-300';
      case 'PART_TIME':
        return 'bg-amber-500/10 border-amber-400/40 text-amber-300';
      case 'INTERNSHIP':
        return 'bg-violet-500/10 border-violet-400/40 text-violet-300';
      case 'REMOTE':
        return 'bg-sky-500/10 border-sky-400/40 text-sky-300';
      case 'CONTRACT':
        return 'bg-rose-500/10 border-rose-400/40 text-rose-300';
      default:
        return 'bg-slate-700/70 border-slate-600 text-slate-300';
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        badge='Student Workspace'
        icon={Sparkles}
        title='Discover roles that match your trajectory'
        subtitle='Premium opportunity feed with AI-powered relevance, fast filtering, and one-click applications.'
        actions={
          <Link to='/student/matches' className='ui-btn ui-btn-primary'>
            <Sparkles className='h-4 w-4' /> Open AI Matches
          </Link>
        }
      />

      <section className='ui-fade-up grid gap-8 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 md:grid-cols-2 md:p-8'>
        <div className='flex flex-col justify-center'>
          <p className='ui-badge mb-4'>#1 Platform For Jobs</p>
          <h2 className='text-4xl font-black leading-tight text-slate-100 md:text-5xl'>
            Find Your <span className='bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent'>Next Chapter</span>
          </h2>
          <p className='mt-4 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg'>
            Search and find your dream role faster with smart filters, role insights, and AI-powered matching.
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <Link to='/student/matches' className='ui-btn ui-btn-primary'>
              <Sparkles className='h-4 w-4' /> View AI Matches
            </Link>
            <button type='button' onClick={() => setShowFilters(true)} className='ui-btn ui-btn-secondary'>
              <Filter className='h-4 w-4' /> Open Filters
            </button>
          </div>
        </div>

        <div className='relative flex min-h-[320px] items-center justify-center md:min-h-[380px]'>
          <div className='absolute h-[280px] w-[280px] rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-400/20 blur-2xl md:h-[340px] md:w-[340px]' />
          <div className='absolute h-[260px] w-[260px] rounded-full border border-indigo-300/30 bg-indigo-500/10 md:h-[320px] md:w-[320px]' />

          <img
            src={heroImage}
            alt='Job seeker'
            className='relative z-10 h-[320px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(2,6,23,0.6)] md:h-[380px]'
          />

          <div className='absolute left-2 top-5 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-200 shadow-xl md:left-6'>
            <p className='font-bold'>Hiring Developer</p>
            <p className='text-slate-400'>Tech Corp • Full-time</p>
          </div>

          <div className='absolute bottom-5 right-1 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-200 shadow-xl md:right-4'>
            <p className='font-bold'>UI/UX Designer</p>
            <p className='text-indigo-100/80'>40 Vacancies</p>
          </div>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-3 ui-fade-up'>
        <SurfaceCard className='ui-kpi'>
          <p className='ui-kpi-label'>Active Opportunities</p>
          <p className='ui-kpi-value'>{jobs.length}</p>
        </SurfaceCard>
        <SurfaceCard className='ui-kpi'>
          <p className='ui-kpi-label'>Average Salary</p>
          <p className='ui-kpi-value'>${salaryAverage.toLocaleString()}</p>
        </SurfaceCard>
        <GlassPanel className='ui-kpi'>
          <p className='ui-kpi-label'>Top Categories</p>
          <div className='mt-2 flex flex-wrap gap-2'>
            <span className='ui-tag'>Java</span>
            <span className='ui-tag'>Spring Boot</span>
            <span className='ui-tag'>React</span>
          </div>
        </GlassPanel>
      </section>

      <SurfaceCard className='mt-6 ui-fade-up'>
        <div className='mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='ui-badge'>Opportunity Engine</p>
            <h2 className='mt-2 text-2xl font-extrabold text-slate-100'>Search and refine jobs</h2>
            <p className='ui-subtitle mt-2'>Use precise filters to narrow by location, skills, and engagement type.</p>
          </div>
          <SecondaryButton onClick={() => setShowFilters((v) => !v)}>
            <Filter className='h-4 w-4' /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </SecondaryButton>
        </div>

        <form onSubmit={handleSearch} className='space-y-4'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500' />
            <Input
              name='title'
              value={filters.title}
              onChange={handleFilterChange}
              placeholder='Search by title, company, or keyword'
              className='pl-10'
            />
          </div>

          {showFilters && (
            <div className='grid gap-3 md:grid-cols-3'>
              <div>
                <label className='ui-label'>Location</label>
                <div className='relative'>
                  <MapPin className='pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500' />
                  <Input name='location' value={filters.location} onChange={handleFilterChange} placeholder='City or state' className='pl-10' />
                </div>
              </div>
              <div>
                <label className='ui-label'>Skill</label>
                <div className='relative'>
                  <Briefcase className='pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500' />
                  <Input name='skill' value={filters.skill} onChange={handleFilterChange} placeholder='React, Java, SQL' className='pl-10' />
                </div>
              </div>
              <div>
                <label className='ui-label'>Job Type</label>
                <div className='relative'>
                  <Clock3 className='pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500' />
                  <Select name='type' value={filters.type} onChange={handleFilterChange} className='pl-10'>
                    <option value=''>Any Type</option>
                    <option value='FULL_TIME'>Full Time</option>
                    <option value='PART_TIME'>Part Time</option>
                    <option value='INTERNSHIP'>Internship</option>
                    <option value='CONTRACT'>Contract</option>
                    <option value='REMOTE'>Remote</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className='flex flex-wrap gap-2'>
            <PrimaryButton type='submit'>Apply Filters</PrimaryButton>
            <DangerButton type='button' onClick={clearFilters}>Clear Filters</DangerButton>
          </div>
        </form>
      </SurfaceCard>

      <section className='mt-6 ui-fade-up'>
        {loading ? (
          <EmptyState title='Scanning opportunities...' description='Your personalized feed is being prepared.' />
        ) : jobs.length === 0 ? (
          <EmptyState title='No jobs found' description='Try adjusting filters, location, or skills to discover more roles.' />
        ) : (
          <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {jobs.map((job) => (
              <article
                key={job.id}
                className='group rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/70 p-5 shadow-[0_20px_45px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-[0_24px_55px_rgba(99,102,241,0.25)]'
              >
                <div className='mb-4 flex items-start justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    {job.companyLogo ? (
                      <img
                        src={`data:${job.logoContentType};base64,${job.companyLogo}`}
                        alt={job.companyName}
                        className='h-12 w-12 rounded-xl border border-slate-700 bg-slate-800 object-contain p-1'
                      />
                    ) : (
                      <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300'>
                        <Briefcase className='h-5 w-5' />
                      </div>
                    )}
                    <div>
                      <h3 className='text-lg font-extrabold text-slate-100 transition group-hover:text-indigo-300'>{job.title}</h3>
                      <p className='text-sm font-medium text-slate-400'>{job.companyName}</p>
                    </div>
                  </div>
                </div>

                <div className='mb-4 flex flex-wrap gap-2'>
                  <span className='ui-tag inline-flex items-center'>
                    <MapPin className='mr-1 h-3.5 w-3.5' /> {job.location}
                  </span>
                  {job.jobType && (
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getJobTypeStyles(job.jobType)}`}>
                      {job.jobType.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div className='mb-5 flex flex-wrap gap-2'>
                  {(job.requiredSkills || []).slice(0, 4).map((skill, index) => (
                    <span key={`${job.id}-${index}`} className='ui-tag'>
                      {skill}
                    </span>
                  ))}
                </div>

                <div className='mt-auto flex items-center justify-between border-t border-slate-800 pt-4'>
                  <div>
                    <p className='inline-flex items-center text-sm text-slate-400'>
                      <Wallet className='mr-1 h-4 w-4' /> Salary
                    </p>
                    <p className='text-lg font-black text-slate-100'>${job.salary ? Number(job.salary).toLocaleString() : 'N/A'}</p>
                  </div>
                  <Link to={`/student/jobs/${job.id}`} className='ui-btn ui-btn-primary'>
                    Apply <ChevronRight className='h-4 w-4' />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
};

export default StudentDashboard;
