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

  if (loading) return <div className="py-8 text-center">Loading users...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
      <div className="text-lg font-semibold mb-3">User Management</div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
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
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="border rounded p-1">
                    <option value="STUDENT">STUDENT</option>
                    <option value="RECRUITER">RECRUITER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="p-2">{u.banned ? "Yes" : "No"}</td>
                <td className="p-2 space-x-1">
                  <button className="px-2 py-1 bg-orange-500 text-white rounded" onClick={() => toggleBan(u)}>{u.banned ? "Unban" : "Ban"}</button>
                  <button disabled={currentUser?.email === u.email} className="px-2 py-1 bg-red-600 text-white rounded disabled:opacity-50" onClick={() => remove(u)}>{currentUser?.email === u.email ? "Cannot Delete" : "Delete"}</button>
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
