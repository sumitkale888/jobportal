import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getUsers, updateUserRole, banUser, unbanUser, deleteUser } from "./adminApi";

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (user, role) => {
    try {
      await updateUserRole(user.id, role);
      toast.success("Role updated");
      load();
    } catch {
      toast.error("Could not update role");
    }
  };

  const toggleBan = async (user) => {
    try {
      if (user.banned) {
        await unbanUser(user.id);
        toast.success("User unbanned");
      } else {
        await banUser(user.id);
        toast.success("User banned");
      }
      load();
    } catch {
      toast.error("Could not update ban status");
    }
  };

  const remove = async (userToDelete) => {
    if (currentUser && currentUser.email === userToDelete.email) {
      toast.error("You cannot delete your own admin account");
      return;
    }
    if (!window.confirm("Delete user permanently?")) return;
    try {
      await deleteUser(userToDelete.id);
      toast.success("User deleted");
      load();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Delete failed";
      toast.error(errMsg);
    }
  };

  if (loading) return <div className="py-8 text-center text-slate-400">Loading users...</div>;

  return (
    <div className="mt-4">
      <div className="mb-3 text-lg font-semibold text-slate-100">User Management</div>
      <div className="ui-table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Banned</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="ui-input py-1.5">
                    <option value="STUDENT">STUDENT</option>
                    <option value="RECRUITER">RECRUITER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="p-2">{u.banned ? "Yes" : "No"}</td>
                <td className="p-2 flex flex-wrap gap-2">
                  <button className="ui-btn ui-btn-secondary py-1.5" onClick={() => toggleBan(u)}>{u.banned ? "Unban" : "Ban"}</button>
                  <button disabled={currentUser?.email === u.email} className="ui-btn ui-btn-danger py-1.5 disabled:opacity-50" onClick={() => remove(u)}>{currentUser?.email === u.email ? "Cannot Delete" : "Delete"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
