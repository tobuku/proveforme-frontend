"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VisitPhoto = {
  id: string;
  visitId: string;
  filePath: string;
  originalName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

type PhotosResponse = {
  ok: boolean;
  photos: VisitPhoto[];
};

type UploadResponse = {
  ok: boolean;
  photo?: VisitPhoto;
  error?: string;
};

export default function UploadTestPage() {
  const [visitId, setVisitId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
  const [photos, setPhotos] = useState<VisitPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastLoadedVisitId, setLastLoadedVisitId] = useState<string | null>(
    null
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    const initialVisitId = searchParams.get("visitId");
    if (initialVisitId) {
      setVisitId(initialVisitId);
    }
  }, [searchParams]);


  const backendBase = "http://localhost:4000";

  async function handleUpload() {
    setError(null);
    setMessage(null);

    if (!visitId) {
      setError("Visit ID is required.");
      return;
    }

    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      // MUST be "photo" – matches upload.single("photo") in server.ts
      formData.append("photo", file, file.name);

      const res = await fetch(
        `${backendBase}/api/v1/visits/${encodeURIComponent(visitId)}/photos`,
        {
          method: "POST",
          body: formData
        }
      );

      let data: UploadResponse;
      try {
        data = (await res.json()) as UploadResponse;
      } catch {
        throw new Error(
          `Upload failed (status ${res.status}) and response was not JSON`
        );
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Upload failed with status ${res.status}`);
      }

      setMessage("Photo uploaded successfully.");

      if (data.photo) {
        // Prepend new photo to current list if we are viewing same visit
        setPhotos((prev) =>
          data.photo!.visitId === visitId ? [data.photo!, ...prev] : prev
        );
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleLoadPhotos() {
    setError(null);
    setMessage(null);

    if (!visitId) {
      setError("Visit ID is required.");
      return;
    }

    try {
      setLoadingPhotos(true);
      const res = await fetch(
        `${backendBase}/api/v1/visits/${encodeURIComponent(visitId)}/photos`
      );

      if (!res.ok) {
        throw new Error(`Failed to load photos (status ${res.status})`);
      }

      const data = (await res.json()) as PhotosResponse;
      console.log("Photos response:", data);

      if (!data.ok) {
        throw new Error("Backend reported an error loading photos.");
      }

      setPhotos(data.photos);
      setLastLoadedVisitId(visitId);

      if (data.photos.length === 0) {
        setMessage("No photos found for this visit yet.");
      } else {
        setMessage(`Loaded ${data.photos.length} photo(s).`);
      }
    } catch (err: any) {
      console.error("Load photos error:", err);
      setError(err.message || "Failed to load photos.");
    } finally {
      setLoadingPhotos(false);
    }
  }

  function humanFileSize(bytes: number | null) {
    if (bytes == null) return "unknown size";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  }

  function getFileNameFromPath(p: string) {
    const parts = p.split(/[/\\]/);
    return parts[parts.length - 1];
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="p-6 md:p-8 rounded-2xl shadow-xl bg-slate-800 max-w-3xl w-full space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">ProveForMe Photo Upload Test</h1>
          <p className="text-xs text-slate-300">
            Standalone lab page for testing{" "}
            <span className="font-mono">/visits/:visitId/photos</span> API.
          </p>
          <p className="text-[11px] text-slate-400">
            Backend:{" "}
            <span className="font-mono text-slate-200">
              http://localhost:4000
            </span>
          </p>
          <p className="text-[11px] text-slate-400">
            You&apos;ll need a real Visit ID (e.g.{" "}
            <span className="font-mono">
              a76a31ee-9fc0-4c26-b863-cb1b517393b0
            </span>
            ).
          </p>
          <a
            href="/"
            className="inline-block mt-1 text-[11px] text-emerald-300 hover:text-emerald-200 underline"
          >
            ← Back to main dashboard
          </a>
        </header>

        <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3 text-xs">
          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="text-[11px] text-slate-300">
                Visit ID (required)
              </span>
              <input
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-600 text-xs break-all"
                value={visitId}
                onChange={(e) => setVisitId(e.target.value)}
                placeholder="Paste a Visit ID like a76a31ee-9fc0-4c26-b863-cb1b517393b0"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[11px] text-slate-300">
                Photo file (required)
              </span>
              <input
                type="file"
                accept="image/*"
                className="w-full text-[11px] text-slate-200 file:text-xs file:px-2 file:py-1 file:mr-2 file:rounded file:border-0 file:bg-emerald-500 file:text-black"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                }}
              />
              {file && (
                <p className="text-[11px] text-slate-400">
                  Selected: <span className="font-mono">{file.name}</span> (
                  {humanFileSize(file.size)})
                </p>
              )}
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-semibold border border-emerald-400 text-[11px]"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Upload photo to visit"}
            </button>

            <button
              className="px-3 py-1 rounded-lg bg-slate-700 text-white font-semibold border border-slate-500 text-[11px]"
              onClick={handleLoadPhotos}
              disabled={loadingPhotos}
            >
              {loadingPhotos ? "Loading photos…" : "Load photos for this visit"}
            </button>
          </div>

          {/* Tiny debug line */}
          <p className="text-[10px] text-slate-500">
            Debug: loaded {photos.length} photo(s) for visit{" "}
            {lastLoadedVisitId ? (
              <span className="font-mono">{lastLoadedVisitId}</span>
            ) : (
              "(none yet)"
            )}
          </p>

          {error && (
            <div className="p-2 rounded bg-red-700/70 text-[11px]">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {message && !error && (
            <div className="p-2 rounded bg-emerald-700/60 text-[11px]">
              {message}
            </div>
          )}
        </section>

        <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-2 text-xs">
          <h2 className="text-sm font-semibold text-slate-200">
            Photos for this visit
          </h2>

          {photos.length === 0 ? (
            <p className="text-[11px] text-slate-400">
              No photos loaded yet. Upload one or click &quot;Load photos&quot;.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {photos.map((p) => {
                const fileName = getFileNameFromPath(p.filePath);
                const url = `${backendBase}/uploads/${encodeURIComponent(
                  fileName
                )}`;

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-slate-800/80 border border-slate-700"
                  >
                    <p className="text-[11px] text-slate-200">
                      <span className="font-semibold">Original name:</span>{" "}
                      {p.originalName || "(unknown)"}
                    </p>
                    <p className="text-[11px] text-slate-200">
                      <span className="font-semibold">MIME type:</span>{" "}
                      {p.mimeType || "(unknown)"}
                    </p>
                    <p className="text-[11px] text-slate-200">
                      <span className="font-semibold">Size:</span>{" "}
                      {humanFileSize(p.sizeBytes)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Uploaded: {new Date(p.createdAt).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 break-all">
                      File path: {p.filePath}
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-1 text-[11px] text-emerald-300 hover:text-emerald-200 underline"
                    >
                      Open raw image
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
