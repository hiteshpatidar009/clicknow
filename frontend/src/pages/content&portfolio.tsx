import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

type Tab = "media" | "company";

interface MediaItem {
  id: string;
  key?: string;
  title: string;
  category: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  description?: string;
}

interface PortfolioContent {
  aboutTitle?: string;
  aboutText?: string;
  missionTitle?: string;
  missionText?: string;
  whyChooseUsTitle?: string;
  whyChooseUsPoints?: string[];
  stats?: { events?: string; professionals?: string; ratings?: string };
  testimonials?: Array<{
    id: string;
    name: string;
    location: string;
    rating: number;
    message: string;
  }>;
  mediaGallery?: MediaItem[];
}

const ContentPortfolio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("media");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [aboutText, setAboutText] = useState("");
  const [missionText, setMissionText] = useState("");
  const [whyChooseUsText, setWhyChooseUsText] = useState(
    "Verified and experienced professionals\nTransparent pricing with no hidden costs\n24/7 customer support\nQuality guaranteed on every service",
  );
  const [eventsStat, setEventsStat] = useState("500+");
  const [professionalsStat, setProfessionalsStat] = useState("500+");
  const [ratingsStat, setRatingsStat] = useState("500+");
  const [testimonials, setTestimonials] = useState<
    Array<{ id: string; name: string; location: string; rating: number; message: string }>
  >([]);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddMediaForm, setShowAddMediaForm] = useState(false);
  const [newMediaTitle, setNewMediaTitle] = useState("");
  const [newMediaCategory, setNewMediaCategory] = useState("photography");
  const [newMediaDescription, setNewMediaDescription] = useState("");
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(["all"]);
    mediaItems.forEach((item) => set.add((item.category || "all").toLowerCase()));
    return Array.from(set);
  }, [mediaItems]);

  const filteredMedia = useMemo(() => {
    if (selectedCategory === "all") return mediaItems;
    return mediaItems.filter((item) => (item.category || "").toLowerCase() === selectedCategory);
  }, [mediaItems, selectedCategory]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { response, payload } = await apiFetch("/api/v1/admin/settings");
    if (!response.ok || !payload?.success) return;
    const content: PortfolioContent = payload?.data?.portfolioContent || {};
    setAboutText(content.aboutText || "");
    setMissionText(content.missionText || "");
    setWhyChooseUsText((content.whyChooseUsPoints || []).join("\n"));
    setEventsStat(content.stats?.events || "500+");
    setProfessionalsStat(content.stats?.professionals || "500+");
    setRatingsStat(content.stats?.ratings || "500+");
    setTestimonials(
      Array.isArray(content.testimonials)
        ? content.testimonials.map((t) => ({
            id: t.id,
            name: t.name || "Customer Name",
            location: t.location || "",
            rating: Number(t.rating || 5),
            message: t.message || "",
          }))
        : [],
    );
    const rawMedia = Array.isArray(content.mediaGallery) ? content.mediaGallery : [];
    const hydrated = await Promise.all(
      rawMedia.map(async (item) => {
        if (!item?.key) return item;
        try {
          const { response: sRes, payload: sPayload } = await apiFetch(
            `/api/v1/uploads/signed-url?key=${encodeURIComponent(item.key)}`,
          );
          if (sRes.ok && sPayload?.success && sPayload?.data?.url) {
            return { ...item, url: sPayload.data.url, thumbnailUrl: sPayload.data.url };
          }
          return item;
        } catch {
          return item;
        }
      }),
    );
    setMediaItems(hydrated);
  };

  const savePortfolioContent = async (extra: Partial<PortfolioContent> = {}) => {
    setSaving(true);
    try {
      const whyPoints = whyChooseUsText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
      const payload = {
        portfolioContent: {
          aboutTitle: "About ClickNow",
          aboutText,
          missionTitle: "Our Mission",
          missionText,
          whyChooseUsTitle: "Why Choose Us?",
          whyChooseUsPoints: whyPoints,
          stats: {
            events: eventsStat,
            professionals: professionalsStat,
            ratings: ratingsStat,
          },
          testimonials,
          mediaGallery: mediaItems,
          ...extra,
        },
      };

      const { response, payload: resPayload } = await apiFetch("/api/v1/admin/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (!response.ok || !resPayload?.success) {
        alert(resPayload?.message || "Failed to save content");
        return false;
      }
      return true;
    } finally {
      setSaving(false);
    }
  };

  const handleAddMedia = async () => {
    if (!newMediaFile) {
      alert("Please select media file");
      return;
    }
    if (!newMediaCategory.trim()) {
      alert("Please enter category");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", newMediaFile);
      formData.append("folder", "content-gallery");

      const { response: upRes, payload: upPayload } = await apiFetch("/api/v1/uploads/general", {
        method: "POST",
        body: formData,
        headers: {},
      });
      if (!upRes.ok || !upPayload?.success) {
        alert(upPayload?.message || "Upload failed");
        return;
      }

      const f = upPayload.data;
      const item: MediaItem = {
        id: `media_${Date.now()}`,
        key: f.key,
        title: newMediaTitle || newMediaFile.name,
        category: newMediaCategory.toLowerCase(),
        type: String(f?.mimetype || "").startsWith("video/") ? "video" : "image",
        url: f.url,
        thumbnailUrl: f.url,
        description: newMediaDescription,
      };

      const next = [item, ...mediaItems];
      setMediaItems(next);
      const saved = await savePortfolioContent({ mediaGallery: next });
      if (!saved) return;

      setShowAddMediaForm(false);
      setNewMediaFile(null);
      setNewMediaTitle("");
      setNewMediaDescription("");
      setNewMediaCategory("photography");
      alert("Media added");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Delete this media item?")) return;
    const next = mediaItems.filter((x) => x.id !== id);
    setMediaItems(next);
    const saved = await savePortfolioContent({ mediaGallery: next });
    if (!saved) {
      setMediaItems(mediaItems);
      return;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f7f9fc] overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg">
      <div className="bg-[#EAF0F5] px-4 sm:px-6 py-4 pt-6 border-b border-gray-200 rounded-t-2xl sm:rounded-t-3xl">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Content & Portfolio</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Separate admin section to manage media, categories, about and testimonials
        </p>
      </div>

      <div className="bg-[#f7f9fc] px-4 sm:px-6 pt-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("media")}
            className={`text-sm sm:text-base font-semibold pb-2 transition-colors whitespace-nowrap ${
              activeTab === "media"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Media Gallery
          </button>
          <button
            onClick={() => setActiveTab("company")}
            className={`text-sm sm:text-base font-semibold pb-2 transition-colors whitespace-nowrap ${
              activeTab === "company"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Portfolio Brief
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 sm:px-6 py-6">
        {activeTab === "media" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1.5 rounded-xl text-sm capitalize ${
                      selectedCategory === c
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddMediaForm(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-sm font-semibold"
              >
                + Add Media
              </button>
            </div>

            {showAddMediaForm && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Add Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setNewMediaFile(e.target.files?.[0] || null)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                  <input
                    value={newMediaTitle}
                    onChange={(e) => setNewMediaTitle(e.target.value)}
                    placeholder="Title"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                  <input
                    value={newMediaCategory}
                    onChange={(e) => setNewMediaCategory(e.target.value)}
                    placeholder="Category (Photography, Musician, DJ...)"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                  <input
                    value={newMediaDescription}
                    onChange={(e) => setNewMediaDescription(e.target.value)}
                    placeholder="Description"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowAddMediaForm(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMedia}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm disabled:opacity-60"
                  >
                    {uploading ? "Uploading..." : "Create Media"}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm"
                >
                  <div className="bg-gray-100 rounded-lg sm:rounded-xl h-40 sm:h-48 flex items-center justify-center mb-4 sm:mb-5 overflow-hidden">
                    {item.type === "video" ? (
                      <video src={item.url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-800 font-semibold text-sm sm:text-base">
                        {item.title || "Untitled"}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm mt-1 capitalize">
                        {item.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "company" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-gray-800 text-base font-semibold mb-3">About</h2>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-gray-800 text-base font-semibold mb-3">Mission</h2>
              <textarea
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-gray-800 text-base font-semibold mb-3">Why Choose Us (line by line)</h2>
              <textarea
                value={whyChooseUsText}
                onChange={(e) => setWhyChooseUsText(e.target.value)}
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-gray-800 text-base font-semibold mb-3">Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={eventsStat}
                  onChange={(e) => setEventsStat(e.target.value)}
                  placeholder="Events (500+)"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
                <input
                  value={professionalsStat}
                  onChange={(e) => setProfessionalsStat(e.target.value)}
                  placeholder="Professionals (500+)"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
                <input
                  value={ratingsStat}
                  onChange={(e) => setRatingsStat(e.target.value)}
                  placeholder="Ratings (500+)"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-gray-800 text-base font-semibold mb-3">Testimonials (Admin Managed)</h2>
              <div className="space-y-3">
                {testimonials.map((t) => (
                  <div key={t.id} className="border border-gray-200 rounded-xl p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <input
                        value={t.name}
                        onChange={(e) =>
                          setTestimonials((prev) =>
                            prev.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)),
                          )
                        }
                        placeholder="Name"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={t.location}
                        onChange={(e) =>
                          setTestimonials((prev) =>
                            prev.map((x) => (x.id === t.id ? { ...x, location: e.target.value } : x)),
                          )
                        }
                        placeholder="Location"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={t.rating}
                        onChange={(e) =>
                          setTestimonials((prev) =>
                            prev.map((x) =>
                              x.id === t.id ? { ...x, rating: Number(e.target.value || 0) } : x,
                            ),
                          )
                        }
                        placeholder="Rating"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <textarea
                      value={t.message}
                      onChange={(e) =>
                        setTestimonials((prev) =>
                          prev.map((x) => (x.id === t.id ? { ...x, message: e.target.value } : x)),
                        )
                      }
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="text-right mt-2">
                      <button
                        onClick={() => setTestimonials((prev) => prev.filter((x) => x.id !== t.id))}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setTestimonials((prev) => [
                      ...prev,
                      {
                        id: `t_${Date.now()}`,
                        name: "Customer Name",
                        location: "",
                        rating: 5,
                        message: "Great service.",
                      },
                    ])
                  }
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm"
                >
                  Add Testimonial
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => savePortfolioContent()}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Portfolio Brief"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ContentPortfolio;
