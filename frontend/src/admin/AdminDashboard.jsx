import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { ShieldCheck } from "lucide-react";
import AdminStats from "./AdminStats";
import AdminUsers from "./AdminUsers";
import AdminJobs from "./AdminJobs";
import AdminApplications from "./AdminApplications";
import AdminSettings from "./AdminSettings";

const tabs = [
  { key: "stats", label: "Dashboard" },
  { key: "users", label: "User Management" },
  { key: "jobs", label: "Job Management" },
  { key: "applications", label: "Applications" },
  { key: "settings", label: "System Settings" },
];

const AdminDashboard = () => {
  const [active, setActive] = useState("stats");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
            <p className="text-sm text-slate-500">Manage users, jobs, applications and platform settings.</p>
          </div>
        </div>

        <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActive(tab.key)} className={`px-3 py-2 rounded-md text-sm font-medium ${active === tab.key ? "bg-blue-600 text-white" : "text-slate-700 bg-slate-100 hover:bg-slate-200"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {active === "stats" && <AdminStats />}
        {active === "users" && <AdminUsers />}
        {active === "jobs" && <AdminJobs />}
        {active === "applications" && <AdminApplications />}
        {active === "settings" && <AdminSettings />}
      </div>
    </div>
  );
};

export default AdminDashboard;