import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { DashboardShell, PageHeader, SurfaceCard } from "../components/ui/DashboardUI";
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
    <DashboardShell>
      <PageHeader
        badge="Administration"
        icon={ShieldCheck}
        title="Admin Control Center"
        subtitle="Manage platform users, jobs, applications, and system controls from a single command surface."
      />

      <SurfaceCard className="ui-fade-up">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`ui-btn ${active === tab.key ? "ui-btn-primary" : "ui-btn-secondary"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {active === "stats" && <AdminStats />}
        {active === "users" && <AdminUsers />}
        {active === "jobs" && <AdminJobs />}
        {active === "applications" && <AdminApplications />}
        {active === "settings" && <AdminSettings />}
      </SurfaceCard>
    </DashboardShell>
  );
};

export default AdminDashboard;