import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { apiFetch } from '../lib/api';

// Interface for backend Enquiry
interface Enquiry {
  id: string;
  clientId: string;
  professionalId: string;
  eventType: string;
  eventDate: string;
  location: { city: string };
  budget: { min: number, max: number };
  message: string;
  status: string;
  createdAt: string;
  clientName?: string;
  professionalName?: string;
  professional?: string; // from my enrich logic I used professionalName but checking response
}

const Support = () => {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All Tickets')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    try {
      // Fetch all enquiries (admin route)
      const { payload: data } = await apiFetch('/api/v1/admin/enquiries');

      if (data.success) {
        // Map enquiries to "Tickets" format
        const mappedTickets = data.data.map((enq: Enquiry) => ({
          id: enq.id,
          booking: 'ENQ-' + enq.id.substring(0, 6).toUpperCase(), // Mock booking ID
          customer: enq.clientName || 'Unknown',
          professional: enq.professionalName || 'Unknown',
          issue: enq.eventType + ' Enquiry', // e.g. "Wedding Enquiry"
          priority: 'Medium', // Mock priority
          status: mapStatus(enq.status),
          created: new Date(enq.createdAt).toLocaleDateString(),
          messages: 1, // Mock message count
          fullMessage: enq.message // Store full message for view
        }));
        setTickets(mappedTickets);
      }
    } catch (error) {
      console.error("Failed to fetch enquiries", error);
      // Keep static data if fetch fails? Or empty?
      // Let's keep empty array or show error?
      // I'll show empty.
    } finally {
      setLoading(false);
    }
  }

  const mapStatus = (status: string) => {
    // Backend status: pending, responded, closed, converted
    // Frontend status: Open, Resolved, Escalated
    switch (status) {
      case 'pending': return 'Open';
      case 'responded': return 'Resolved'; // technically just responded
      case 'closed': return 'Resolved';
      case 'converted': return 'Resolved';
      default: return 'Open';
    }
  }

  // Filter tickets based on status
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus =
      statusFilter === 'All Tickets' || ticket.status === statusFilter
    return matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTickets = filteredTickets.slice(startIndex, endIndex)

  // Stats calculation
  const openTickets = tickets.filter(t => t.status === 'Open').length
  const escalatedTickets = tickets.filter(t => t.status === 'Escalated').length
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-600'
      case 'High':
        return 'bg-yellow-100 text-yellow-600'
      case 'Medium':
        return 'bg-blue-100 text-blue-600'
      case 'Low':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-600'
      case 'Resolved':
        return 'bg-green-100 text-green-600'
      case 'Escalated':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Reset to first page when filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className='flex flex-col h-full bg-[#EAF0F5]'>
      {/* Sticky Heading */}
      <div className='sticky top-0 bg-[#EAF0F5] z-10 pb-4 pt-6 px-4 sm:px-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
          Support & Enquiries
        </h1>
        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
          Manage and monitor all customer enquiries and support tickets
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        /* Scrollable Content */
        <div className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 sm:px-6 pb-6'>
          {/* Stats Cards */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6'>
            {/* Open */}
            <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='text-xs sm:text-sm text-gray-500'>Open Enquiries</p>
                  <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-2'>
                    {openTickets}
                  </h2>
                </div>
                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 flex items-center justify-center'>
                  <MessageCircle
                    size={16}
                    className='text-yellow-600 sm:w-5 sm:h-5'
                  />
                </div>
              </div>
            </div>

            {/* Escalated */}
            <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='text-xs sm:text-sm text-gray-500'>Escalated</p>
                  <h2 className='text-xl sm:text-2xl font-bold text-red-600 mt-1 sm:mt-2'>
                    {escalatedTickets}
                  </h2>
                </div>
                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center'>
                  <MessageCircle
                    size={16}
                    className='text-red-600 sm:w-5 sm:h-5'
                  />
                </div>
              </div>
            </div>

            {/* Resolved */}
            <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='text-xs sm:text-sm text-gray-500'>Resolved</p>
                  <h2 className='text-xl sm:text-2xl font-bold text-green-600 mt-1 sm:mt-2'>
                    {resolvedTickets}
                  </h2>
                </div>
                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center'>
                  <MessageCircle
                    size={16}
                    className='text-green-600 sm:w-5 sm:h-5'
                  />
                </div>
              </div>
            </div>

            {/* Total */}
            <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='text-xs sm:text-sm text-gray-500'>
                    Total Enquiries
                  </p>
                  <h2 className='text-xl sm:text-2xl font-bold text-purple-600 mt-1 sm:mt-2'>
                    {tickets.length}
                  </h2>
                </div>
                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center'>
                  <MessageCircle
                    size={16}
                    className='text-purple-600 sm:w-5 sm:h-5'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Card */}
          <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6'>
            <div className='flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between'>
              <select
                value={statusFilter}
                onChange={handleFilterChange}
                className='w-full sm:w-64 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base bg-white text-gray-700'
              >
                <option>All Tickets</option>
                <option>Open</option>
                <option>Resolved</option>
                <option>Escalated</option>
              </select>

              <p className='text-sm sm:text-base text-gray-500 font-medium'>
                Showing {filteredTickets.length} enquiries
              </p>
            </div>
          </div>

          {/* Table Card */}
          <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200'>
            <div className='overflow-x-auto scrollbar-hide'>
              <div className='min-w-[1200px] lg:min-w-full'>
                {/* Header */}
                <div className='grid grid-cols-10 gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 text-gray-500 text-xs sm:text-sm font-medium border-b border-gray-200 rounded-t-xl sm:rounded-t-2xl'>
                  <div className='col-span-1'>Enquiry ID</div>
                  <div className='col-span-1'>Ref ID</div>
                  <div className='col-span-1'>Customer</div>
                  <div className='col-span-1'>Professional</div>
                  <div className='col-span-1'>Type</div>
                  <div className='col-span-1'>Priority</div>
                  <div className='col-span-1'>Status</div>
                  <div className='col-span-1'>Created</div>
                  <div className='col-span-1'>Messages</div>
                  <div className='col-span-1'>Actions</div>
                </div>

                {/* Rows */}
                <div className='max-h-[400px] overflow-y-auto scrollbar-hide'>
                  {currentTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className='grid grid-cols-10 gap-4 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 hover:bg-gray-50 transition text-gray-700 text-xs sm:text-sm'
                    >
                      <div className='col-span-1 font-medium truncate'>{ticket.id}</div>
                      <div className='col-span-1 truncate'>{ticket.booking}</div>
                      <div className='col-span-1 truncate'>{ticket.customer}</div>
                      <div className='col-span-1 truncate'>
                        {ticket.professional}
                      </div>
                      <div className='col-span-1 truncate'>{ticket.issue}</div>

                      {/* Priority Badge */}
                      <div className='col-span-1'>
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getPriorityStyle(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className='col-span-1'>
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <div className='col-span-1'>{ticket.created}</div>
                      <div className='col-span-1'>
                        <span className='px-2 py-1 bg-gray-100 rounded-full text-xs'>
                          {ticket.messages}
                        </span>
                      </div>

                      <div className='col-span-1'>
                        <button className='text-indigo-600 font-medium hover:underline text-xs sm:text-sm'>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* No results message */}
                  {currentTickets.length === 0 && (
                    <div className='text-center py-8 sm:py-12 text-gray-500'>
                      No enquiries found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination (Simplified) */}
          {totalPages > 1 && (
            <div className='mt-6 flex justify-center gap-4'>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="self-center">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hide scrollbars globally */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  )
}

export default Support
