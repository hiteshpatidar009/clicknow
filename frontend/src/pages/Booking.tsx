import { useState, useEffect } from 'react'
import BookingDetailsPane from '../components/BookingDetailsPane';
import { apiFetch, getPaginationTotal } from '../lib/api';

interface Booking {
  id: string;
  customer: string;
  services: string[];
  date: string;
  city: string;
  professional: string;
  status: string;
  payment: string;
  amount: string;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [paymentFilter, setPaymentFilter] = useState('All Payments')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const itemsPerPage = 15

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, paymentFilter, search]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      queryParams.append('page', currentPage.toString());
      queryParams.append('pageSize', itemsPerPage.toString());

      if (statusFilter !== 'All Status') {
        // Backend expects lowercase: confirmed, pending, completed, cancelled, rejected
        queryParams.append('status', statusFilter.toLowerCase());
      }

      if (paymentFilter !== 'All Payments') {
        // Backend modified to accept 'Pending', 'Paid', 'Refunded'
        queryParams.append('paymentStatus', paymentFilter);
      }

      // Backend admin/bookings doesn't support complex search yet (only by ID maybe? or not implemented in controller)
      // Controller calls getAllBookings which supports filters but not 'search' text specifically for names.
      // Filter by ID is supported if implemented.
      // Let's assume standard 'search' param might be ignored or implemented later.
      if (search) {
        // queryParams.append('search', search); 
      }

      const { response, payload: data } = await apiFetch(`/api/v1/admin/bookings?${queryParams.toString()}`);
      if (response.ok && data) {
        if (data.success) {
          const mappedBookings = data.data.map((b: any) => ({
            id: b.id,
            customer: b.clientName || 'Unknown',
            services: [b.eventType || 'Event'], // bookings usually allow 1 event type or multiple services? Schema says eventType.
            date: b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'N/A',
            city: b.location?.city || 'N/A',
            professional: b.professionalName || 'Unknown',
            status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
            payment: b.pricing?.paymentStatus ? b.pricing.paymentStatus.charAt(0).toUpperCase() + b.pricing.paymentStatus.slice(1) : 'Pending',
            amount: `₹${b.pricing?.totalAmount?.toLocaleString() || 0}`
          }));
          setBookings(mappedBookings);
          setTotalResults(getPaginationTotal(data.pagination));
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } else {
        console.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };


  const statusStyle = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'confirmed': return 'bg-green-100 text-green-600'
      case 'in progress':
      case 'processing': return 'bg-indigo-100 text-indigo-600'
      case 'pending': return 'bg-orange-100 text-orange-600'
      case 'completed': return 'bg-blue-100 text-blue-600'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100'
    }
  }

  const paymentStyle = (p: string) => {
    const s = p.toLowerCase();
    switch (s) {
      case 'paid': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'refunded': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100'
    }
  }

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 640)
    resize(); window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <div className='flex flex-col h-full bg-[#EAF0F5]'>

      {/* Header */}
      <div className='sticky top-0 bg-[#EAF0F5] z-10 pb-4 pt-6 px-4 sm:px-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>Bookings</h1>
        <p className='text-xs sm:text-sm text-gray-500 mt-1'>Manage and monitor all platform bookings</p>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 pb-6'>

        {/* Filters */}
        <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between'>

            <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search bookings (ID)...' className='w-full lg:w-1/3 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-300 outline-none' />

            <div className='flex flex-col sm:flex-row gap-4 w-full lg:w-auto'>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className='px-4 py-2 rounded-xl border border-gray-200 bg-white'>
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
                <option>Rejected</option>
              </select>

              <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className='px-4 py-2 rounded-xl border border-gray-200 bg-white'>
                <option>All Payments</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Refunded</option>
              </select>
            </div>

            <p className='text-sm text-gray-500 font-medium'>Showing {totalResults} bookings</p>
          </div>
        </div>

        {/* Table with Horizontal Scroll */}
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto scrollbar-hide'>
            <div className='min-w-[1500px]'>
              {/* Header Row - Fixed with 11 columns */}
              <div className='bg-gray-50 text-gray-500 text-sm font-medium grid grid-cols-11 gap-2 px-6 py-4 border-b border-gray-200'>
                <div className='col-span-1 whitespace-nowrap font-semibold'>BOOKING ID</div>
                <div className='col-span-1 whitespace-nowrap font-semibold'>CUSTOMER</div>
                <div className='col-span-2 whitespace-nowrap font-semibold'>SERVICES</div>
                <div className='col-span-1 whitespace-nowrap font-semibold'>EVENT DATE</div>
                <div className='col-span-1 whitespace-nowrap font-semibold'>CITY</div>
                <div className='col-span-1 whitespace-nowrap font-semibold'>PROFESSIONAL</div>
                <div className='col-span-1 whitespace-nowrap font-semibold'>STATUS</div>
                <div className='col-span-1 whitespace-nowrap font-semibold'>PAYMENT</div>
                <div className='col-span-1 whitespace-nowrap font-semibold'>AMOUNT</div>
                <div className='col-span-1 whitespace-nowrap font-semibold'>ACTIONS</div>
              </div>

              {/* Body - with 11 columns */}
              <div className='max-h-[420px] overflow-y-auto scrollbar-hide'>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  bookings.map(b => (
                    <div key={b.id} className='grid grid-cols-11 gap-2 px-6 py-4 border-t border-gray-200 hover:bg-gray-50 transition text-sm'>

                      <div className='col-span-1 whitespace-nowrap font-medium' title={b.id}>{b.id.substring(0, 8)}...</div>
                      <div className='col-span-1 whitespace-nowrap truncate' title={b.customer}>{b.customer}</div>

                      <div className='col-span-2 flex flex-wrap gap-1'>
                        {b.services.map((s, i) => (
                          <span key={i} className='px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 whitespace-nowrap'>{s}</span>
                        ))}
                      </div>

                      <div className='col-span-1 whitespace-nowrap'>{b.date}</div>
                      <div className='col-span-1 whitespace-nowrap capitalizing'>{b.city}</div>
                      <div className='col-span-1 whitespace-nowrap truncate' title={b.professional}>{b.professional}</div>

                      <div className='col-span-1 whitespace-nowrap'>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap ${statusStyle(b.status)}`}>{b.status}</span>
                      </div>

                      <div className='col-span-1 whitespace-nowrap'>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap ${paymentStyle(b.payment)}`}>{b.payment}</span>
                      </div>

                      <div className='col-span-1 font-semibold whitespace-nowrap'>{b.amount}</div>

                      <div className='col-span-1 whitespace-nowrap'>
                        <button
                          onClick={() => setSelectedBookingId(b.id)}
                          className='text-indigo-600 font-medium hover:underline whitespace-nowrap'
                        >
                          View
                        </button>
                      </div>

                    </div>
                  ))
                )}

                {(!loading && bookings.length === 0) && (
                  <div className='text-center py-8 text-gray-500'>
                    No bookings found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */
          /* Only show if pages > 1 */
          totalPages > 1 && (
            <div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
              <p className='text-sm text-gray-500'>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults}</p>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className='px-4 py-2 border rounded-lg bg-white disabled:opacity-50'
                >
                  Prev
                </button>

                <div className='flex gap-1'>
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1
                    if (isMobile && !(p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))) return null
                    return (
                      <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-sm ${currentPage === p ? 'bg-indigo-600 text-white' : 'border bg-white'}`}>{p}</button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className='px-4 py-2 border rounded-lg bg-white disabled:opacity-50'
                >
                  Next
                </button>
              </div>
            </div>
          )}

      </div>

      {/* Booking Details Pane */}
      {selectedBookingId && (
        <BookingDetailsPane
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onUpdate={fetchBookings}
        />
      )}

      <style>{`
        .scrollbar-hide{scrollbar-width:none;-ms-overflow-style:none}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        *{scrollbar-width:none}
        *::-webkit-scrollbar{display:none}
        @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>

    </div>
  )
}

export default Bookings
