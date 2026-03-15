import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCategories, addCategory, deleteCategory, getJobTypes, getFeatureToggles, toggleFeature, getMaintenanceMode, setMaintenanceMode } from "./adminApi";

const AdminSettings = () => {
  const [categories, setCategories] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [toggles, setToggles] = useState({});
  const [maintenance, setMaintenance] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const load = async () => {
    try {
      const [cats, types, tgs, m] = await Promise.all([getCategories(), getJobTypes(), getFeatureToggles(), getMaintenanceMode()]);
      setCategories(cats.data);
      setJobTypes(types.data);
      setToggles(tgs.data);
      setMaintenance(m.data.maintenanceMode);
    } catch {
      toast.error("Settings load failed");
    }
  };

  useEffect(() => { load(); }, []);

  const addCat = async () => {
    if (!newCategory.trim()) return;
    await addCategory(newCategory.trim());
    setNewCategory("");
    load();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mt-4 space-y-4">
      <div>
        <div className="text-lg font-semibold">Manage Categories</div>
        <div className="mt-2 flex gap-2">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="border p-2 rounded" placeholder="New category" />
          <button onClick={addCat} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="bg-gray-100 border px-2 py-1 rounded flex items-center gap-1">
              {c} <button className="text-red-600" onClick={async () => { await deleteCategory(c); load(); }}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="text-lg font-semibold mb-2">Job Types</div>
        <div className="flex flex-wrap gap-2">{jobTypes.map((t) => (<span key={t} className="bg-green-50 border border-green-300 px-2 py-1 rounded">{t}</span>))}</div>
      </div>

      <div>
        <div className="text-lg font-semibold mb-2">Feature Toggles</div>
        <div className="space-y-2">
          {Object.entries(toggles).map(([name, enabled]) => (
            <div key={name} className="flex items-center justify-between border p-2 rounded">
              <div className="font-medium">{name}</div>
              <button onClick={async () => { await toggleFeature(name, !enabled); load(); }} className={`px-2 py-1 rounded ${enabled ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                {enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border p-2 rounded">
        <div>
          <div className="text-lg font-semibold">Maintenance Mode</div>
          <div className="text-sm text-gray-500">When enabled, platform features can be restricted in the backend.</div>
        </div>
        <button onClick={async () => { await setMaintenanceMode(!maintenance); setMaintenance(!maintenance); }} className={`px-3 py-2 rounded ${maintenance ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {maintenance ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
