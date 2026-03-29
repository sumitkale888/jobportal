import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyPostedJobs, rankCandidatesForJob } from '../api/recruiterApi';
import { toast } from 'react-toastify';
import { DashboardShell, PageHeader, SurfaceCard, Select, SecondaryButton, EmptyState } from '../components/ui/DashboardUI';

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
    <DashboardShell contentClassName="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Recruiter AI"
        title="AI Candidate Ranking"
        subtitle="See candidate ranks and skill gaps based on your job requirements."
        actions={<Link to="/recruiter/dashboard" className="ui-btn ui-btn-secondary">Back to Dashboard</Link>}
      />

        {loading ? (
          <EmptyState title="Loading posted jobs..." />
        ) : jobs.length === 0 ? (
          <EmptyState title="No posted jobs found" description="Post at least one role to generate AI candidate ranking." />
        ) : (
          <SurfaceCard>
            <div className="mb-4">
              <label className="ui-label">Choose job</label>
              <Select value={selectedJob?.id || ''} onChange={(e) => setSelectedJob(jobs.find((j) => j.id === Number(e.target.value)))}>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title} · {job.location}</option>
                ))}
              </Select>
            </div>

            <div className="mb-4 grid sm:grid-cols-2 gap-2">
              <div className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 p-3">
                <p className="text-xs uppercase tracking-wide text-indigo-300 font-semibold">Selected Job</p>
                <p className="mt-1 font-bold text-slate-100">{selectedJob?.title}</p>
                <p className="text-sm text-slate-400">{selectedJob?.companyName || 'Your company'}</p>
              </div>
              <div className="rounded-lg border border-slate-700 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Application Count</p>
                <p className="mt-1 text-xl font-bold text-slate-100">{selectedJob?.applicationCount || 0}</p>
                <p className="text-xs text-slate-500">Based on applications in your system</p>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-200">AI Candidate Match Results</div>
              <SecondaryButton onClick={() => setSelectedJob(selectedJob)}>Refresh</SecondaryButton>
            </div>

            {rankLoading ? (
              <div className="rounded-lg border border-slate-700 p-4 text-slate-400">Loading rankings...</div>
            ) : rankedCandidates.length === 0 ? (
              <div className="rounded-lg border border-slate-700 p-4 text-slate-400">No ranked candidates yet.</div>
            ) : (
              <div className="space-y-2">
                {rankedCandidates.map((c) => (
                  <div key={`${c.candidate_id}-${c.candidate_rank}`} className="border border-slate-700 rounded-lg p-3 bg-slate-900/90">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">#{c.candidate_rank} {c.name || 'Candidate'} (ID {c.candidate_id})</p>
                        <p className="text-xs text-slate-400">Matched: {c.matched_skills?.join(', ') || 'None'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-300">{c.match_percentage}%</p>
                        <p className="text-xs text-slate-500">Match score</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">Missing: {c.missing_skills?.join(', ') || 'None'}</div>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>
        )}
    </DashboardShell>
  );
};

export default AiMatches;
