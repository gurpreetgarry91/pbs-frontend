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

function authHeader(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const listUsers = async (token?: string | null, q?: string | null): Promise<User[]> => {
  const url = q ? `${ENDPOINTS.USERS}?q=${encodeURIComponent(q)}` : ENDPOINTS.USERS;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  return res.json();
};

const getUser = async (id: number, token?: string | null): Promise<User> => {
  const res = await fetch(`${ENDPOINTS.USERS}/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
  if (!res.ok) throw new Error(`Failed to get user: ${res.status}`);
  return res.json();
};

const createUser = async (
  payload: Partial<User> & { password?: string },
  token?: string | null
) => {
  const res = await fetch(ENDPOINTS.USERS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create user: ${res.status}`);
  return res.json();
};

const updateUser = async (
  id: number,
  payload: Partial<User> & { password?: string },
  token?: string | null
) => {
  const res = await fetch(`${ENDPOINTS.USERS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
  return res.json();
};

const deleteUser = async (id: number, token?: string | null) => {
  const res = await fetch(`${ENDPOINTS.USERS}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
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
