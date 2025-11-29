import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import userSubscriptionService, { UserSubscription } from "../../services/userSubscriptionService";
import userService, { User } from "../../services/userService";
import subscriptionService, { Subscription } from "../../services/subscriptionService";

export default function UserSubscriptionsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const fetchItems = async (q?: string) => {
    setLoading(true);
    try {
      const data = await userSubscriptionService.listUserSubscriptions(token, q ?? null);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [u, s] = await Promise.all([
          userService.listUsers(token ?? null),
          subscriptionService.listSubscriptions(token ?? null),
        ]);
        setUsers(u);
        setSubscriptions(s);
      } catch (err) {
        console.error('Failed to load users/subscriptions', err);
      }
    };
    fetchOptions();
  }, [token]);

  function formatDisplayDate(d?: string | null) {
    if (!d) return "";
    try {
      // accept either YYYY-MM-DD or ISO
      const date = new Date(d);
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch (e) {
      return d;
    }
  }

  function formatDisplayDateTime(d?: string | null) {
    if (!d) return "";
    try {
      const date = new Date(d);
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch (e) {
      return d;
    }
  }

  function getUserLabel(userId?: number) {
    if (userId == null) return "";
    const u = users.find((x) => x.user_id === userId);
    if (!u) return String(userId);
    return `${u.user_name} (${u.email})`;
  }

  function getSubscriptionLabel(subId?: number) {
    if (subId == null) return "";
    const s = subscriptions.find((x) => x.id === subId);
    if (!s) return String(subId);
    return `${s.subscription_name} (${s.duration} Days)`;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">User Subscriptions</h1>
          <p className="text-sm text-gray-500">List of user subscriptions</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
          <input className="border rounded px-3 py-2" placeholder="search" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <button onClick={()=>fetchItems(query)} className="inline-flex items-center justify-center gap-2 rounded-lg transition  px-4 py-3 text-sm bg-black text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ml-5 text-white text-md px-3 py-1 rounded-md ml-2 text-md text-white px-3 py-1 rounded-md hover:bg-gray-800">Search</button>
          <button onClick={()=>{ setQuery(""); fetchItems(); }} className="ml-2 px-3 py-1">Clear</button>
          </div>
          <button onClick={()=>navigate('/dashboard/user-subscriptions/new')} className="inline-flex items-center justify-center gap-2 rounded-lg transition  px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ml-5 text-white text-md px-3 py-1 rounded-md">New User Subscription</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">Subscription</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">Start</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">End</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center">No records</td></tr>
            ) : (
              items.map(i => (
                <tr key={i.id} className="border-b">
                  <td className="px-4 py-3">{i.id}</td>
                  <td className="px-4 py-3">{getUserLabel(i.user_id)}</td>
                  <td className="px-4 py-3">{getSubscriptionLabel(i.subscription_id)}</td>
                  <td className="px-4 py-3">{formatDisplayDateTime(i.start_datetime)}</td>
                  <td className="px-4 py-3">{formatDisplayDate(i.end_date)}</td>
                  <td className="px-4 py-3">{i.subscription_status}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={()=>navigate(`/dashboard/user-subscriptions/${i.id}/edit`)} className="text-indigo-600 mr-3">Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
