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

function authHeader(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const listSubscriptions = async (token?: string | null, q?: string | null): Promise<Subscription[]> => {
  const url = q ? `${ENDPOINTS.SUBSCRIPTIONS}?q=${encodeURIComponent(q)}` : ENDPOINTS.SUBSCRIPTIONS;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
  if (!res.ok) throw new Error(`Failed to fetch subscriptions: ${res.status}`);
  return res.json();
};

const getSubscription = async (id: number, token?: string | null): Promise<Subscription> => {
  const res = await fetch(`${ENDPOINTS.SUBSCRIPTIONS}/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
  if (!res.ok) throw new Error(`Failed to get subscription: ${res.status}`);
  return res.json();
};

const createSubscription = async (payload: Partial<Subscription>, token?: string | null) => {
  const res = await fetch(ENDPOINTS.SUBSCRIPTIONS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create subscription: ${res.status}`);
  return res.json();
};

const updateSubscription = async (id: number, payload: Partial<Subscription>, token?: string | null) => {
  const res = await fetch(`${ENDPOINTS.SUBSCRIPTIONS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update subscription: ${res.status}`);
  return res.json();
};

const deleteSubscription = async (id: number, token?: string | null) => {
  const res = await fetch(`${ENDPOINTS.SUBSCRIPTIONS}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
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
