import ENDPOINTS from "../config/api";

export interface UserSubscription {
  id: number;
  user_id: number;
  subscription_id: number;
  start_datetime: string;
  end_date: string;
  payment_method: string;
  is_deleted: boolean;
  subscription_status: string;
  added_by: number;
  created_at?: string;
  updated_at?: string;
}

function authHeader(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const listUserSubscriptions = async (token?: string | null, q?: string | null): Promise<UserSubscription[]> => {
  const url = q ? `${ENDPOINTS.SUBSCRIPTIONS.replace('/subscriptions','/user-subscriptions')}?q=${encodeURIComponent(q)}` : ENDPOINTS.SUBSCRIPTIONS.replace('/subscriptions','/user-subscriptions');
  const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...authHeader(token) } });
  if (!res.ok) throw new Error(`Failed to fetch user subscriptions: ${res.status}`);
  return res.json();
};

const getUserSubscription = async (id: number, token?: string | null) => {
  const url = ENDPOINTS.SUBSCRIPTIONS.replace('/subscriptions',`/user-subscriptions/${id}`);
  const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...authHeader(token) } });
  if (!res.ok) throw new Error(`Failed to get user subscription: ${res.status}`);
  return res.json();
};

const createUserSubscription = async (payload: Partial<UserSubscription>, token?: string | null) => {
  const url = ENDPOINTS.SUBSCRIPTIONS.replace('/subscriptions','/user-subscriptions');
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader(token) }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Failed to create user subscription: ${res.status}`);
  return res.json();
};

const updateUserSubscription = async (id: number, payload: Partial<UserSubscription>, token?: string | null) => {
  const url = ENDPOINTS.SUBSCRIPTIONS.replace('/subscriptions',`/user-subscriptions/${id}`);
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader(token) }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Failed to update user subscription: ${res.status}`);
  return res.json();
};

const deleteUserSubscription = async (id: number, token?: string | null) => {
  const url = ENDPOINTS.SUBSCRIPTIONS.replace('/subscriptions',`/user-subscriptions/${id}`);
  const res = await fetch(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeader(token) } });
  if (!res.ok) throw new Error(`Failed to delete user subscription: ${res.status}`);
  return res.json();
};

export default {
  listUserSubscriptions,
  getUserSubscription,
  createUserSubscription,
  updateUserSubscription,
  deleteUserSubscription,
};
