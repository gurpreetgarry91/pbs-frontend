import ENDPOINTS from "../config/api";

export interface User {
  user_id: number;
  user_name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

function authHeader(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const listUsers = async (token?: string | null, q?: string | null): Promise<User[]> => {
  const url = q ? `${ENDPOINTS.USERS}?q=${encodeURIComponent(q)}` : ENDPOINTS.USERS;
  const headers: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  return res.json();
};

const getUser = async (id: number, token?: string | null): Promise<User> => {
  const headers2: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(`${ENDPOINTS.USERS}/${id}`, { method: "GET", headers: headers2 });
  if (!res.ok) throw new Error(`Failed to get user: ${res.status}`);
  return res.json();
};

const createUser = async (
  payload: Partial<User> & { password?: string },
  token?: string | null
) => {
  const headers3: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(ENDPOINTS.USERS, { method: "POST", headers: headers3, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Failed to create user: ${res.status}`);
  return res.json();
};

const updateUser = async (
  id: number,
  payload: Partial<User> & { password?: string },
  token?: string | null
) => {
  const headers4: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(`${ENDPOINTS.USERS}/${id}`, { method: "PUT", headers: headers4, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
  return res.json();
};

const deleteUser = async (id: number, token?: string | null) => {
  const headers5: HeadersInit = { "Content-Type": "application/json", ...authHeader(token) };
  const res = await fetch(`${ENDPOINTS.USERS}/${id}`, { method: "DELETE", headers: headers5 });
  if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
  return res.json();
};

export default {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
