import { useState, useEffect } from "react"
import { DollarSign, TrendingUp } from "lucide-react"
import { apiFetch, getPaginationTotal } from "../lib/api";

const Payments = () => {
  const [tab, setTab] = useState("customer")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [customerPayments, setCustomerPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)

  // Fetch customer payments (bookings)
  useEffect(() => {
    if (tab === 'customer') {
      fetchPayments();
    }
  }, [tab, currentPage]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('pageSize', itemsPerPage.toString());

      // We want all bookings that have payment info, or just all bookings?
      // Let's fetch all and show their payment status.

      const { response, payload: data } = await apiFetch(`/api/v1/admin/bookings?${queryParams.toString()}`);
      if (response.ok && data) {
        if (data.success) {
          const mapped = data.data.map((b: any) => ({
            paymentId: `PAY-${b.id.substring(0, 6).toUpperCase()}`,
            bookingId: b.id.substring(0, 8),
            customer: b.clientName || 'Unknown',
            amount: `₹${b.pricing?.totalAmount?.toLocaleString() || 0}`,
            method: b.pricing?.type === 'package' ? 'Package' : 'Hourly', // Approximation
            status: b.pricing?.paymentStatus ? b.pricing.paymentStatus.charAt(0).toUpperCase() + b.pricing.paymentStatus.slice(1) : 'Pending',
            date: b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'N/A',
            transactionId: b.pricing?.transactionId || 'N/A'
          }));
          setCustomerPayments(mapped);
          setTotalResults(getPaginationTotal(data.pagination));
        }
      }
    } catch (error) {
      console.error("Error fetching payments", error);
    } finally {
      setLoading(false);
    }
  }

  // Professional Payouts - Static for now as no backend endpoint exists
  const professionalPayouts = [
    {
      payoutId: "PO001",
      professional: "Rajesh Kumar",
      earnings: "₹245,000",
      commission: "15%",
      netPayout: "₹208,250",
      period: "January 2024",
      status: "Released"
    },
    // ... items ...
  ]

  const totalPages = Math.ceil((tab === 'customer' ? totalResults : professionalPayouts.length) / itemsPerPage)

  // For static data pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = tab === 'customer' ? customerPayments : professionalPayouts.slice(startIndex, endIndex)

  /* -------------------- STATUS STYLES -------------------- */
  const statusStyle = (status: string) => {
    switch (status) {
      case "Completed": case "Paid": return "bg-green-100 text-green-600"
      case "Released": return "bg-green-100 text-green-600"
      case "Pending": return "bg-yellow-100 text-yellow-600"
      case "Processing": return "bg-orange-100 text-orange-600"
      case "Failed": return "bg-red-100 text-red-600"
      case "Refunded": return "bg-purple-100 text-purple-600"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  /* -------------------- RESPONSIVE -------------------- */
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Reset to first page when tab changes
  const handleTabChange = (newTab: string) => {
    setTab(newTab)
    setCurrentPage(1)
  }

  return (
    <div className='flex flex-col h-full bg-[#EAF0F5]'>
      {/* Sticky Heading */}
      <div className='sticky top-0 bg-[#EAF0F5] z-10 pb-4 pt-6 px-4 sm:px-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
          Payments & Payouts
        </h1>
        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
          Manage transactions and payouts
        </p>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-4 sm:px-6 pb-6'>
        {/* ================= TOP STATS (UNCHANGED) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-semibold text-gray-800">₹3.45M</p>
              <p className="text-sm text-green-600 mt-1">+18% this month</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Pending Payouts</p>
              <p className="text-3xl font-semibold text-gray-800">₹892K</p>
              <p className="text-sm text-yellow-600 mt-1">4 pending</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Commission Earned</p>
              <p className="text-3xl font-semibold text-gray-800">₹518K</p>
              <p className="text-sm text-purple-600 mt-1">15% avg rate</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <DollarSign className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-8 border-b border-gray-300 mb-6">
          <button
            onClick={() => handleTabChange('customer')}
            className={`pb-3 text-sm font-medium ${tab === 'customer'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500'
              }`}
          >
            Customer Payments
          </button>

          <button
            onClick={() => handleTabChange('professional')}
            className={`pb-3 text-sm font-medium ${tab === 'professional'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500'
              }`}
          >
            Professional Payouts
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="flex-1 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="min-w-[1200px]">

              {/* Header */}
              {tab === "customer" ? (
                <div className="bg-gray-50 text-gray-500 text-sm font-medium grid grid-cols-8 gap-4 px-6 py-4 border-b border-gray-200">
                  <div>PAYMENT ID</div>
                  <div>BOOKING ID</div>
                  <div>CUSTOMER</div>
                  <div>AMOUNT</div>
                  <div>TYPE</div>
                  <div>STATUS</div>
                  <div>DATE</div>
                  <div>TRANSACTION ID</div>
                </div>
              ) : (
                <div className="bg-gray-50 text-gray-500 text-sm font-medium grid grid-cols-8 gap-4 px-6 py-4 border-b border-gray-200">
                  <div>PAYOUT ID</div>
                  <div>PROFESSIONAL</div>
                  <div>EARNINGS</div>
                  <div>COMMISSION</div>
                  <div>NET PAYOUT</div>
                  <div>PERIOD</div>
                  <div>STATUS</div>
                  <div>ACTIONS</div>
                </div>
              )}

              {/* Body */}
              <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
                {loading && tab === 'customer' ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <>
                    {tab === "customer" && currentData.map((p: any) => (
                      <div key={p.paymentId} className="grid grid-cols-8 gap-4 px-6 py-4 border-t border-gray-200 hover:bg-gray-50 transition text-sm">
                        <div className="truncate" title={p.paymentId}>{p.paymentId}</div>
                        <div>{p.bookingId}...</div>
                        <div className="truncate" title={p.customer}>{p.customer}</div>
                        <div className="font-semibold">{p.amount}</div>
                        <div>{p.method}</div>
                        <div>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle(p.status)}`}>
                            {p.status}
                          </span>
                        </div>
                        <div>{p.date}</div>
                        <div className="text-xs text-gray-600 truncate" title={p.transactionId}>{p.transactionId}</div>
                      </div>
                    ))}

                    {tab === "customer" && currentData.length === 0 && !loading && (
                      <div className='text-center py-8 text-gray-500'>No payments found.</div>
                    )}

                    {tab === "professional" && currentData.map((p: any) => (
                      <div key={p.payoutId} className="grid grid-cols-8 gap-4 px-6 py-4 border-t border-gray-200 hover:bg-gray-50 transition text-sm">
                        <div>{p.payoutId}</div>
                        <div>{p.professional}</div>
                        <div>{p.earnings}</div>
                        <div>{p.commission}</div>
                        <div className="font-semibold">{p.netPayout}</div>
                        <div>{p.period}</div>
                        <div>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle(p.status)}`}>
                            {p.status}
                          </span>
                        </div>
                        <div>
                          {p.status === "Pending" && (
                            <button className="px-4 py-1 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700">
                              Release Payment
                            </button>
                          )}
                          {p.status !== "Pending" && <span className="text-gray-400 text-xs">—</span>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <p className='text-xs sm:text-sm text-gray-500'>
              Showing {startIndex + 1} to{' '}
              {Math.min(endIndex, tab === 'customer' ? totalResults : professionalPayouts.length)} of{' '}
              {tab === 'customer' ? totalResults : professionalPayouts.length} results
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

export default Payments
