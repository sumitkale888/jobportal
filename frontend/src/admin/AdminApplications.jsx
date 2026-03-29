import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getApplications, markApplicationSpam } from "./adminApi";

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getApplications();
      setApplications(res.data);
    } catch {
      toast.error("Cannot load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const spam = async (id) => {
    try {
      await markApplicationSpam(id);
      toast.success("Marked as spam");
      load();
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <div className="py-8 text-center text-slate-400">Loading applications...</div>;

  return (
    <div className="mt-4">
      <div className="text-lg font-semibold mb-3 text-slate-100">Application Monitoring</div>
      <div className="ui-table-wrap">
        <table className="ui-table">
          <thead><tr><th className="p-2">Job</th><th className="p-2">Student</th><th className="p-2">Status</th><th className="p-2">Applied</th><th className="p-2">Action</th></tr></thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id}>
                <td className="p-2">{a.job?.title || "-"}</td>
                <td className="p-2">{a.student?.name || "-"}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "-"}</td>
                <td className="p-2"><button onClick={() => spam(a.id)} className="ui-btn ui-btn-danger py-1.5">Spam</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminApplications;
