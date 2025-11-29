export interface LoginPayload {
  user_name: string;
  password: string;
}

import ENDPOINTS from "../config/api";

export async function login(payload: LoginPayload) {
  const res = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    const message = json?.detail || json?.message || 'Login failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return json; // Expect { token: string, user_id: string }
}

export default { login };
