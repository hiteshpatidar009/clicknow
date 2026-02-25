import {
  LayoutGrid,
  Users,
  User,
  Layers,
  Calendar,
  CreditCard,
  LifeBuoy,
  BarChart2,
  Settings,
  FileText,
  X
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import React from 'react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const handleNavigation = (path: string) => {
    navigate(path)
    if (onClose) onClose()
  }

  const isActive = (path: string) => currentPath === path

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`
        bg-gradient-to-b from-[#0B1220] to-[#0F172A] text-gray-300 flex flex-col px-6 py-8 h-full
        fixed md:static top-0 left-0 z-30
        w-[280px] md:w-full
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        {/* Logo & Close Button */}
        <div className='flex items-center justify-between mb-10'>
          <div className='flex items-center gap-4'>
            <div className='bg-white text-black font-bold rounded-lg w-10 h-10 flex items-center justify-center text-lg'>
              CN
            </div>
            <div>
              <h1 className='text-white font-semibold text-base leading-tight'>
                ClickNow
              </h1>
              <p className='text-[10px] text-gray-400'>Enterprise Admin</p>
            </div>
          </div>

          <button
            className='md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors'
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className='flex-1 space-y-2 text-base overflow-y-auto no-scrollbar'>
          <SidebarItem
            icon={<LayoutGrid size={20} />}
            label='Dashboard'
            active={isActive('/dashboard')}
            onClick={() => handleNavigation('/dashboard')}
          />

          <SidebarItem
            icon={<Users size={20} />}
            label='Professionals'
            active={isActive('/professionals')}
            onClick={() => handleNavigation('/professionals')}
          />

          <SidebarItem
            icon={<User size={20} />}
            label='Customer'
            active={isActive('/customers')}
            onClick={() => handleNavigation('/customers')}
          />

          <SidebarItem
            icon={<Layers size={20} />}
            label='Services & Category'
            active={isActive('/services')}
            onClick={() => handleNavigation('/services')}
          />

          <SidebarItem
            icon={<Calendar size={20} />}
            label='Bookings'
            active={isActive('/bookings')}
            onClick={() => handleNavigation('/bookings')}
          />

          <SidebarItem
            icon={<CreditCard size={20} />}
            label='Payment & Payouts'
            active={isActive('/payments')}
            onClick={() => handleNavigation('/payments')}
          />

          <SidebarItem
            icon={<LifeBuoy size={20} />}
            label='Disputes & Support'
            active={isActive('/support')}
            onClick={() => handleNavigation('/support')}
          />

          <SidebarItem
            icon={<BarChart2 size={20} />}
            label='Reports & Analytics'
            active={isActive('/reports')}
            onClick={() => handleNavigation('/reports')}
          />

          <SidebarItem
            icon={<FileText size={20} />}
            label='Content & Portfolio'
            active={isActive('/content')}
            onClick={() => handleNavigation('/content')}
          />

          <p className='text-xs font-semibold text-gray-500 mt-6 mb-3 px-2 tracking-wider'>
            SYSTEM
          </p>

          <SidebarItem
            icon={<Settings size={20} />}
            label='Settings'
            active={isActive('/settings')}
            onClick={() => handleNavigation('/settings')}
          />
        </nav>
      </aside>
    </>
  )
}

const SidebarItem = ({
  icon,
  label,
  active = false,
  onClick
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
        ${
          active
            ? 'bg-gradient-to-r from-[#0A3D91] to-[#0F172A] text-white shadow-lg shadow-blue-900/20'
            : 'hover:bg-[#1E293B] text-gray-300'
        }
      `}
    >
      {icon}
      <span className='font-medium'>{label}</span>
    </div>
  )
}

export default Sidebar