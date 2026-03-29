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
    <div className="mt-4 space-y-4">
      <div>
        <div className="text-lg font-semibold text-slate-100">Manage Categories</div>
        <div className="mt-2 flex gap-2">
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="ui-input" placeholder="New category" />
          <button onClick={addCat} className="ui-btn ui-btn-primary">Add</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="ui-tag flex items-center gap-1">
              {c} <button className="text-red-600" onClick={async () => { await deleteCategory(c); load(); }}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="text-lg font-semibold mb-2 text-slate-100">Job Types</div>
        <div className="flex flex-wrap gap-2">{jobTypes.map((t) => (<span key={t} className="ui-tag">{t}</span>))}</div>
      </div>

      <div>
        <div className="text-lg font-semibold mb-2 text-slate-100">Feature Toggles</div>
        <div className="space-y-2">
          {Object.entries(toggles).map(([name, enabled]) => (
            <div key={name} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 p-3">
              <div className="font-medium text-slate-200">{name}</div>
              <button onClick={async () => { await toggleFeature(name, !enabled); load(); }} className={`ui-btn py-1.5 ${enabled ? 'ui-btn-primary' : 'ui-btn-secondary'}`}>
                {enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 p-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">Maintenance Mode</div>
          <div className="text-sm text-slate-400">When enabled, platform features can be restricted in the backend.</div>
        </div>
        <button onClick={async () => { await setMaintenanceMode(!maintenance); setMaintenance(!maintenance); }} className={`ui-btn ${maintenance ? 'ui-btn-danger' : 'ui-btn-primary'}`}>
          {maintenance ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
