import ENDPOINTS from "../config/api";

function authHeader(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AdvertisementItem {
  id: number;
  original_name: string;
  url: string;
  created_at?: string;
}

const listAdvertisements = async (token?: string | null): Promise<AdvertisementItem[]> => {
  const res = await fetch(ENDPOINTS.ADVERTISEMENTS, { method: "GET", headers: { ...authHeader(token) } });
  if (!res.ok) throw new Error(`Failed to fetch advertisements: ${res.status}`);
  // API returns array of items
  return res.json();
};

const uploadAdvertisement = async (files: File[], token?: string | null) => {
  const fd = new FormData();
  for (const f of files) fd.append("files", f, f.name);
  const res = await fetch(ENDPOINTS.ADVERTISEMENTS, { method: "POST", headers: { ...authHeader(token) }, body: fd });
  if (!res.ok) throw new Error(`Failed to upload advertisement: ${res.status}`);
  return res.json();
};

const deleteAdvertisement = async (id: number, token?: string | null) => {
  const res = await fetch(`${ENDPOINTS.ADVERTISEMENTS}/${id}`, { method: "DELETE", headers: { ...authHeader(token) } });
  if (!res.ok) throw new Error(`Failed to delete advertisement: ${res.status}`);
  return res.json();
};

export default { listAdvertisements, uploadAdvertisement, deleteAdvertisement };
