import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import mediaService, { MediaItem } from "../../services/mediaService";
import userService, { User } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
}

export default function CalendarMediaModal({ isOpen, onClose, date }: Props) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = "http://127.0.0.1:8000";

  const fmtDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch (err) {
      return iso;
    }
  };


  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const list = await userService.listUsers(token ?? null);
        // filter subscribers
        setUsers(list.filter((u) => u.role === "subscriber"));
        if (list.length > 0) {
          const first = list.find((u) => u.role === "subscriber");
          setSelectedUserId(first ? first.user_id : list[0].user_id);
        }
      } catch (err) {
        // ignore
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedUserId) return;
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedUserId, date]);

  const fetchMedia = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const list = await mediaService.listMedia(selectedUserId, date, token ?? null);
      setMedia(list.map(item => ({ ...item, url: API_BASE_URL + item.url })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!selectedUserId || files.length === 0) return;
    setLoading(true);
    try {
      await mediaService.uploadMedia(selectedUserId, date, files, token ?? null);
      setFiles([]);
      await fetchMedia();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this media item?")) return;
    setLoading(true);
    try {
      await mediaService.deleteMedia(id, token ?? null);
      await fetchMedia();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Media for {date}</h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">{new Date(date).toLocaleDateString("en-GB")}</span>
            <span className="px-2 py-1 text-xs font-medium bg-brand-100 text-brand-700 rounded">{media.length} items</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="text-sm font-medium">Subscriber</label>
          <select
            value={selectedUserId ?? ""}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
            className="h-10 rounded-md border px-3"
          >
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.user_name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">Add files</label>
          <input type="file" multiple onChange={handleFilesChange} className="mt-2" />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleUpload}
              disabled={!files.length || loading}
              className="btn btn-primary rounded px-4 py-2 disabled:opacity-50"
            >
              {loading ? "Uploading..." : `Upload (${files.length})`}
            </button>
            <button onClick={() => setFiles([])} className="btn rounded px-4 py-2">
              Clear
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium">Existing media</h4>
          {loading && <div className="text-sm text-gray-500 mt-2">Loading...</div>}
          {!loading && media.length === 0 && (
            <div className="text-sm text-gray-500 mt-2">No media for this date.</div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            {media.map((m) => (
              <div key={m.id} className="border rounded p-2">
                {m.media_type.startsWith("image") ? (
                  <img src={m.url} alt={m.original_name} className="w-full h-40 object-cover rounded" />
                ) : (
                  <video controls className="w-full h-40 object-cover rounded">
                    <source src={m.url} type={m.media_type} />
                    Your browser does not support the video tag.
                  </video>
                )}
                <div className="mt-2">
                  <div className="text-xs text-gray-600">{m.original_name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-2xs text-gray-500">Added: {fmtDate(m.created_at)}</div>
                    <div>
                      <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded px-4 py-2 border">Close</button>
        </div>
      </div>
    </Modal>
  );
}
