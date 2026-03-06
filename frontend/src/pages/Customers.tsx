import { useState, useEffect } from 'react'
import CustomerDetailModal from '../components/Customers/CustomerDetailModal'
import { apiFetch, getPaginationTotal } from '../lib/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookings: number | string;
  spent: string;
  status: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const itemsPerPage = 20

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, statusFilter, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      queryParams.append('role', 'client');
      queryParams.append('page', currentPage.toString());
      queryParams.append('pageSize', itemsPerPage.toString());

      if (statusFilter !== 'All Status') {
        queryParams.append('status', statusFilter === 'Active' ? 'active' : 'inactive');
      }

      if (search) {
        queryParams.append('search', search);
      }

      const { response, payload: data } = await apiFetch(`/api/v1/admin/users?${queryParams.toString()}`);
      if (response.ok && data) {
        // Backend returns: { success: true, data: [...], pagination: { ... } }
        if (data.success) {
          const mappedCustomers = data.data.map((user: any) => ({
            id: user.id || '',
            name: user.displayName || `${user.firstName} ${user.lastName}`.trim() || 'Unknown',
            email: user.email || '',
            phone: user.phone || 'N/A',
            bookings: 'N/A', // Stats not yet available in user model
            spent: 'N/A', // Stats not yet available
            status: user.isActive ? 'Active' : 'Flagged' // Or Inactive
          }));
          setCustomers(mappedCustomers);
          setTotalResults(getPaginationTotal(data.pagination));
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } else {
        console.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-600'
      case 'Flagged':
      case 'Inactive':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Reset to first page when filters change
  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  // State to track screen size for pagination rendering
  const [isMobile, setIsMobile] = useState(false)

  const handleOpenModal = (customer: any) => {
    setSelectedCustomer(customer)
    setShowDetails(true)
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden'
  }

  const handleCloseModal = () => {
    setShowDetails(false)
    setSelectedCustomer(null)
    // Restore body scrolling
    document.body.style.overflow = 'unset'
  }

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
      // Cleanup: restore body overflow when component unmounts
      document.body.style.overflow = 'unset'
    }
  }, [])

  // If showing details, render only the details view (no header)
  if (showDetails && selectedCustomer) {
    return (
      <div className="min-h-screen bg-[#EAF0F5]">
        <CustomerDetailModal
          isOpen={true}
          onClose={handleCloseModal}
          customer={selectedCustomer}
          fullPage={true}
        />
      </div>
    )
  }

  // Otherwise show the full customers list with header
  return (
    <div className='flex flex-col h-full bg-[#EAF0F5]'>
      {/* Sticky Heading */}
      <div className='sticky top-0 bg-[#EAF0F5] z-10 pb-4 pt-6 px-4 sm:px-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
          Customers
        </h1>
        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
          View and manage all registered customers on the platform
        </p>
      </div>

      {/* Scrollable Content - with hidden scrollbar */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 sm:px-6 pb-6'>
        {/* Filters */}
        <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between'>
            <input
              type='text'
              placeholder='Search by name, ID or email...'
              value={search}
              onChange={handleSearchChange}
              className='w-full lg:w-1/3 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base'
            />

            <div className='flex flex-col sm:flex-row gap-4 w-full lg:w-auto'>
              <select
                value={statusFilter}
                onChange={e => handleFilterChange(e.target.value)}
                className='w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base bg-white'
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Flagged</option>
              </select>
            </div>

            <p className='text-sm sm:text-base text-gray-500 font-medium'>
              Showing {totalResults} customers
            </p>
          </div>
        </div>

        {/* Table with Internal Scrolling - all scrollbars hidden */}
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200'>
          {/* Fixed Header - stays at top when scrolling internally */}
          <div className='overflow-x-auto scrollbar-hide'>
            <div className='min-w-[1000px] lg:min-w-full'>
              {/* Header Row - Fixed */}
              <div className='bg-gray-50 text-gray-500 text-sm font-medium grid grid-cols-8 gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 rounded-t-xl sm:rounded-t-2xl'>
                <div className='col-span-1'>Customer ID</div>
                <div className='col-span-1'>Name</div>
                <div className='col-span-1'>Email</div>
                <div className='col-span-1'>Phone</div>
                <div className='col-span-1'>Total Bookings</div>
                <div className='col-span-1'>Total Spent</div>
                <div className='col-span-1'>Status</div>
                <div className='col-span-1'>Actions</div>
              </div>

              {/* Scrollable Body - max height with internal scroll, scrollbar hidden */}
              <div className='max-h-[400px] overflow-y-auto scrollbar-hide'>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  customers.map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => handleOpenModal(customer)}
                      className='grid grid-cols-8 gap-4 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 hover:bg-gray-50 transition text-gray-700 text-sm cursor-pointer'
                    >
                      <div className='col-span-1 truncate' title={customer.id}>{customer.id.substring(0, 8)}...</div>

                      <div className='col-span-1'>
                        <div className='flex items-center gap-2 sm:gap-3'>
                          <div className='w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm'>
                            {customer.name.charAt(0)}
                          </div>
                          <span className='truncate max-w-[100px] sm:max-w-none' title={customer.name}>
                            {customer.name}
                          </span>
                        </div>
                      </div>

                      <div className='col-span-1 truncate' title={customer.email}>{customer.email}</div>
                      <div className='col-span-1'>{customer.phone}</div>
                      <div className='col-span-1'>{customer.bookings}</div>
                      <div className='col-span-1'>{customer.spent}</div>

                      <div className='col-span-1'>
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                            customer.status
                          )}`}
                        >
                          {customer.status}
                        </span>
                      </div>

                      <div className='col-span-1'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(customer);
                          }}
                          className='text-indigo-600 font-medium hover:underline text-sm'
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* No results message */}
                {(!loading && customers.length === 0) && (
                  <div className='text-center py-8 sm:py-12 text-gray-500'>
                    No customers found matching your filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */
          /* Show if pages > 1 */
          totalPages > 1 && (
            <div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
              <p className='text-xs sm:text-sm text-gray-500'>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalResults)} of{' '}
                {totalResults} results
              </p>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition'
                >
                  Previous
                </button>

                <div className='flex items-center gap-1'>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1

                    if (isMobile) {
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`w-7 h-7 text-xs rounded-lg transition ${currentPage === pageNumber
                                ? 'bg-indigo-600 text-white'
                                : 'border border-gray-200 bg-white hover:bg-gray-50'
                              }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <span key={pageNumber} className='text-gray-500 px-1'>
                            ...
                          </span>
                        )
                      }
                      return null
                    } else {
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 2 &&
                          pageNumber <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-lg transition ${currentPage === pageNumber
                                ? 'bg-indigo-600 text-white'
                                : 'border border-gray-200 bg-white hover:bg-gray-50'
                              }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      } else if (
                        pageNumber === currentPage - 3 ||
                        pageNumber === currentPage + 3
                      ) {
                        return (
                          <span key={pageNumber} className='text-gray-500 px-1'>
                            ...
                          </span>
                        )
                      }
                      return null
                    }
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className='px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition'
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Hide scrollbars globally - updated to hide ALL scrollbars */}
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
        
        /* Hide all scrollbars in the entire component */
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  )
}

export default Customers
