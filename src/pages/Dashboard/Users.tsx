import React, { useEffect, useState } from "react";
import userService, { User } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

// Minimalist Users page with inline modal form
export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<string>("");

  // modal state
  const [editing, setEditing] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ user_name: "", email: "", phone: "", role: "user", password: "", active: true });

  const fetchUsers = async (q?: string) => {
    setLoading(true);
    try {
      const data = await userService.listUsers(token, q ?? null);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => await fetchUsers(query || undefined);
  const handleClear = async () => {
    setQuery("");
    await fetchUsers();
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ user_name: "", email: "", phone: "", role: "user", password: "", active: true });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ user_name: u.user_name, email: u.email, phone: (u as any).phone ?? "", role: u.role, password: "", active: !!u.active });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await userService.deleteUser(id, token);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  const submitForm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      if (editing) {
        await userService.updateUser(editing.user_id, form, token);
      } else {
        await userService.createUser(form, token);
      }
      setShowModal(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to save user.");
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-normal">Users</h1>
          <p className="text-sm text-gray-500">Manage application users</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email"
              className="outline-none border bg-white px-3 py-2 rounded w-64"
            />
            <button onClick={handleSearch} className="inline-flex items-center justify-center gap-2 rounded-lg transition  px-4 py-3 text-sm bg-black text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 text-white text-md px-3 py-1 rounded-md ml-2 text-md text-white px-3 py-1 rounded-md hover:bg-gray-800">Search</button>
            <button onClick={handleClear} className="ml-2 px-3 py-1">Clear</button>
          </div>
          <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg transition  px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ml-5 text-white text-md px-3 py-1 rounded-md">Add New User</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-normal text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-normal text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-normal text-gray-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-normal text-gray-500">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.user_id} className="border-b">
                  <td className="px-4 py-3 font-normal text-sm ">{u.user_name}</td>
                  <td className="px-4 py-3 font-normal text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 font-normal text-sm text-gray-600">{u.role}</td>
                  <td className="px-4 py-3 font-normal text-sm text-gray-600">{u.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(u)} className="text-indigo-600 mr-3 text-sm">Edit</button>
                    <button onClick={() => handleDelete(u.user_id)} className="text-red-600 text-sm">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal (inline simple) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-99999">
          <form onSubmit={submitForm} className="bg-white w-full max-w-md p-6 rounded shadow">
            <h3 className="text-lg font-medium mb-4">{editing ? "Edit User" : "Create User"}</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Role</Label>
                  <Select
                    options={[
                      { value: "editor", label: "Editor" },
                      { value: "super_admin", label: "Super Admin" },
                      { value: "subscriber", label: "Subscriber" },
                    ]}
                    placeholder="Select role"
                    defaultValue={form.role}
                    onChange={(v) => setForm({ ...form, role: v })}
                  />
                </div>
                <div className="w-28">
                  <Label>Active</Label>
                  <select
                    value={form.active ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}
                    className="h-11 w-full appearance-none rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              {!editing && (
                <div>
                  <label className="block text-xs text-gray-600">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 rounded text-sm">
                Cancel
              </button>
              <button type="submit" className="px-3 py-1 bg-black text-white rounded text-sm">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
