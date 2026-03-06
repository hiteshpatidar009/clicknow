import React from "react";

interface Professional {
  id: string;
  userId: string;
  businessName: string;
  name: string; // normalized
  category: string;
  service: string; // normalized
  bio: string;
  experience: number | string;
  specialties: string[];
  status: string;
  createdAt: string;
  date: string; // normalized
  location: {
    address?: string;
    city: string;
    state: string;
    country?: string;
    pincode: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
  };
  personalDetails?: {
    gender?: string;
    dob?: string;
    languagesKnown?: string[];
  };
  workDetails?: {
    availableWorkingDays?: string[];
    startTime?: string;
    endTime?: string;
    equipmentDetails?: string;
    socialLinks?: {
      instagram?: string;
      website?: string;
    };
  };
  serviceAreas?: string[];
  pricing?: {
    hourlyRate: number;
    minimumHours: number;
    packages: Array<{
      name: string;
      price: number;
      description: string;
    }>;
    currency: string;
  };
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    upiId?: string;
  };
  documents?: {
    aadharNumber?: string;
    panNumber?: string;
    gstNumber?: string;
    aadharFront?: string;
    aadharBack?: string;
    panCard?: string;
    policeVerificationCertificate?: string;
  };
  stats?: {
    totalBookings: number;
    completedBookings?: number;
    averageRating: number;
  };
}

interface ProfessionalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Professional | null;
  fullPage?: boolean;
  onApprove?: () => void;
  onSuspend?: () => void;
  onRequestReupload?: () => void;
  actionLoading?: boolean;
}

const ProfessionalDetailsModal: React.FC<ProfessionalDetailsModalProps> = ({
  isOpen,
  onClose,
  professional,
  fullPage = false,
  onApprove,
  onSuspend,
  onRequestReupload,
  actionLoading = false,
}) => {
  if (!isOpen || !professional) return null;

  const getInitial = (name: string): string => {
    return name ? name.charAt(0) : 'P';
  };

  const getStatusStyle = (status: string): string => {
    const s = status.toLowerCase();
    switch (s) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-600'
      case 'pending':
        return 'bg-yellow-100 text-yellow-600'
      case 'suspended':
      case 'rejected':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  };

  const content = (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Back Button */}
      <button
        onClick={onClose}
        className="text-purple-600 font-medium hover:underline text-sm sm:text-base inline-flex items-center gap-2"
      >
        ← Back to Professionals List
      </button>

      {/* ================= HEADER SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Left Info Card */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold">
              {getInitial(professional.businessName || professional.name)}
            </div>

            {/* Details */}
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {professional.businessName || professional.name}
                </h2>
                <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${getStatusStyle(professional.status)} self-start sm:self-auto uppercase font-bold tracking-wider`}>
                  {professional.status}
                </span>
              </div>

              <p className="text-gray-400 text-[10px] sm:text-xs mt-1 uppercase tracking-widest font-mono">ID: {professional.id}</p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-6 mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm">
                <span>✉ {professional.contact?.email || 'No email provided'}</span>
                <span>📞 {professional.contact?.phone || 'No phone provided'}</span>
                <span>📍 {professional.location?.city}, {professional.location?.state}</span>
              </div>
            </div>
          </div>

          <hr className="my-4 sm:my-6 md:my-8 border-gray-100" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div>
              <p className="text-gray-400">Category</p>
              <p className="text-gray-900 font-semibold mt-1 capitalize">
                {professional.category || professional.service}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Experience</p>
              <p className="text-gray-900 font-semibold mt-1">
                {professional.experience}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Registration Date</p>
              <p className="text-gray-900 font-semibold mt-1">
                {professional.date || new Date(professional.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-400 text-xs sm:text-sm">Biography</p>
            <p className="text-gray-600 text-xs sm:text-sm mt-2 leading-relaxed italic">
              "{professional.bio || 'No bio provided.'}"
            </p>
          </div>

          {professional.specialties && professional.specialties.length > 0 && (
            <div className="mt-6">
              <p className="text-gray-400 text-xs sm:text-sm mb-2">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {professional.specialties.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Card */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm h-fit sticky top-20">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            Verification Actions
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {['pending', 'rejected', 'suspended'].includes(professional.status.toLowerCase()) && (
              <button
                onClick={onApprove}
                disabled={actionLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 sm:py-3 rounded-xl font-bold transition-all text-sm sm:text-base shadow-md hover:shadow-lg transform active:scale-95"
              >
                {actionLoading ? 'Processing...' : '✓ Approve Professional'}
              </button>
            )}

            {professional.status.toLowerCase() !== 'suspended' && professional.status.toLowerCase() !== 'rejected' && (
              <button
                onClick={onSuspend}
                disabled={actionLoading}
                className="w-full bg-red-50 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed text-red-600 py-2.5 sm:py-3 rounded-xl font-bold transition-all text-sm sm:text-base border border-red-200"
              >
                ⚠ Reject / Suspend
              </button>
            )}

            <button
              onClick={onRequestReupload}
              disabled={actionLoading}
              className="w-full border border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
            >
              Request Doc Re-upload
            </button>

            <a
              href="#professional-documents"
              className="block w-full text-center border border-indigo-100 text-indigo-700 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all text-sm sm:text-base mt-2"
            >
              View All KYC Documents
            </a>
          </div>
        </div>
      </div>

      {/* ================= DETAILS GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">

        {/* Personal Details */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personal Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Gender" value={professional.personalDetails?.gender} />
            <DetailItem label="DOB" value={professional.personalDetails?.dob ? new Date(professional.personalDetails.dob).toLocaleDateString() : undefined} />
            <DetailItem label="Languages" value={professional.personalDetails?.languagesKnown?.join(', ')} />
            <DetailItem label="Website" value={professional.workDetails?.socialLinks?.website || professional.contact?.website} isLink />
          </div>
        </div>

        {/* Work & Equipment */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Work Info</h3>
          <div className="space-y-4">
            <DetailItem label="Working Days" value={professional.workDetails?.availableWorkingDays?.join(', ')} />
            <DetailItem label="Working Hours" value={professional.workDetails?.startTime ? `${professional.workDetails.startTime} - ${professional.workDetails.endTime}` : undefined} />
            <DetailItem label="Equipment" value={professional.workDetails?.equipmentDetails} />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Pricing & Bank</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2">
              <DetailItem label="Hourly Rate" value={professional.pricing?.hourlyRate ? `₹${professional.pricing.hourlyRate}/hr` : undefined} />
              <DetailItem label="Min Hours" value={professional.pricing?.minimumHours ? `${professional.pricing.minimumHours} hrs` : undefined} />
            </div>
            <div className="grid grid-cols-2">
              <DetailItem label="Bank Name" value={professional.bankDetails?.bankName} />
              <DetailItem label="IFSC" value={professional.bankDetails?.ifscCode} />
            </div>
            <DetailItem label="Account No" value={professional.bankDetails?.accountNumber} />
          </div>
        </div>

        {/* Location & Contact */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Contact & Areas</h3>
          <div className="space-y-4">
            <DetailItem label="Address" value={professional.location?.address} />
            <DetailItem label="Pincode" value={professional.location?.pincode} />
            <DetailItem label="Service Areas" value={professional.serviceAreas?.join(', ')} />
          </div>
        </div>
      </div>

      {/* ================= DOCUMENTS SECTION ================= */}
      <div
        id="professional-documents"
        className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            KYC Documents & Verification
          </h3>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <p><span className="text-gray-400">Aadhar:</span> <span className="font-mono font-bold text-gray-900">{professional.documents?.aadharNumber || 'N/A'}</span></p>
            <p><span className="text-gray-400">PAN:</span> <span className="font-mono font-bold text-gray-900">{professional.documents?.panNumber || 'N/A'}</span></p>
          </div>
        </div>

        {professional.documents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <DocumentLink label="Aadhar Front" url={professional.documents.aadharFront} />
            <DocumentLink label="Aadhar Back" url={professional.documents.aadharBack} />
            <DocumentLink label="PAN Card" url={professional.documents.panCard} />
            <DocumentLink
              label="Police Verification Certificate (PVC)"
              url={professional.documents.policeVerificationCertificate}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500 bg-gray-50 p-6 rounded-xl text-center">No documents uploaded yet.</p>
        )}
      </div>

      {/* ================= PERFORMANCE METRICS ================= */}
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 border-b pb-2">
          Business Performance
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <MetricItem label="Total Bookings" value={professional.stats?.totalBookings || 0} />
          <MetricItem label="Avg Rating" value={`★ ${professional.stats?.averageRating || '0.0'}`} color="text-amber-500" />
          <MetricItem label="Completed" value={professional.stats?.completedBookings || 0} />
          <MetricItem label="Experience" value={`${professional.experience}`} />
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex flex-col h-full bg-[#EAF0F5]">
        <div className='sticky top-0 bg-[#EAF0F5] z-10 pb-4 pt-6 px-4 sm:px-6'>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
            Professional Details
          </h1>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            Detailed view of registration data and business metrics
          </p>
        </div>
        <div className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 sm:px-6 pb-6'>
          <div className="max-w-7xl mx-auto">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full max-w-6xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
      <div className="p-6">
        {content}
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value?: string | number; isLink?: boolean }> = ({ label, value, isLink }) => (
  <div>
    <p className="text-gray-400 text-xs sm:text-sm">{label}</p>
    {value ? (
      isLink ? (
        <a href={String(value).startsWith('http') ? String(value) : `https://${value}`} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold mt-1 block truncate hover:underline text-xs sm:text-sm">
          {value}
        </a>
      ) : (
        <p className="text-gray-900 font-semibold mt-1 text-xs sm:text-sm">{value}</p>
      )
    ) : (
      <p className="text-gray-400 italic mt-1 text-xs sm:text-sm">Not provided</p>
    )}
  </div>
);

const MetricItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = "text-gray-900" }) => (
  <div>
    <p className="text-gray-400 text-xs sm:text-sm">{label}</p>
    <p className={`text-xl sm:text-2xl font-bold mt-1 sm:mt-2 ${color}`}>
      {value}
    </p>
  </div>
);

const DocumentLink: React.FC<{ label: string; url?: string }> = ({ label, url }) => {
  const valid = !!url && /^https?:\/\//.test(url);
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors">
      <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider">{label}</p>
      {valid ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 hover:text-indigo-700 underline text-sm font-bold flex items-center gap-1"
        >
          Open File ↗
        </a>
      ) : (
        <p className="text-xs text-gray-400 italic">No file uploaded</p>
      )}
    </div>
  );
};

export default ProfessionalDetailsModal;
