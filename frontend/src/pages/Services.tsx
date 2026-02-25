import React, { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { apiFetch } from '../lib/api';

type Service = {
  id: string
  title: string
  status: 'Active' | 'Inactive'
  description: string
  // Backend doesn't have price/inclusions yet, so we'll mock or hide them
  price?: string
  inclusions?: string[]
  addons?: number
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      // Fetch categories as services
      const { payload: data } = await apiFetch('/api/v1/categories', { auth: false });

      if (data.success) {
        const mappedServices = data.data.map((cat: any) => ({
          id: cat.id,
          title: cat.name,
          status: cat.isActive ? 'Active' : 'Inactive',
          description: cat.description || 'No description available',
          price: 'Variable', // Placeholder
          inclusions: ['Service details available on request'], // Placeholder
          addons: 0
        }))
        setServices(mappedServices)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      // Fallback to static data if fetch fails (e.g. backend offline)
      setServices([
        {
          id: '1',
          title: 'Photography',
          status: 'Active',
          description: 'Professional photography services for weddings and events',
          price: '₹15,000',
          inclusions: ['2 Photographers', '8 Hours Coverage', 'Digital Album'],
          addons: 3
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#EAF0F5] p-4 md:p-6">

      {/* Header with button in same line */}
      <div className="flex items-center justify-between bg-[#EAF0F5] z-10 pb-4  px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Services & Categories
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage booking services and categories
          </p>
        </div>

        {/* <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium shadow-md hover:opacity-90 transition whitespace-nowrap">
          <Plus size={16} />
          Add New Service
        </button> */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-2">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition relative flex flex-col"
            >
              {/* Edit Icon */}
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
                <Pencil size={16} />
              </button>

              {/* Title + Status */}
              <div className="mb-2">
                <h2 className="text-[18px] font-semibold text-[#1F2937]">
                  {service.title}
                </h2>

                <span
                  className={`inline-block mt-1 px-3 py-[2px] rounded-full text-[12px] font-medium ${service.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                    }`}
                >
                  {service.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-[14px] text-gray-500 mb-4 leading-relaxed line-clamp-2">
                {service.description}
              </p>

              {/* Price */}
              <div className="mb-3">
                <p className="text-[13px] text-gray-400">Base Price</p>
                <p className="text-[24px] font-bold text-[#7C3AED]">
                  {service.price}
                </p>
              </div>

              {/* Inclusions */}
              <div className="mb-4">
                <p className="text-[13px] text-gray-400 mb-2">Inclusions</p>
                <ul className="space-y-1">
                  {service.inclusions?.map((item, i) => (
                    <li
                      key={i}
                      className="text-[14px] text-gray-600 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                      {item}
                    </li>
                  ))}
                  {!service.inclusions && <li>—</li>}
                </ul>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-3" />

              {/* Addons */}
              <p className="text-[13px] text-gray-500 mt-auto">
                {service.addons} Add-ons available
              </p>
            </div>
          ))}

          {services.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No services found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ServicesPage
