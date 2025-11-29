import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../context/AuthContext";
import userSubscriptionService from "../../services/userSubscriptionService";
import userService, { User } from "../../services/userService";
import subscriptionService, { Subscription } from "../../services/subscriptionService";

export default function UserSubscriptionsEdit() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    user_id: "",
    subscription_id: "",
    start_datetime: "",
    end_date: "",
    payment_method: "",
    subscription_status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      userSubscriptionService.getUserSubscription(Number(id), token),
      userService.listUsers(token ?? null),
      subscriptionService.listSubscriptions(token ?? null),
    ])
      .then(([data, uList, sList]) => {
        // format start_datetime into local 'YYYY-MM-DDTHH:mm' for datetime-local
        let startLocal = "";
        if (data.start_datetime) {
          try {
            const dt = new Date(data.start_datetime);
            const pad = (n: number) => String(n).padStart(2, "0");
            startLocal = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
          } catch (e) {
            startLocal = data.start_datetime;
          }
        }
        // format end_date into 'YYYY-MM-DD'
        let endDate = data.end_date ?? "";
        if (endDate && endDate.includes("T")) {
          endDate = endDate.split("T")[0];
        }

        setForm({
          user_id: String(data.user_id ?? ""),
          subscription_id: String(data.subscription_id ?? ""),
          start_datetime: startLocal,
          end_date: endDate,
          payment_method: data.payment_method ?? "",
          subscription_status: data.subscription_status ?? "active",
        });
        setUsers(uList);
        setSubscriptions(sList);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id, token]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        user_id: Number(form.user_id),
        subscription_id: Number(form.subscription_id),
        start_datetime: form.start_datetime ? new Date(form.start_datetime).toISOString() : null,
        end_date: form.end_date ? form.end_date : null,
      } as any;
      await userSubscriptionService.updateUserSubscription(Number(id), payload, token);
      navigate('/dashboard/user-subscriptions');
    } catch (err) {
      console.error(err);
      alert('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  function formatDMY(d?: string) {
    if (!d) return "";
    try {
      const dt = new Date(d);
      const dd = String(dt.getDate()).padStart(2, "0");
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const yyyy = dt.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch (e) {
      return d;
    }
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Edit User Subscription</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">User</label>
          <select name="user_id" value={form.user_id} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="">Select user</option>
            {users.map(u => (
              <option key={u.user_id} value={String(u.user_id)}>{u.user_name} ({u.email})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Subscription</label>
          <select name="subscription_id" value={form.subscription_id} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="">Select subscription</option>
            {subscriptions.map(s => (
              <option key={s.id} value={String(s.id)}>{s.subscription_name} ({s.duration} Days)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Start Datetime</label>
          <input type="datetime-local" name="start_datetime" value={form.start_datetime} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">End Date</label>
          <input type="date" name="end_date" value={form.end_date} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Payment Method</label>
          <input name="payment_method" value={form.payment_method} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Status</label>
          <select name="subscription_status" value={form.subscription_status} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="active">active</option>
            <option value="cancelled">cancelled</option>
            <option value="expired">expired</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-black text-white px-4 py-2 rounded">{saving ? 'Saving...' : 'Update'}</button>
          <button type="button" onClick={()=>navigate('/dashboard/user-subscriptions')} className="px-4 py-2">Cancel</button>
        </div>
      </form>
    </div>
  );
}
