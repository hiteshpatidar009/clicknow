import React from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookings: number;
  spent: string;
  status: string;
  joinedDate?: string; // Optional since we'll add it dynamically
}

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  fullPage?: boolean;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  customer,
  fullPage = false
}) => {
  if (!isOpen || !customer) return null;

  const getInitial = (name: string): string => {
    return name.charAt(0);
  };

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-600'
      case 'Flagged':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  };

  // Format joined date (you can modify this logic as needed)
  const formatJoinedDate = (): string => {
    // This is a sample - you can replace with actual date logic
    return 'Joined Jan 2024';
  };

  const content = (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Back Button */}
      <button
        onClick={onClose}
        className="text-purple-600 font-medium hover:underline text-sm sm:text-base inline-flex items-center gap-2"
      >
        ← Back to Customers List
      </button>

      {/* ================= HEADER SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Left Info Card */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold">
              {getInitial(customer.name)}
            </div>

            {/* Details */}
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {customer.name}
                </h2>
                <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${getStatusStyle(customer.status)} self-start sm:self-auto`}>
                  {customer.status}
                </span>
              </div>

              <p className="text-gray-400 text-xs sm:text-sm mt-1">{customer.id}</p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-6 mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm">
                <span>✉ {customer.email}</span>
                <span>📞 {customer.phone}</span>
                <span>📅 {formatJoinedDate()}</span>
              </div>
            </div>
          </div>

          <hr className="my-4 sm:my-6 md:my-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div>
              <p className="text-gray-400">Total Bookings</p>
              <p className="text-gray-900 font-medium mt-1">
                {customer.bookings}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Total Spent</p>
              <p className="text-gray-900 font-medium mt-1">
                {customer.spent}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Actions
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base">
              Block Customer
            </button>

            <button className="w-full border border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm sm:text-base">
              ⚠ Flag Account
            </button>
          </div>
        </div>
      </div>

      {/* ================= BOOKING HISTORY ================= */}
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
          Booking History
        </h3>

        <div className="space-y-3 sm:space-y-4">
          {/* Booking Item 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-sm transition-all gap-3 sm:gap-4">
            <div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">
                BK001 - Wedding Photography
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                2024-03-15 • Photography, Videography
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2 sm:px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full mb-1 sm:mb-2">
                Completed
              </span>
              <p className="text-gray-900 font-medium text-sm sm:text-base">₹45,000</p>
            </div>
          </div>

          {/* Booking Item 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-sm transition-all gap-3 sm:gap-4">
            <div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">
                BK006 - Birthday Party
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                2024-04-10 • Catering, Decoration
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2 sm:px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full mb-1 sm:mb-2">
                Completed
              </span>
              <p className="text-gray-900 font-medium text-sm sm:text-base">₹85,000</p>
            </div>
          </div>

          {/* Booking Item 3 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-sm transition-all gap-3 sm:gap-4">
            <div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">
                BK012 - Corporate Event
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                2024-02-28 • DJ & Entertainment
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2 sm:px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full mb-1 sm:mb-2">
                Completed
              </span>
              <p className="text-gray-900 font-medium text-sm sm:text-base">₹35,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex flex-col h-full bg-[#EAF0F5]">
        {/* Sticky Heading */}
        <div className='sticky top-0 bg-[#EAF0F5] z-10 pb-4 pt-6 px-4 sm:px-6'>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
            Customers
          </h1>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            View and manage all registered customers on the platform
          </p>
        </div>

        {/* Scrollable Content */}
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
      {content}
    </div>
  );
};

export default CustomerDetailModal;