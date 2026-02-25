import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className='h-screen flex bg-[#EAF0F5] overflow-hidden'>
      {/* Desktop Sidebar – always visible on desktop */}
      <div className='hidden md:block w-[260px] fixed left-0 top-0 h-full z-30'>
        <Sidebar />
      </div>

      {/* Mobile Sidebar – only rendered on mobile when open */}
      <div className='md:hidden'>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={handleSidebarClose} 
        />
      </div>

      {/* Main area - lower z-index so overlay can cover it */}
      <div className='flex-1 md:ml-[260px] w-full flex flex-col overflow-hidden relative z-0'>
        {/* Header – fixed */}
        <div className='fixed top-0 left-0 md:left-[260px] right-0 z-10 bg-white'>
          <Header onMenuClick={handleMenuClick} />
        </div>

        {/* Page Content - This should handle scrolling */}
        <main className='mt-[70px] flex-1 overflow-auto p-4 md:p-6 w-full bg-[#EAF0F5]'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout