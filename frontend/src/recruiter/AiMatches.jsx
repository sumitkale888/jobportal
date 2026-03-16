import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { getMyPostedJobs, rankCandidatesForJob } from '../api/recruiterApi';
import { toast } from 'react-toastify';

const AiMatches = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const j = await getMyPostedJobs();
        setJobs(j);
        if (j.length > 0) setSelectedJob(j[0]);
      } catch (err) {
        console.error(err);
        toast.error('Cannot load posted jobs');
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    const loadRanking = async () => {
      setRankLoading(true);
      try {
        const result = await rankCandidatesForJob(selectedJob.id);
        setRankedCandidates(result.ranked_candidates || []);
      } catch (err) {
        console.error(err);
        toast.error('Cannot load candidate ranking');
      } finally {
        setRankLoading(false);
      }
    };
    loadRanking();
  }, [selectedJob]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-500 font-bold">Recruiter AI Match</p>
            <h1 className="text-3xl font-bold text-slate-800">AI Candidate Ranking</h1>
            <p className="mt-1 text-slate-500 text-sm">See candidate ranks and skill gaps based on your job requirements.</p>
          </div>
          <Link to="/recruiter/dashboard" className="text-indigo-600 font-semibold hover:text-indigo-800">Back to Dashboard</Link>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded-xl shadow border border-slate-200">Loading posted jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow border border-slate-200">No posted jobs found. Please post at least one job first.</div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="mb-4">
              <label className="font-semibold text-slate-700">Choose job</label>
              <select value={selectedJob?.id || ''} onChange={(e) => setSelectedJob(jobs.find((j) => j.id === Number(e.target.value)))} className="mt-2 w-full border border-slate-300 rounded-lg p-2">
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title} · {job.location}</option>
                ))}
              </select>
            </div>

            <div className="mb-4 grid sm:grid-cols-2 gap-2">
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">Selected Job</p>
                <p className="mt-1 font-bold text-slate-700">{selectedJob?.title}</p>
                <p className="text-sm text-slate-500">{selectedJob?.companyName || 'Your company'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Application Count</p>
                <p className="mt-1 text-xl font-bold text-slate-700">{selectedJob?.applicationCount || 0}</p>
                <p className="text-xs text-slate-400">Based on applications in your system</p>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">AI Candidate Match Results</div>
              <button onClick={() => setSelectedJob(selectedJob)} className="px-3 py-1.5 border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-50 text-sm">Refresh</button>
            </div>

            {rankLoading ? (
              <div className="rounded-lg border border-slate-200 p-4 text-slate-500">Loading rankings...</div>
            ) : rankedCandidates.length === 0 ? (
              <div className="rounded-lg border border-slate-200 p-4 text-slate-500">No ranked candidates yet.</div>
            ) : (
              <div className="space-y-2">
                {rankedCandidates.map((c) => (
                  <div key={`${c.candidate_id}-${c.candidate_rank}`} className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">#{c.candidate_rank} {c.name || 'Candidate'} (ID {c.candidate_id})</p>
                        <p className="text-xs text-slate-500">Matched: {c.matched_skills?.join(', ') || 'None'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-700">{c.match_percentage}%</p>
                        <p className="text-xs text-slate-500">Match score</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">Missing: {c.missing_skills?.join(', ') || 'None'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiMatches;
