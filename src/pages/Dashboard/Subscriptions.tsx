import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import subscriptionService, { Subscription } from "../../services/subscriptionService";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

export default function SubscriptionsPage() {
  const { token } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [form, setForm] = useState({ subscription_name: "", description: "", price: 0, duration: 30, active: true });

  const fetchSubs = async (q?: string) => {
    setLoading(true);
    try {
      const data = await subscriptionService.listSubscriptions(token, q ?? null);
      setSubs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ subscription_name: "", description: "", price: 0, duration: 30, active: true });
    setShowModal(true);
  };

  const openEdit = (s: Subscription) => {
    setEditing(s);
    setForm({ subscription_name: s.subscription_name, description: s.description ?? "", price: s.price, duration: s.duration, active: s.active });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      await subscriptionService.deleteSubscription(id, token);
      await fetchSubs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete subscription.");
    }
  };

  const submitForm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      if (editing) {
        await subscriptionService.updateSubscription(editing.id, form, token);
      } else {
        await subscriptionService.createSubscription(form, token);
      }
      setShowModal(false);
      await fetchSubs();
    } catch (err) {
      console.error(err);
      alert("Failed to save subscription.");
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Subscriptions</h1>
          <p className="text-sm text-gray-500">Manage master subscription plans</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search"
              className="outline-none border text-md bg-white px-3 py-2 rounded w-64" />
            <button onClick={() => fetchSubs(query)} className="inline-flex items-center justify-center gap-2 rounded-lg transition  px-4 py-3 text-sm bg-black text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ml-5 text-white text-md px-3 py-1 rounded-md ml-2 text-md text-white px-3 py-1 rounded-md hover:bg-gray-800">Search</button>
            <button onClick={() => { setQuery(""); fetchSubs(); }} className="ml-2 text-md text-gray-400">Clear</button>
          </div>
          <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg transition  px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ml-5 text-white text-md px-3 py-1 rounded-md">Add New Subscription</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">Price</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">Duration</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No subscriptions found</td></tr>
            ) : (
              subs.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-4 py-3">{s.subscription_name}</td>
                  <td className="px-4 py-3">Rs. {s.price}</td>
                  <td className="px-4 py-3">{s.duration}</td>
                  <td className="px-4 py-3">{s.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(s)} className="text-indigo-600 mr-3 text-sm">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 text-sm">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={submitForm} className="bg-white w-full max-w-md p-6 rounded shadow">
            <h3 className="text-lg font-medium mb-4">{editing ? "Edit Subscription" : "Create Subscription"}</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.subscription_name} onChange={(e) => setForm({ ...form, subscription_name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" value={String(form.price)} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="duration">Duration (days)</Label>
                <Input id="duration" type="number" value={String(form.duration)} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <Label>Active</Label>
                <select value={form.active ? "true" : "false"} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })} className="h-11 w-full appearance-none rounded-lg border px-3 py-2 text-sm">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 rounded text-sm">Cancel</button>
              <button type="submit" className="px-3 py-1 bg-black text-white rounded text-sm">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
