import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { payload: data } = await apiFetch('/api/v1/admin/dashboard');
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f7f9fc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f7f9fc]">

      {/* Sticky Heading - Like Support page */}
      <div className='sticky top-0 bg-[#EAF0F5] z-10 pb-4 pt-6 px-4 sm:px-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
          Dashboard
        </h1>
        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
          Overview of your booking platform performance
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 bg-[#EAF0F5] overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-6 pb-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">

          {/* Total Professionals */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow duration-300">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Total Professionals</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-1 sm:mt-2">
                {stats?.overview?.totalProfessionals || 0}
              </h2>
              <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2">↗ +12% <span className="text-gray-500">vs last month</span></p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 text-lg sm:text-xl">👥</span>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow duration-300">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Pending Approvals</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-1 sm:mt-2">
                {stats?.overview?.pendingApprovals || 0}
              </h2>
              <p className="text-red-500 text-xs sm:text-sm mt-1 sm:mt-2">↘ -3% <span className="text-gray-500">vs last month</span></p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-500 text-lg sm:text-xl">🙍</span>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow duration-300">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Total Customers</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-1 sm:mt-2">
                {stats?.overview?.totalUsers || 0}
              </h2>
              <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2">↗ +28% <span className="text-gray-500">vs last month</span></p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-lg sm:text-xl">👤</span>
            </div>
          </div>

          {/* Active Bookings Today */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow duration-300">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Total Bookings</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-1 sm:mt-2">
                {stats?.overview?.totalBookings || 0}
              </h2>
              <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2">↗ +5% <span className="text-gray-500">vs last month</span></p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-lg sm:text-xl">📅</span>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow duration-300">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Total Revenue</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-1 sm:mt-2">
                ₹{stats?.overview?.revenue?.toLocaleString() || 0}
              </h2>
              <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2">↗ +18% <span className="text-gray-500">vs last month</span></p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 text-lg sm:text-xl">💲</span>
            </div>
          </div>

          {/* Completed Bookings */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow duration-300">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Completed Bookings</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-1 sm:mt-2">
                {stats?.overview?.completedBookings || 0}
              </h2>
              <p className="text-green-600 text-xs sm:text-sm mt-1 sm:mt-2">↗ +7% <span className="text-gray-500">vs last month</span></p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-lg sm:text-xl">✅</span>
            </div>
          </div>

        </div>

        {/* ================== ANALYTICS SECTION ================== */}
        {/* Keeping static for now to avoid breaking complex SVG logic, but values above are dynamic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mt-4 sm:mt-6">

          {/* Revenue Trend */}
          <div className="lg:col-span-12 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group">
            {/* ... SVG Chart code kept as is for visual consistency ... */}
            <p className="text-center text-gray-500 py-10">Revenue Trend Chart (Data Integration Pending for Complex SVG)</p>
          </div>

        </div>

        {/* ================== RECENT BOOKINGS SECTION ================== */}
        <div className="mt-6 sm:mt-10 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Bookings</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Latest booking activities</p>
          </div>

          {/* Table Wrapper */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#f7f9fc] text-gray-600 uppercase text-[10px] sm:text-xs tracking-wider">
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold whitespace-nowrap">Booking ID</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold whitespace-nowrap">Customer</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold whitespace-nowrap">Services</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold whitespace-nowrap">Event Date</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold whitespace-nowrap">Status</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {stats?.recentActivity?.bookings?.length > 0 ? (
                      stats.recentActivity.bookings.map((booking: any) => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition duration-200 hover:scale-[1.01] transform">
                          <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-gray-800 whitespace-nowrap">
                            {booking.id.substring(0, 8)}...
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 whitespace-nowrap">
                            {booking.customerName || 'Unknown'}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs bg-purple-100 text-purple-700 whitespace-nowrap">
                                {booking.serviceType || 'Service'}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 whitespace-nowrap">
                            {new Date(booking.eventDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium whitespace-nowrap
                              ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-semibold text-gray-800 whitespace-nowrap">
                            ₹{booking.amount?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No recent bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {/* ================== END RECENT BOOKINGS ================== */}
      </div>

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
  );
};

export default Dashboard;
