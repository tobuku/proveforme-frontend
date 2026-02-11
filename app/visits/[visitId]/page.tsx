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
  bg?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhotoUrl?: string | null;
    ratingAverage?: number | null;
  };
};

type Photo = {
  id: string;
  filePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

type Rating = {
  id: string;
  investorId: string;
  bgId: string;
  visitId: string;
  rating: number;
  comment: string | null;
  feedbackTags: string | null; // JSON array string
  createdAt: string;
  investor?: { id: string; firstName: string; lastName: string };
};

const FEEDBACK_TAG_LABELS: Record<string, string> = {
  responsive: "Responsive",
  good_communication: "Good Communication",
  quality_photos: "Takes Quality Pictures",
  quality_videos: "Takes Quality Videos",
  punctual: "Punctual",
  thorough: "Thorough",
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

  // Review/Rating state
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [reviewMode, setReviewMode] = useState<"view" | "form">("view");
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewDeleting, setReviewDeleting] = useState(false);

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

      // Fetch full visit details (includes BG info with profile photo)
      const visitRes = await fetch(`${API_BASE}/api/v1/visits/${visitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (visitRes.ok) {
        const visitData = await visitRes.json();
        if (visitData.visit) {
          setVisit(visitData.visit);
        }
      }

      // Fetch existing rating for this visit
      try {
        const ratingRes = await fetch(`${API_BASE}/api/v1/ratings/visit/${visitId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ratingRes.ok) {
          const ratingData = await ratingRes.json();
          if (ratingData.rating) {
            setExistingRating(ratingData.rating);
          }
        }
      } catch {
        // Non-fatal - rating may not exist yet
      }
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

  function startEditReview() {
    if (existingRating) {
      setReviewStars(existingRating.rating);
      setReviewComment(existingRating.comment || "");
      const tags = existingRating.feedbackTags ? JSON.parse(existingRating.feedbackTags) : [];
      setReviewTags(tags);
    } else {
      setReviewStars(0);
      setReviewComment("");
      setReviewTags([]);
    }
    setReviewError(null);
    setReviewMode("form");
  }

  function toggleTag(tag: string) {
    setReviewTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmitReview() {
    if (reviewStars < 1) {
      setReviewError("Please select a star rating.");
      return;
    }

    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      const isEdit = !!existingRating;
      const url = isEdit
        ? `${API_BASE}/api/v1/ratings/${existingRating!.id}`
        : `${API_BASE}/api/v1/ratings`;
      const method = isEdit ? "PUT" : "POST";

      const body: any = {
        rating: reviewStars,
        comment: reviewComment.trim() || null,
        feedbackTags: reviewTags.length > 0 ? reviewTags : null,
      };
      if (!isEdit) body.visitId = visitId;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || "Failed to submit review.");
      } else {
        setExistingRating(data.rating);
        setReviewMode("view");
      }
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleDeleteReview() {
    if (!existingRating) return;
    const token = localStorage.getItem("pfm_token");
    if (!token) return;

    setReviewDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/ratings/${existingRating.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setExistingRating(null);
        setReviewStars(0);
        setReviewComment("");
        setReviewTags([]);
        setReviewMode("view");
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
    } finally {
      setReviewDeleting(false);
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
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <h1 className="text-lg font-semibold text-black">
              {visit.project.title}
            </h1>
            <p className="text-xs text-gray-600">
              {visit.project.city}, {visit.project.state}
            </p>
            {visit.bg && role === "INVESTOR" && (
              <div className="flex items-center gap-3 pt-1">
                {visit.bg.profilePhotoUrl ? (
                  <img
                    src={visit.bg.profilePhotoUrl}
                    alt={`${visit.bg.firstName} ${visit.bg.lastName}`}
                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 border border-gray-300">
                    <span className="text-xs font-semibold text-gray-500">
                      {visit.bg.firstName.charAt(0)}{visit.bg.lastName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-black">
                    {visit.bg.firstName} {visit.bg.lastName}
                    {visit.bg.ratingAverage != null && visit.bg.ratingAverage > 0 && (
                      <span className="ml-1.5 text-[10px] font-normal text-yellow-500">
                        &#9733; {visit.bg.ratingAverage.toFixed(1)}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500">Boots on the Ground</p>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-gray-700">
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

        {/* Review Section — Investors only, when visit is SUBMITTED/APPROVED/PAID */}
        {role === "INVESTOR" && visit && ["SUBMITTED", "APPROVED", "PAID"].includes(visit.status) && (
          <section className="mt-6 rounded-lg border border-gray-300 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold text-black">Rate This Visit</h2>

            {reviewMode === "view" && existingRating ? (
              /* Show existing review */
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= existingRating.rating ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      &#9733;
                    </span>
                  ))}
                  <span className="ml-2 text-xs text-gray-500">
                    {existingRating.rating}/5
                  </span>
                </div>

                {existingRating.feedbackTags && (() => {
                  const tags: string[] = JSON.parse(existingRating.feedbackTags!);
                  return tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-medium text-blue-700"
                        >
                          {FEEDBACK_TAG_LABELS[tag] || tag}
                        </span>
                      ))}
                    </div>
                  ) : null;
                })()}

                {existingRating.comment && (
                  <p className="text-xs text-gray-600 italic">
                    &ldquo;{existingRating.comment}&rdquo;
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={startEditReview}
                    className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Edit Review
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={reviewDeleting}
                    className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    {reviewDeleting ? "Deleting..." : "Delete Review"}
                  </button>
                </div>
              </div>
            ) : reviewMode === "view" && !existingRating ? (
              /* No review yet — show prompt */
              <div>
                <p className="text-xs text-gray-500 mb-3">
                  How was this BG&apos;s work? Leave a rating to help other investors.
                </p>
                <button
                  onClick={startEditReview}
                  className="rounded bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                >
                  Write a Review
                </button>
              </div>
            ) : (
              /* Review form */
              <div className="space-y-4">
                {/* Star selector */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Rating</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewStars(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="text-2xl transition-colors"
                      >
                        <span
                          className={
                            star <= (reviewHover || reviewStars)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          &#9733;
                        </span>
                      </button>
                    ))}
                    {reviewStars > 0 && (
                      <span className="ml-2 text-xs text-gray-500">{reviewStars}/5</span>
                    )}
                  </div>
                </div>

                {/* Feedback tags */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1.5">
                    Feedback (optional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(FEEDBACK_TAG_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleTag(key)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          reviewTags.includes(key)
                            ? "border-blue-400 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Comment (optional)
                  </p>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Share your experience..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-black placeholder:text-gray-400 focus:border-blue-400 focus:outline-none"
                  />
                </div>

                {reviewError && (
                  <p className="text-xs text-red-600">{reviewError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting || reviewStars < 1}
                    className="rounded bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {reviewSubmitting
                      ? "Submitting..."
                      : existingRating
                      ? "Update Review"
                      : "Submit Review"}
                  </button>
                  <button
                    onClick={() => setReviewMode("view")}
                    className="rounded bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

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
