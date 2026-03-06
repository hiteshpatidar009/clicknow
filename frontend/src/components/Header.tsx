import { Bell } from 'lucide-react'
import { useState, useEffect } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser({
          name: parsedUser.displayName || `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() || 'System Admin',
          email: parsedUser.email || '',
          avatar: parsedUser.avatar
        })
      } catch (e) {
        console.error('Failed to parse user from local storage', e)
      }
    }
  }, [])

  return (
    <>
      <header className='w-full bg-white px-4 sm:px-6 py-3 flex items-center justify-between border-b fixed top-0 left-0 z-40'>
        {/* Desktop: Search Bar */}
        <div className='relative w-[354px] max-w-full hidden sm:block ml-61'>
          <input
            type='text'
            placeholder='Search anything....'
            className='
              w-full h-[35px]
              pl-10 pr-3 ml-16
              text-[16px] font-medium text-[#000000]
              border border-[#919191]
              rounded-[8px]
              focus:outline-none
            '
          />
          <svg
            className='absolute left-[76px] top-1/2 -translate-y-1/2 text-[#A8A8A8]'
            width='14'
            height='14'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z'
            />
          </svg>
        </div>

        {/* Mobile: Menu Toggle Button */}
        <div className='sm:hidden'>
          <button
            className='p-2 rounded-md hover:bg-gray-100'
            onClick={onMenuClick}
          >
            <svg
              className='w-6 h-6 text-gray-700'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>
        </div>

        {/* Right Section (Desktop) */}
        <div className='flex items-center gap-5'>
          {/* Bell Icon with Circular Ring */}
          <div className='relative'>
            <div className='w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center'>
              <Bell className='w-5 h-5 text-gray-700 cursor-pointer' />
            </div>

            <span className='absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-[2px] border-white'></span>
          </div>

          {/* Divider */}
          <div className='h-8 w-px bg-gray-300 hidden sm:block'></div>

          {/* Profile */}
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full border-2 border-[#FFC13D] flex items-center justify-center overflow-hidden'>
              <img
                src={user?.avatar || '/media/CameraImg.png'}
                alt='Profile'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='hidden sm:block'>
              <p className='text-sm font-medium text-gray-800'>{user?.name || 'System Admin'}</p>
              <p className='text-xs text-gray-500'>
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: Search Bar (Hidden as per request) */}
      <div className='hidden'></div>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className='h-16 sm:hidden'></div>
    </>
  )
}

export default Header