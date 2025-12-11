import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import mediaService, { MediaItem } from "../../services/mediaService";
import userService, { User } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
  selectedUserId?: number | null;
  selectedUser?: User | null;
}

export default function CalendarMediaModal({ isOpen, onClose, date, selectedUserId: propUserId, selectedUser: propUser }: Props) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(propUserId ?? null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = "https://api.pbsmedia.com";

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
        if (propUser) {
          // If a specific user was passed in, show only that user
          setUsers([propUser]);
          setSelectedUserId(propUser.user_id);
          return;
        }
        const list = await userService.listUsers(token ?? null);
        // filter subscribers
        const subs = list.filter((u) => u.role === "subscriber");
        setUsers(subs);
        if (subs.length > 0) {
          setSelectedUserId((prev) => prev ?? subs[0].user_id);
        }
      } catch (err) {
        // ignore
      }
    })();
  }, [isOpen, propUser]);

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

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[90%] p-4">
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="flex gap-6 p-3">
        {/* Left: main content (upload + media list) */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upload Media</h3>
            <div className="flex items-center gap-2 me-1">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">{new Date(date).toLocaleDateString("en-GB")}</span>
              <span className="px-2 py-1 text-xs font-medium bg-brand-100 text-brand-700 rounded">{media.length} items</span>
            </div>
          </div>

          {/* Subscriber Details (moved inside main area) */}
          <div className="mt-3 p-4 border rounded bg-gray-50">
            <h4 className="font-semibold mb-2">Subscriber Details</h4>
            {(() => {
              const current = propUser ?? users.find((u) => u.user_id === selectedUserId) ?? null;
              if (!current) return <div className="text-sm text-gray-500">No subscriber selected</div>;
              return (
                <div className="flex items-center gap-4 text-sm text-gray-700 min-w-0">
                  <span className="flex items-center gap-1 min-w-0">
                    <span className="text-xs text-gray-500">User Name:</span>
                    <span className="text-gray-600 truncate">{current.user_name}</span>
                  </span>

                  <span className="flex items-center gap-1 min-w-0">
                    <span className="text-xs text-gray-500">Email:</span>
                    <span className="text-gray-600 truncate">{current.email}</span>
                  </span>

                  {current.phone && (
                    <span className="flex items-center gap-1 min-w-0">
                      <span className="text-xs text-gray-500">Phone:</span>
                      <span className="text-gray-600 truncate">{current.phone}</span>
                    </span>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium">Add files</label>

            <div className="mt-2">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Select files to upload</div>
                  <div className="text-xs text-gray-500">{files.length} selected</div>
                </div>

                <input
                  type="file"
                  multiple
                  onChange={handleFilesChange}
                  className="mt-2 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white"
                />

                {files.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {files.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-white border rounded">
                        {f.type.startsWith("image") ? (
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            className="w-20 h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-14 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-600">{f.type.split("/")[0].toUpperCase()}</div>
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700 truncate">{f.name}</div>
                          <div className="text-xs text-gray-500">{(f.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button type="button" onClick={() => removeFile(idx)} className="text-red-500 text-xs">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2 justify-end items-center">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!files.length || loading}
                  aria-disabled={!files.length || loading}
                  className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Uploading..." : `Upload (${files.length})`}
                </button>
                <button type="button" onClick={() => setFiles([])} className="inline-flex items-center gap-2 px-4 py-2 rounded border">
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium">Existing media</h4>
            {loading && <div className="text-sm text-gray-500 mt-2">Loading...</div>}
            {!loading && media.length === 0 && (
              <div className="text-sm text-gray-500 mt-2">No media for this date.</div>
            )}
            <div className="mt-3 grid grid-cols-3 gap-3">
              {media.map((m) => (
                <div key={m.id} className="border rounded p-2">
                  {m.media_type.startsWith("image") ? (
                    <img src={m.url} alt={m.original_name} className="w-full h-40 object-cover rounded" />
                  ) : (
                    <video
                      controls
                      preload="metadata"
                      playsInline
                      crossOrigin="anonymous"
                      src={m.url}
                      className="w-full h-40 object-cover rounded"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <div className="mt-2">
                    <div className="text-xs text-gray-600">{m.original_name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm text-black">Added: {fmtDate(m.created_at)}</div>
                      <div>
                        <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 me-5 flex justify-end">
            <button onClick={onClose} className="rounded px-4 py-2 border">Close</button>
          </div>
        </div>

        {/* Subscriber details moved into main content area */}
        </div>
      </div>
    </Modal>
  );
}
