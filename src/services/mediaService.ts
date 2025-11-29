import ENDPOINTS from "../config/api";

function authHeader(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface MediaItem {
  id: number;
  user_id: number;
  original_name: string;
  url: string;
  media_type: string;
  created_at: string;
}

const listMedia = async (
  userId: number,
  date: string,
  token?: string | null
): Promise<MediaItem[]> => {
  const url = `${ENDPOINTS.MEDIA}?user_id=${encodeURIComponent(
    String(userId)
  )}&date=${encodeURIComponent(date)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
  if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`);
  return res.json();
};

const uploadMedia = async (
  userId: number,
  date: string,
  files: File[],
  token?: string | null
) => {
  const fd = new FormData();
  fd.append("user_id", String(userId));
  fd.append("date", date);
  for (const f of files) {
    fd.append("files", f, f.name);
  }

  const res = await fetch(ENDPOINTS.MEDIA, {
    method: "POST",
    headers: { ...authHeader(token) },
    body: fd,
  });
  if (!res.ok) throw new Error(`Failed to upload media: ${res.status}`);
  return res.json();
};

const deleteMedia = async (id: number, token?: string | null) => {
  const res = await fetch(`${ENDPOINTS.MEDIA}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
  if (!res.ok) throw new Error(`Failed to delete media: ${res.status}`);
  return res.json();
};

export default { listMedia, uploadMedia, deleteMedia };
