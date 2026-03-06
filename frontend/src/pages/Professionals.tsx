import React, { useState, useEffect } from 'react'
import ProfessionalDetailsModal from '../components/Professionals/ProfessionaldetailModal'
import { apiFetch } from '../lib/api';

interface Professional {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  bio: string;
  experience: number;
  specialties: string[];
  status: string;
  createdAt: string;
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
    averageRating: number;
  };
  // UI legacy fields populated by normalization
  name: string;
  service: string;
  city: string;
  date: string;
}

const Professionals: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('All Status')
  const [serviceFilter, setServiceFilter] = useState<string>('All Services')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<boolean>(false)

  // Pagination State for server-side pagination
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalResults, setTotalResults] = useState<number>(0)
  const itemsPerPage = 20

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchProfessionals();
  }, [currentPage, statusFilter, serviceFilter, debouncedSearch]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      queryParams.append('page', currentPage.toString());
      queryParams.append('pageSize', itemsPerPage.toString());

      if (statusFilter !== 'All Status') {
        const status = statusFilter === 'Active' ? 'approved' : statusFilter.toLowerCase();
        queryParams.append('status', status);
      }
      if (serviceFilter !== 'All Services') {
        queryParams.append('category', serviceFilter.toLowerCase());
      }
      if (debouncedSearch) {
        queryParams.append('search', debouncedSearch);
      }

      const { response, payload: data } = await apiFetch(`/api/v1/admin/professionals?${queryParams.toString()}`);
      if (response.ok && data) {
        if (data.success) {
          // Normalize the data if needed
          const normalized = data.data.map((p: any) => ({
            ...p,
            name: p.businessName || 'Unnamed Business',
            service: p.category || 'N/A',
            city: p.location?.city || 'N/A',
            experience: typeof p.experience === 'number' ? `${p.experience} years` : p.experience || 'N/A',
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
          }));
          setProfessionals(normalized);
          setTotalResults(data.pagination?.totalCount || data.pagination?.total || 0);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } else {
        console.error("Failed to fetch professionals");
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string): string => {
    const s = status.toLowerCase();
    if (s === 'active' || s === 'approved') return 'bg-green-100 text-green-600';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-600';
    if (s === 'suspended' || s === 'rejected') return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  }

  const canApproveStatus = (status: string): boolean => {
    const s = status.toLowerCase();
    return s === 'pending' || s === 'rejected' || s === 'suspended';
  }

  // Reset to first page when filters change
  const handleFilterChange = (type: string, value: string): void => {
    if (type === 'status') setStatusFilter(value)
    if (type === 'service') setServiceFilter(value)
    setCurrentPage(1)
  }

  // Debouncing search could be better, but for now simple onChange
  // We can use a separate useEffect for search debouncing if needed.
  // For now, let's just trigger on enter or short delay? 
  // The current effect triggers on every keystroke which might be too many requests.
  // Let's implement a simple delay mechanism or just direct like original code.
  // Original code filtered client-side. Now it is server-side.
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleViewDetails = (professional: Professional): void => {
    setSelectedProfessional(professional)
    setShowDetails(true)
  }

  const handleBackToList = (): void => {
    setShowDetails(false)
    setSelectedProfessional(null)
  }

  // State to track screen size for pagination rendering
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkScreenSize = (): void => {
      setIsMobile(window.innerWidth < 640)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  const handleApprove = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to approve this professional?')) return;

    try {
      setApprovingId(id);
      const { response, payload: errorData } = await apiFetch(`/api/v1/admin/professionals/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        // Refresh list and close details
        fetchProfessionals();
        setShowDetails(false);
        setSelectedProfessional(null);
      } else {
        console.error("Failed to approve professional", errorData);
        alert(`Failed to approve: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error approving professional:", error);
      alert("Error approving professional. Check console for details.");
    } finally {
      setApprovingId(null);
    }
  }

  const rejectProfessional = async (id: string, reason: string, successMessage: string): Promise<void> => {
    try {
      setActionLoading(true);
      const { response, payload: errorData } = await apiFetch(`/api/v1/admin/professionals/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected', reason })
      });

      if (response.ok) {
        alert(successMessage);
        fetchProfessionals();
        setShowDetails(false);
        setSelectedProfessional(null);
      } else {
        alert(`Failed: ${errorData?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating professional status:", error);
      alert("Action failed. Check console for details.");
    } finally {
      setActionLoading(false);
    }
  }

  const handleSuspend = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to suspend this professional?')) return;
    const reason = prompt('Enter suspension reason:', 'Suspended by admin') || 'Suspended by admin';
    await rejectProfessional(id, reason, 'Professional suspended successfully');
  }

  const handleRequestReupload = async (id: string): Promise<void> => {
    const reason = prompt(
      'Enter re-upload reason:',
      'Please re-upload your KYC/documents for verification.',
    );
    if (!reason) return;
    await rejectProfessional(id, reason, 'Document re-upload request sent');
  }

  // If showing details, render only the details view (no header)
  if (showDetails && selectedProfessional) {
    return (
      <div className="min-h-screen bg-[#EAF0F5]">
        <ProfessionalDetailsModal
          isOpen={true}
          onClose={handleBackToList}
          professional={selectedProfessional}
          fullPage={true}
          onApprove={() => handleApprove(selectedProfessional.id)}
          onSuspend={() => handleSuspend(selectedProfessional.id)}
          onRequestReupload={() => handleRequestReupload(selectedProfessional.id)}
          actionLoading={actionLoading}
        />
      </div>
    )
  }

  // Otherwise show the full professionals list with header
  return (
    <div className='flex flex-col h-full bg-[#EAF0F5]'>
      {/* Heading - Sticky */}
      <div className='sticky top-0 bg-[#EAF0F5] z-10 pb-4 pt-6 px-4 sm:px-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
          Professionals
        </h1>
        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
          Manage and monitor all registered professionals on the platform
        </p>
      </div>

      {/* Scrollable Content - with hidden scrollbar */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 sm:px-6 pb-6'>
        {/* Filters */}
        <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between'>
            <input
              type='text'
              placeholder='Search by name or ID...'
              value={search}
              onChange={handleSearchChange}
              className='w-full lg:w-1/3 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base'
            />

            <div className='flex flex-col sm:flex-row gap-4 w-full lg:w-auto'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handleFilterChange('status', 'Pending')}
                  className={`px-3 py-2 rounded-xl text-sm border transition ${statusFilter === 'Pending'
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleFilterChange('status', 'All Status')}
                  className={`px-3 py-2 rounded-xl text-sm border transition ${statusFilter === 'All Status'
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  All
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={e => handleFilterChange('status', e.target.value)}
                className='w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base bg-white'
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>

              <select
                value={serviceFilter}
                onChange={e => handleFilterChange('service', e.target.value)}
                className='w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base bg-white'
              >
                <option>All Services</option>
                <option value="photographer">Photographer</option>
                <option value="videographer">Videographer</option>
                <option value="cinematographer">Cinematographer</option>
                <option value="editor">Editor</option>
                <option value="dj">DJ</option>
                <option value="musician">Musician</option>
                <option value="anchor">Anchor</option>
                <option value="live_wedding_planner">Wedding Planner</option>
                <option value="makeup_artist">Makeup Artist</option>
                <option value="caterer">Caterer</option>
                <option value="band">Band</option>
                <option value="other">Other</option>
              </select>
            </div>

            <p className='text-sm sm:text-base text-gray-500 font-medium'>
              Showing {totalResults} professionals
            </p>
          </div>
        </div>

        {/* Table with Internal Scrolling - all scrollbars hidden */}
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200'>
          {/* Fixed Header - stays at top when scrolling internally */}
          <div className='overflow-x-auto scrollbar-hide'>
            <div className='min-w-[800px] lg:min-w-full'>
              {/* Header Row - Fixed */}
              <div className='bg-gray-50 text-gray-500 text-sm font-medium grid grid-cols-8 gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 rounded-t-xl sm:rounded-t-2xl'>
                <div className='col-span-1'>Profile ID</div>
                <div className='col-span-1'>Name</div>
                <div className='col-span-1'>Service Type</div>
                <div className='col-span-1'>City</div>
                <div className='col-span-1'>Experience</div>
                <div className='col-span-1'>Status</div>
                <div className='col-span-1'>Approval Date</div>
                <div className='col-span-1'>Actions</div>
              </div>

              {/* Scrollable Body - max height with internal scroll, scrollbar hidden */}
              <div className='max-h-[400px] overflow-y-auto scrollbar-hide'>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  professionals.map(pro => (
                    <div
                      key={pro.id}
                      onClick={() => handleViewDetails(pro)}
                      className='grid grid-cols-8 gap-4 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 hover:bg-gray-50 transition text-gray-700 text-sm cursor-pointer'
                    >
                      <div className='col-span-1 truncate' title={pro.id}>{pro.id.substring(0, 8)}...</div>

                      <div className='col-span-1'>
                        <div className='flex items-center gap-2 sm:gap-3'>
                          <div className='w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm'>
                            {pro.name.charAt(0)}
                          </div>
                          <span className='truncate max-w-[100px] sm:max-w-none' title={pro.name}>
                            {pro.name}
                          </span>
                        </div>
                      </div>

                      <div className='col-span-1 capitalize'>{pro.category?.replace(/_/g, ' ') || pro.service}</div>
                      <div className='col-span-1 capitalize'>{pro.city}</div>
                      <div className='col-span-1'>{pro.experience}</div>

                      <div className='col-span-1'>
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                            pro.status
                          )}`}
                        >
                          {pro.status}
                        </span>
                      </div>

                      <div className='col-span-1'>{pro.date}</div>

                      <div className='col-span-1'>
                        <div className='flex items-center gap-3'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(pro);
                            }}
                            className='text-indigo-600 font-medium hover:underline text-sm'
                          >
                            View
                          </button>
                          {canApproveStatus(pro.status) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(pro.id);
                              }}
                              disabled={approvingId === pro.id}
                              className='text-green-700 font-medium hover:underline text-sm disabled:opacity-60 disabled:cursor-not-allowed'
                            >
                              {approvingId === pro.id ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* No results message */}
                {(!loading && professionals.length === 0) && (
                  <div className='text-center py-8 sm:py-12 text-gray-500'>
                    No professionals found matching your filters.
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

export default Professionals
