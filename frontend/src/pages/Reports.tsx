import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts'

const Reports = () => {
  /* -------------------- DATA -------------------- */

  const revenueByService = [
    { name: 'Photography', revenue: 120000 },
    { name: 'Videography', revenue: 95000 },
    { name: 'Catering', revenue: 70000 },
    { name: 'Decoration', revenue: 40000 },
    { name: 'Makeup', revenue: 10000 }
  ]

  const revenueByCity = [
    { name: 'Mumbai', revenue: 120000 },
    { name: 'Delhi', revenue: 95000 },
    { name: 'Bangalore', revenue: 75000 },
    { name: 'Hyderabad', revenue: 45000 },
    { name: 'Pune', revenue: 25000 }
  ]

  const professionals = [
    {
      rank: 1,
      name: 'Vikram Singh',
      service: 'Catering',
      bookings: 203,
      rate: '78%',
      revenue: '₹406,000'
    },
    {
      rank: 2,
      name: 'Sneha Reddy',
      service: 'Decoration',
      bookings: 167,
      rate: '97%',
      revenue: '₹334,000'
    },
    {
      rank: 3,
      name: 'Rajesh Kumar',
      service: 'Photography',
      bookings: 124,
      rate: '93%',
      revenue: '₹245,000'
    },
    {
      rank: 4,
      name: 'Priya Sharma',
      service: 'Makeup Artist',
      bookings: 89,
      rate: '92%',
      revenue: '₹178,000'
    },
    {
      rank: 5,
      name: 'Amit Patel',
      service: 'Videography',
      bookings: 56,
      rate: '88%',
      revenue: '₹112,000'
    }
  ]

  // Colors for Revenue by Service chart (Green shades)
  const serviceColors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5']

  // Colors for Revenue by City chart (Orange shades)
  const cityColors = ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5']

  /* -------------------- TOOLTIP -------------------- */

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md border border-gray-200'>
          <p className='text-xs sm:text-sm font-medium text-gray-700'>
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className='flex flex-col h-full bg-[#EAF0F5]'>
      {/* Heading */}
      <div className='sticky top-0 bg-[#EAF0F5] z-10 pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
          Reports & Analytics
        </h1>
        <p className='text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1'>
          Track revenue performance, city insights and top professionals
        </p>
      </div>

      <div className='flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 md:pb-8 space-y-4 sm:space-y-5 md:space-y-6 scrollbar-hide'>
        {/* ---------------- Revenue by Service ---------------- */}
        <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200'>
          <h2 className='text-base sm:text-lg font-semibold text-gray-800 mb-0.5 sm:mb-1'>
            Revenue by Service
          </h2>
          <p className='text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5 md:mb-6'>
            Service-wise revenue breakdown
          </p>

          <div className='w-full h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={revenueByService}
                margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='#E5E7EB'
                />
                <XAxis
                  dataKey='name'
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor='end'
                  height={60}
                />
                <YAxis
                  tickFormatter={(value: number) => `₹${value / 1000}K`}
                  tick={{ fontSize: 10 }}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey='revenue' radius={[6, 6, 0, 0]}>
                  {revenueByService.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={serviceColors[index % serviceColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---------------- Revenue by City ---------------- */}
        <div className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200'>
          <h2 className='text-base sm:text-lg font-semibold text-gray-800 mb-0.5 sm:mb-1'>
            Revenue by City
          </h2>
          <p className='text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5 md:mb-6'>
            City-wise revenue distribution
          </p>

          <div className='w-full h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                layout='vertical'
                data={revenueByCity}
                margin={{
                  left: 10,
                  right: 10,
                  top: 10,
                  bottom: 10
                }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  horizontal={false}
                  stroke='#E5E7EB'
                />
                <XAxis
                  type='number'
                  tickFormatter={(value: number) => `₹${value / 1000}K`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type='category'
                  dataKey='name'
                  tick={{ fontSize: 10 }}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey='revenue' radius={[0, 6, 6, 0]}>
                  {revenueByCity.map((_, index) => (
                    <Cell
                      key={`cell-city-${index}`}
                      fill={cityColors[index % cityColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---------------- Top Professionals ---------------- */}
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
          {/* Header Section */}
          <div className='px-4 sm:px-5 md:px-6 py-4 sm:py-5 border-b border-gray-200'>
            <h2 className='text-base sm:text-lg font-semibold text-gray-800'>
              Top Performing Professionals
            </h2>
            <p className='text-xs sm:text-sm text-gray-500 mt-0.5'>
              Ranked by revenue generated
            </p>
          </div>

          {/* Table Container with proper padding */}
          <div className='p-3 sm:p-4 md:p-6'>
            <div className='border border-gray-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden bg-white'>
              <div className='overflow-x-auto scrollbar-hide'>
                <div className='min-w-[800px] md:min-w-[900px]'>
                  {/* Header */}
                  <div className='grid grid-cols-6 px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50 text-gray-500 text-xs sm:text-sm font-medium border-b border-gray-200'>
                    <div>Rank</div>
                    <div>Professional</div>
                    <div>Service</div>
                    <div>Bookings</div>
                    <div>Rate</div>
                    <div>Revenue</div>
                  </div>

                  {/* Rows */}
                  {professionals.map((pro, index) => (
                    <div
                      key={pro.rank}
                      className={`
                        grid grid-cols-6 px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hover:bg-gray-50 transition
                        ${index !== professionals.length - 1
                          ? 'border-b border-gray-200'
                          : ''
                        }
                      `}
                    >
                      <div className='font-semibold text-indigo-600'>
                        #{pro.rank}
                      </div>
                      <div className='text-gray-800 font-medium truncate pr-2'>
                        {pro.name}
                      </div>
                      <div className='text-gray-600 truncate pr-2'>
                        {pro.service}
                      </div>
                      <div className='text-gray-700'>{pro.bookings}</div>
                      <div className='text-green-600 font-medium'>
                        {pro.rate}
                      </div>
                      <div className='font-semibold text-gray-900'>
                        {pro.revenue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide Scrollbars */}
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
  )
}

export default Reports
