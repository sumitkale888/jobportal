import React, { useEffect, useState } from "react";
import { getDashboardStats } from "./adminApi";

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeCompanies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-10">Loading stats...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {[
        ["Total Users", stats.totalUsers],
        ["Students", stats.totalStudents],
        ["Recruiters", stats.totalRecruiters],
        ["Jobs", stats.totalJobs],
        ["Applications", stats.totalApplications],
        ["Active Companies", stats.activeCompanies],
      ].map(([label, value]) => (
        <div key={label} className="bg-white border p-4 rounded-lg shadow-sm">
          <div className="text-xs uppercase text-gray-500">{label}</div>
          <div className="text-3xl font-bold text-blue-700">{value}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
