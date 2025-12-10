import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import userSubscriptionService from "../../services/userSubscriptionService";
import userService, { User } from "../../services/userService";
import subscriptionService, {
  Subscription,
} from "../../services/subscriptionService";
import { useEffect } from "react";

export default function UserSubscriptionsNew() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_id: "",
    subscription_id: "",
    start_datetime: "",
    end_date: "",
    payment_method: "",
    subscription_status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [u, s] = await Promise.all([
          userService.listUsers(token ?? null),
          subscriptionService.listSubscriptions(token ?? null),
        ]);

        const subscriberUsers = u.filter((user) => user.role === "subscriber");

        setUsers(subscriberUsers);
        setSubscriptions(s);
      } catch (err) {
        console.error("Failed to load select options", err);
      }
    };
    fetchOptions();
  }, [token]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        user_id: Number(form.user_id),
        subscription_id: Number(form.subscription_id),
        // convert datetime-local to ISO and date to YYYY-MM-DD ISO
        start_datetime: form.start_datetime ? new Date(form.start_datetime).toISOString() : null,
        end_date: form.end_date ? form.end_date : null,
      } as any;
      await userSubscriptionService.createUserSubscription(payload, token);
      navigate("/dashboard/user-subscriptions");
    } catch (err) {
      console.error(err);
      alert("Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow ">
      <h2 className="text-xl font-normal mb-7">New User Subscription</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">User</label>
          <select
            name="user_id"
            value={form.user_id}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.user_id} value={String(u.user_id)}>
                {u.user_name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Subscription Plan</label>
            <select
              name="subscription_id"
              value={form.subscription_id}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select subscription</option>
              {subscriptions.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.subscription_name} ({s.duration} Days)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm">Start Datetime</label>
            <input
              type="datetime-local"
              name="start_datetime"
              value={form.start_datetime}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm">End Date</label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm">Payment Method</label>
            <input
              name="payment_method"
              value={form.payment_method}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm">Status</label>
            <select
              name="subscription_status"
              value={form.subscription_status}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-3 align-right">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/user-subscriptions")}
            className="px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
