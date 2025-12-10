import ENDPOINTS from "../config/api";

export interface Subscription {
  id: number;
  subscription_name: string;
  description?: string;
  price: number;
  duration: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

function authHeader(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const listSubscriptions = async (token?: string | null, q?: string | null): Promise<Subscription[]> => {
  const url = q ? `${ENDPOINTS.SUBSCRIPTIONS}?q=${encodeURIComponent(q)}` : ENDPOINTS.SUBSCRIPTIONS;
  const headers: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) throw new Error(`Failed to fetch subscriptions: ${res.status}`);
  return res.json();
};

const getSubscription = async (id: number, token?: string | null): Promise<Subscription> => {
  const headers2: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(`${ENDPOINTS.SUBSCRIPTIONS}/${id}`, { method: "GET", headers: headers2 });
  if (!res.ok) throw new Error(`Failed to get subscription: ${res.status}`);
  return res.json();
};

const createSubscription = async (payload: Partial<Subscription>, token?: string | null) => {
  const headers3: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(ENDPOINTS.SUBSCRIPTIONS, { method: "POST", headers: headers3, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Failed to create subscription: ${res.status}`);
  return res.json();
};

const updateSubscription = async (id: number, payload: Partial<Subscription>, token?: string | null) => {
  const headers4: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(`${ENDPOINTS.SUBSCRIPTIONS}/${id}`, { method: "PUT", headers: headers4, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Failed to update subscription: ${res.status}`);
  return res.json();
};

const deleteSubscription = async (id: number, token?: string | null) => {
  const headers5: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(`${ENDPOINTS.SUBSCRIPTIONS}/${id}`, { method: "DELETE", headers: headers5 });
  if (!res.ok) throw new Error(`Failed to delete subscription: ${res.status}`);
  return res.json();
};

export default {
  listSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
