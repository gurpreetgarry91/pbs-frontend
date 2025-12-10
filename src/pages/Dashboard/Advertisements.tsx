import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import advertisementService, { AdvertisementItem } from "../../services/advertisementService";

const AdvertisementsPage: React.FC = () => {
  const { token } = useAuth();
  const [ads, setAds] = useState<AdvertisementItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const API_BASE_URL = "http://127.0.0.1:8000";

  const fetchAds = async () => {
    try {
      const list = await advertisementService.listAdvertisements(token ?? null);
      setAds(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAds(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const onFilesSelected = (fs: FileList | null) => {
    if (!fs) return;
    const arr = Array.from(fs).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...arr]);
  };

  const removeSelected = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);
    try {
      await advertisementService.uploadAdvertisement(files, token ?? null);
      setFiles([]);
      await fetchAds();
    } catch (err) {
      console.error(err);
      window.alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this advertisement?")) return;
    try {
      await advertisementService.deleteAdvertisement(id, token ?? null);
      setAds((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      window.alert("Delete failed");
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Advertisements</h2>
            <p className="text-sm text-gray-500">Upload promotional images shown across the app.</p>
          </div>
          <div className="text-sm text-gray-400">Images only · Multiple files supported</div>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="flex items-center w-100 gap-2 px-3 py-2 border border-dashed rounded-md cursor-pointer text-sm text-gray-600">
            <span className="text-sm">Select images</span>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => onFilesSelected(e.target.files)} className="hidden" />
          </label>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1 bg-white border rounded text-sm">Choose</button>
            <button disabled={files.length === 0 || loading} type="submit" className="px-3 py-1 bg-black text-white rounded text-sm disabled:opacity-50">{loading ? 'Uploading...' : 'Upload'}</button>
            {files.length > 0 && (
              <button type="button" onClick={() => setFiles([])} className="px-2 py-1 text-sm text-gray-600">Clear</button>
            )}
          </div>
        </form>

        {files.length > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {previews.map((p, idx) => (
              <div key={idx} className="relative rounded overflow-hidden bg-gray-50">
                <img src={p.url} alt={p.file.name} className="w-full h-20 object-cover" />
                <button onClick={() => removeSelected(idx)} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-gray-700 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-medium mb-4">Existing Advertisements</h3>
        {ads.length === 0 ? (
          <div className="text-sm text-gray-500">No advertisements uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ads.map((a) => (
              <div key={a.id} className="relative rounded overflow-hidden bg-gray-50">
                <img src={API_BASE_URL + a.url} alt={a.original_name} className="w-full h-28 object-cover" />
                <button onClick={() => handleDelete(a.id)} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-gray-700 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertisementsPage;
