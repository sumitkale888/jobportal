import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getJobs, getReportedJobs, approveJob, rejectJob, deleteJob, removeJobDescription } from "./adminApi";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isReported, setIsReported] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = isReported ? await getReportedJobs() : await getJobs();
      setJobs(res.data);
    } catch (err) {
      toast.error("Cannot load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isReported]);

  const doAction = async (id, action) => {
    try {
      if (action === "approve") await approveJob(id);
      if (action === "reject") await rejectJob(id);
      if (action === "delete") await deleteJob(id);
      if (action === "remove") await removeJobDescription(id);
      toast.success("Action performed");
      load();
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <div className="py-8 text-center">Loading jobs...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">Job Management</div>
        <button onClick={() => setIsReported(!isReported)} className="px-3 py-1 bg-indigo-600 text-white rounded">{isReported ? "All Jobs" : "Reported Jobs"}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50"><tr><th className="p-2">Job</th><th className="p-2">Company</th><th className="p-2">Status</th><th className="p-2">Reports</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t">
                <td className="p-2"><div className="font-semibold">{j.title}</div><div className="text-xs text-gray-500">{j.description?.slice(0, 80)}...</div></td>
                <td className="p-2">{j.companyName}</td>
                <td className="p-2">{j.status}</td>
                <td className="p-2">{j.reportCount}</td>
                <td className="p-2 flex flex-wrap gap-1">
                  <button onClick={() => doAction(j.id, "approve")} className="bg-green-500 text-white px-2 py-1 rounded">Approve</button>
                  <button onClick={() => doAction(j.id, "reject")} className="bg-yellow-500 text-white px-2 py-1 rounded">Reject</button>
                  <button onClick={() => doAction(j.id, "remove")} className="bg-orange-500 text-white px-2 py-1 rounded">Remove Desc</button>
                  <button onClick={() => doAction(j.id, "delete")} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminJobs;
