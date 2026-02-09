"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthedHeader } from "../../../components/AuthedHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type Visit = {
  id: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
  createdAt: string;
  project: {
    id: string;
    title: string;
    city: string;
    state: string;
    investorId: string;
  };
  bgId: string;
};

type Photo = {
  id: string;
  filePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

type UserRole = "INVESTOR" | "BG";

export default function VisitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const visitId = params.visitId as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  // Lightbox state
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  useEffect(() => { document.title = "Visit Details \u2014 ProveForMe"; }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("pfm_token");
    const storedRole = localStorage.getItem("pfm_role");
    if (!token) {
      router.replace("/login");
      return;
    }
    setRole(storedRole as UserRole);
    loadVisitData(token);
  }, [visitId]);

  async function loadVisitData(token: string) {
    try {
      setLoading(true);
      setError(null);

      // We need to get visit info. The photos endpoint gives us photos,
      // but we need visit details too. We'll fetch photos first (which validates access),
      // then use the visit info from the BG visits or construct it.
      // Actually, let's fetch photos and also try to get visit info from the my-visits endpoint
      // or project endpoint depending on role.

      // Fetch photos (this validates access via canAccessVisit)
      const photosRes = await fetch(`${API_BASE}/api/v1/visits/${visitId}/photos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!photosRes.ok) {
        const data = await photosRes.json().catch(() => ({}));
        throw new Error(data.error || `Failed to load visit (${photosRes.status})`);
      }

      const photosData = await photosRes.json();
      setPhotos(photosData.photos || []);

      // Fetch visit details from BG visits endpoint (works for BGs)
      const storedRole = localStorage.getItem("pfm_role");
      if (storedRole === "BG") {
        const visitsRes = await fetch(`${API_BASE}/api/v1/visits/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (visitsRes.ok) {
          const visitsData = await visitsRes.json();
          const found = (visitsData.visits || []).find((v: any) => v.id === visitId);
          if (found) {
            setVisit(found);
          }
        }
      }
      // For investors, we don't have a single-visit endpoint, but we loaded photos successfully
      // so we know we have access. We'll show what we can.
    } catch (err: any) {
      setError(err.message || "Failed to load visit data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;

    if (files.length > 10) {
      setUploadError("Maximum 10 files per upload.");
      return;
    }

    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 20 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds 20MB limit.`);
        setUploading(false);
        return;
      }
      formData.append("photos", file);
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/visits/${visitId}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
      } else {
        // Refresh photos
        setPhotos((prev) => [...prev, ...(data.photos || [])]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setDeletingPhotoId(photoId);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/visits/${visitId}/photos/${photoId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    } catch (err) {
      console.error("Failed to delete photo:", err);
    } finally {
      setDeletingPhotoId(null);
    }
  }

  const headerRole = role === "BG" ? "BG" : "INVESTOR";

  if (loading) {
    return (
      <div className="pfm-shell">
        <AuthedHeader role={headerRole} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm text-gray-600">Loading visit...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pfm-shell">
        <AuthedHeader role={headerRole} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-xs text-gray-600 hover:underline"
          >
            &larr; Go Back
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="pfm-shell">
      <AuthedHeader role={headerRole} />

      <main className="mx-auto max-w-3xl px-4 py-8 text-sm">
        <button
          onClick={() => router.back()}
          className="mb-4 text-xs text-gray-600 hover:underline"
        >
          &larr; Back
        </button>

        {/* Visit Info Header */}
        {visit ? (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1">
            <h1 className="text-lg font-semibold text-black">
              {visit.project.title}
            </h1>
            <p className="text-xs text-gray-600">
              {visit.project.city}, {visit.project.state}
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-700">
              <span>
                <span className="font-semibold">Status:</span> {visit.status}
              </span>
              <span>
                <span className="font-semibold">Scheduled:</span>{" "}
                {new Date(visit.scheduledAt).toLocaleString()}
              </span>
            </div>
            {visit.notes && (
              <p className="text-xs text-gray-600 pt-1">
                <span className="font-semibold">Notes:</span> {visit.notes}
              </p>
            )}
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h1 className="text-lg font-semibold text-black">Visit Details</h1>
            <p className="text-xs text-gray-500">Visit ID: {visitId}</p>
          </div>
        )}

        {/* Photo Upload */}
        <section className="mb-6 rounded-lg border border-gray-300 bg-white p-4 space-y-3">
          <h2 className="text-sm font-semibold text-black">Upload Photos</h2>
          <p className="text-xs text-gray-600">
            JPEG, PNG, or WebP. Max 10 files, 20MB each.
          </p>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="text-xs file:mr-3 file:rounded file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-gray-800"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="rounded bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {uploadError && (
            <p className="text-xs text-red-600">{uploadError}</p>
          )}
        </section>

        {/* Photo Gallery */}
        <section className="rounded-lg border border-gray-300 bg-white p-4 space-y-3">
          <h2 className="text-sm font-semibold text-black">
            Photos ({photos.length})
          </h2>

          {photos.length === 0 ? (
            <p className="text-xs text-gray-500">No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={photo.filePath}
                    alt={photo.originalName}
                    onClick={() => setLightboxPhoto(photo)}
                    className="w-full h-40 object-cover cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <p className="text-[10px] text-white truncate max-w-[60%]">
                      {photo.originalName}
                    </p>
                    <div className="flex gap-1 pointer-events-auto">
                      <a
                        href={photo.filePath}
                        download={photo.originalName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-black hover:bg-gray-200"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        disabled={deletingPhotoId === photo.id}
                        className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        {deletingPhotoId === photo.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                  <p className="px-2 py-1 text-[10px] text-gray-500 truncate">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Lightbox */}
        {lightboxPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setLightboxPhoto(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxPhoto.filePath}
                alt={lightboxPhoto.originalName}
                className="max-w-full max-h-[85vh] object-contain rounded"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-white truncate">
                  {lightboxPhoto.originalName}
                </p>
                <div className="flex gap-2">
                  <a
                    href={lightboxPhoto.filePath}
                    download={lightboxPhoto.originalName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-gray-200"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setLightboxPhoto(null)}
                    className="rounded bg-gray-700 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
