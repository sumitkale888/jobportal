import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRecruiterProfiles, verifyRecruiter, rejectRecruiter } from "./adminApi";

const AdminRecruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const verified = filter === "all" ? undefined : filter === "verified";
      const res = await getRecruiterProfiles(verified);
      setRecruiters(res.data || []);
    } catch (err) {
      toast.error("Failed to load recruiter profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const approve = async (profileId) => {
    try {
      await verifyRecruiter(profileId);
      toast.success("Recruiter approved");
      load();
    } catch {
      toast.error("Approval failed");
    }
  };

  const reject = async (profileId) => {
    if (!window.confirm("Reject and delete this recruiter profile?")) return;
    try {
      await rejectRecruiter(profileId);
      toast.success("Recruiter rejected");
      load();
    } catch {
      toast.error("Rejection failed");
    }
  };

  if (loading) return <div className="py-8 text-center text-slate-400">Loading recruiter profiles...</div>;

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-semibold text-slate-100">Company Verification</div>
        <div className="flex gap-2">
          <button onClick={() => setFilter("pending")} className={`ui-btn py-1.5 ${filter === "pending" ? "ui-btn-primary" : "ui-btn-secondary"}`}>Pending</button>
          <button onClick={() => setFilter("verified")} className={`ui-btn py-1.5 ${filter === "verified" ? "ui-btn-primary" : "ui-btn-secondary"}`}>Verified</button>
          <button onClick={() => setFilter("all")} className={`ui-btn py-1.5 ${filter === "all" ? "ui-btn-primary" : "ui-btn-secondary"}`}>All</button>
        </div>
      </div>

      <div className="space-y-4">
        {recruiters.length === 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-300">No recruiter profiles found for this filter.</div>
        )}

        {recruiters.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-100">{r.companyName || "Unnamed Company"}</div>
                <div className="text-sm text-slate-300">{r.recruiterName || "-"} • {r.recruiterEmail || "-"}</div>
                <div className="mt-1 text-sm text-slate-400">{r.headOfficeLocation || "No location"} • {r.industry || "No industry"} • {r.companySize || "No size"}</div>
                <div className="mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold border border-slate-600 text-slate-200">
                  {r.verified ? "Verified" : "Pending verification"}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="ui-btn ui-btn-secondary py-1.5">
                  {expandedId === r.id ? "Hide Details" : "View Details"}
                </button>
                {!r.verified && <button onClick={() => approve(r.id)} className="ui-btn ui-btn-primary py-1.5">Approve</button>}
                {!r.verified && <button onClick={() => reject(r.id)} className="ui-btn ui-btn-danger py-1.5">Reject</button>}
              </div>
            </div>

            {expandedId === r.id && (
              <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200 md:grid-cols-2">
                <p><span className="font-semibold text-slate-100">Website:</span> {r.websiteUrl || "-"}</p>
                <p><span className="font-semibold text-slate-100">LinkedIn:</span> {r.linkedInUrl || "-"}</p>
                <p><span className="font-semibold text-slate-100">Company Type:</span> {r.companyType || "-"}</p>
                <p><span className="font-semibold text-slate-100">Founded Year:</span> {r.foundedYear || "-"}</p>
                <p><span className="font-semibold text-slate-100">Contact Person:</span> {r.contactPersonName || "-"}</p>
                <p><span className="font-semibold text-slate-100">Designation:</span> {r.contactPersonDesignation || "-"}</p>
                <p><span className="font-semibold text-slate-100">Contact Phone:</span> {r.contactPhone || "-"}</p>
                <p><span className="font-semibold text-slate-100">HR Email:</span> {r.hrEmail || "-"}</p>
                <p className="md:col-span-2"><span className="font-semibold text-slate-100">Description:</span> {r.companyDescription || "-"}</p>
                <p className="md:col-span-2"><span className="font-semibold text-slate-100">Work Culture:</span> {r.aboutCulture || "-"}</p>
                <p className="md:col-span-2"><span className="font-semibold text-slate-100">Hiring Roles:</span> {r.hiringForRoles || "-"}</p>
                <p className="md:col-span-2"><span className="font-semibold text-slate-100">Office Locations:</span> {r.officeLocations || "-"}</p>
                <p className="md:col-span-2"><span className="font-semibold text-slate-100">Benefits:</span> {r.benefits || "-"}</p>
                <p><span className="font-semibold text-slate-100">Logo Uploaded:</span> {r.hasLogo ? "Yes" : "No"}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRecruiters;
