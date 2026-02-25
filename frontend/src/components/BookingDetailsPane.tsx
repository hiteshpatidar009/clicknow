import { useState, useEffect } from "react";
import { X, MapPin, Calendar, Clock, User, Search } from "lucide-react";
import { apiFetch } from "../lib/api";

interface BookingDetailsPaneProps {
    bookingId: string;
    onClose: () => void;
    onUpdate: () => void; // Callback to refresh list after assignment
}

interface Professional {
    id: string;
    businessName: string;
    rating: number;
    experience: number; // years
    location: { city: string; state: string; pincode: string };
    category: string;
    pricing: { hourlyRate: number };
    matchType?: string; // "Pincode Match", "City Match", etc.
    score?: number;
}

const BookingDetailsPane = ({ bookingId, onClose, onUpdate }: BookingDetailsPaneProps) => {
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"suggested" | "manual">("suggested");
    const [suggestedPros, setSuggestedPros] = useState<Professional[]>([]);
    const [manualPros, setManualPros] = useState<Professional[]>([]);
    const [manualSearch, setManualSearch] = useState("");
    const [assigningId, setAssigningId] = useState<string | null>(null);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    useEffect(() => {
        if (activeTab === "suggested" && booking) {
            fetchSuggestedPros();
        } else if (activeTab === "manual") {
            fetchManualPros();
        }
    }, [activeTab, booking]);

    // Debounced search for manual tab
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === "manual") fetchManualPros();
        }, 500);
        return () => clearTimeout(timer);
    }, [manualSearch]);


    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const { payload: data } = await apiFetch(`/api/v1/bookings/${bookingId}`);
            if (data.success) {
                setBooking(data.data);
            }
        } catch (err) {
            console.error("Failed to load booking", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestedPros = async () => {
        try {
            const { payload: data } = await apiFetch(`/api/v1/bookings/${bookingId}/matches`);
            if (data.success) {
                // Map response to Professional interface
                const pros = data.data.map((item: any) => ({
                    ...item.professional,
                    matchType: item.matchType,
                    score: item.score
                }));
                setSuggestedPros(pros);
            }
        } catch (err) {
            console.error("Failed to load suggestions", err);
        }
    };

    const fetchManualPros = async () => {
        try {
            // Use existing professional search API
            // Fallback: fetch all active/approved pros
            const { payload: data } = await apiFetch(`/api/v1/professionals?pageSize=50`);
            if (data.success) {
                let pros = data.data;
                // Client-side filter if backend search is limited
                if (manualSearch) {
                    const lower = manualSearch.toLowerCase();
                    pros = pros.filter((p: any) =>
                        (p.businessName && p.businessName.toLowerCase().includes(lower)) ||
                        (p.category && p.category.toLowerCase().includes(lower))
                    );
                }
                setManualPros(pros);
            }
        } catch (err) {
            console.error("Failed to load professionals", err);
        }
    };

    const handleAssign = async (professionalId: string) => {
        if (!confirm("Are you sure you want to assign this professional?")) return;

        try {
            setAssigningId(professionalId);
            const { payload: data } = await apiFetch(`/api/v1/bookings/${bookingId}/assign`, {
                method: "PUT",
                body: JSON.stringify({ professionalId })
            });
            if (data.success) {
                alert("Professional assigned successfully!");
                onUpdate();
                onClose();
            } else {
                alert(data.message || "Assignment failed");
            }
        } catch (err) {
            console.error("Assignment error", err);
            alert("Failed to assign professional");
        } finally {
            setAssigningId(null);
        }
    };


    if (!booking && loading) return <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white">Loading...</div>;
    if (!booking) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Side Pane */}
            <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#F8FAFC]">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
                        <p className="text-sm text-gray-500">ID: {booking.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* 1. Booking Info Card */}
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{booking.eventType || "Event"}</h3>
                                <div className="flex items-center gap-2 text-gray-600 mt-1 text-sm">
                                    <User size={14} />
                                    <span>{booking.clientName || "Unknown Client"}</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}
                    `}>
                                {booking.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Calendar size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">DATE</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Clock size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">TIME</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {booking.startTime || "--:--"} - {booking.endTime || "--:--"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 col-span-2">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><MapPin size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">LOCATION</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {booking.location?.address}, {booking.location?.city}, {booking.location?.state} - {booking.location?.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {booking.clientNotes && (
                            <div className="bg-white p-3 rounded-xl border border-blue-100 text-sm text-gray-600 mt-2">
                                <span className="font-medium text-gray-900">Note:</span> {booking.clientNotes}
                            </div>
                        )}
                    </div>

                    {/* 2. Assignment Section */}
                    {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                        <div className="bg-white border text-gray-600 rounded-2xl overflow-hidden shadow-sm">
                            <div className="flex border-b">
                                <button
                                    onClick={() => setActiveTab("suggested")}
                                    className={`flex-1 py-4 text-sm font-semibold transition border-b-2 
                        ${activeTab === "suggested" ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}
                                >
                                    Suggested Professionals
                                </button>
                                <button
                                    onClick={() => setActiveTab("manual")}
                                    className={`flex-1 py-4 text-sm font-semibold transition border-b-2 
                        ${activeTab === "manual" ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}
                                >
                                    Manual Selection
                                </button>
                            </div>

                            <div className="p-6 bg-gray-50/50 min-h-[300px]">

                                {/* Suggested Content */}
                                {activeTab === "suggested" && (
                                    <div className="space-y-4">
                                        {suggestedPros.length === 0 ? (
                                            <p className="text-center text-gray-500 py-8">No specific matches found. Try manual selection.</p>
                                        ) : (
                                            suggestedPros.map((pro) => (
                                                <div key={pro.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                            {pro.businessName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{pro.businessName}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1 text-amber-500 font-medium">★ {pro.rating}</span>
                                                                <span>• {pro.experience} yrs exp</span>
                                                                <span>• {pro.location?.city}</span>
                                                            </div>
                                                            {pro.matchType && (
                                                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                                                                    {pro.matchType}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleAssign(pro.id)}
                                                        disabled={assigningId === pro.id}
                                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm shadow-indigo-200"
                                                    >
                                                        {assigningId === pro.id ? "Assigning..." : "Assign"}
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Manual Content */}
                                {activeTab === "manual" && (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search professionals by name..."
                                                value={manualSearch}
                                                onChange={(e) => setManualSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 outline-none"
                                            />
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                            {manualPros.map((pro) => (
                                                <div key={pro.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-300 transition">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{pro.businessName}</h4>
                                                        <p className="text-xs text-gray-500">{pro.category} • {pro.location?.city}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAssign(pro.id)}
                                                        disabled={assigningId === pro.id}
                                                        className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                                    >
                                                        Assign
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default BookingDetailsPane;
