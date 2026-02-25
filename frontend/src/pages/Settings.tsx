import { useState, useEffect } from 'react'
import {
  Pencil,
  CheckCircle,
  Mail,
  Calendar,
  CreditCard,
  LifeBuoy,
  Users,
  Percent,
  DollarSign,
  FileText
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state
  const [profile, setProfile] = useState({
    email: '',
    name: ''
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedProfile, setEditedProfile] = useState({ ...profile })

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    bookingAlerts: true,
    paymentAlerts: false,
    supportAlerts: true,
    professionalApproval: false
  })

  // Commission Settings state
  const [commission, setCommission] = useState({
    globalRate: '15'
  })

  // Booking Policies state
  const [policies, setPolicies] = useState({
    cancellationWindow: '48',
    rescheduleLimit: '2',
    refundDays: '7'
  })

  // Tax Configuration state
  const [tax, setTax] = useState({
    gstRate: '18',
    serviceTax: '0'
  })

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({
    show: false,
    message: '',
    type: 'success'
  })

  // Initial Fetch
  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { payload: data } = await apiFetch('/api/v1/admin/settings');
      if (data.success && data.data) {
        if (data.data.commission) setCommission(data.data.commission);
        if (data.data.tax) setTax(data.data.tax);
        if (data.data.policies) setPolicies(data.data.policies);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  }

  const fetchProfile = async () => {
    try {
      const { payload: data } = await apiFetch('/api/v1/users/profile');
      if (data.success && data.data) {
        setProfile({
          email: data.data.email,
          name: data.data.displayName || `${data.data.firstName || ''} ${data.data.lastName || ''}`.trim()
        });
        setEditedProfile({
          email: data.data.email,
          name: data.data.displayName || `${data.data.firstName || ''} ${data.data.lastName || ''}`.trim()
        })

        if (data.data.settings?.notifications) {
          const incoming = data.data.settings.notifications;
          setNotifications(prev => ({
            ...prev,
            emailAlerts: incoming.email ?? prev.emailAlerts,
            bookingAlerts: incoming.push ?? prev.bookingAlerts,
            supportAlerts: incoming.whatsapp ?? prev.supportAlerts,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  }

  // Handle profile edit
  const handleEditClick = () => {
    setEditedProfile({ ...profile })
    setIsEditingProfile(true)
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setEditedProfile({ ...profile })
  }

  const handleSaveProfile = async () => {
    // Validate
    if (!editedProfile.name) {
      showToast('Name is required', 'error')
      return
    }

    try {
      // Split name
      const parts = editedProfile.name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');

      const { payload: data } = await apiFetch('/api/v1/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          firstName,
          lastName
        })
      });
      if (data.success) {
        setProfile({ ...editedProfile });
        setIsEditingProfile(false);
        showToast('Profile updated successfully', 'success');
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    // Reset errors
    setPasswordErrors({ current: '', new: '', confirm: '' })

    // Validate
    let hasError = false
    const newErrors = { current: '', new: '', confirm: '' }

    if (!passwords.current) {
      newErrors.current = 'Current password is required'
      hasError = true
    }
    if (!passwords.new) {
      newErrors.new = 'New password is required'
      hasError = true
    } else if (passwords.new.length < 6) {
      newErrors.new = 'Password must be at least 6 characters'
      hasError = true
    }
    if (!passwords.confirm) {
      newErrors.confirm = 'Please confirm your password'
      hasError = true
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'Passwords do not match'
      hasError = true
    }

    if (hasError) {
      setPasswordErrors(newErrors)
      return
    }

    try {
      const { payload: data } = await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });
      if (data.success) {
        setPasswords({ current: '', new: '', confirm: '' });
        showToast('Password changed successfully', 'success');
      } else {
        console.error(data);
        showToast(data.message || 'Failed to change password', 'error');
      }

    } catch (error) {
      showToast('Connection error', 'error');
    }
  }

  // Handle notification toggle
  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Handle save preferences
  const handleSavePreferences = async () => {
    try {
      const { payload: data } = await apiFetch('/api/v1/users/notifications/settings', {
        method: 'PUT',
        body: JSON.stringify({
          push: notifications.bookingAlerts,
          email: notifications.emailAlerts,
          whatsapp: notifications.supportAlerts,
          bookingUpdates: notifications.bookingAlerts,
          reminders: notifications.supportAlerts,
          promotions: notifications.paymentAlerts,
        })
      });

      if (data.success) {
        showToast('Notification preferences saved successfully', 'success');
      } else {
        showToast(data.message || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  }



  // Handle commission update
  const handleCommissionUpdate = async () => {
    if (!commission.globalRate) {
      showToast('Please enter commission rate', 'error')
      return
    }
    await updateSystemSettings({ commission });
  }

  // Handle policies save
  const handlePoliciesSave = async () => {
    if (
      !policies.cancellationWindow ||
      !policies.rescheduleLimit ||
      !policies.refundDays
    ) {
      showToast('Please fill all policy fields', 'error')
      return
    }
    await updateSystemSettings({ policies });
  }

  // Handle tax update
  const handleTaxUpdate = async () => {
    if (!tax.gstRate) {
      showToast('Please enter GST rate', 'error')
      return
    }
    await updateSystemSettings({ tax });
  }

  const updateSystemSettings = async (updateData: any) => {
    try {
      const { payload: data } = await apiFetch('/api/v1/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      if (data.success) {
        showToast('System settings updated successfully', 'success');
      } else {
        showToast(data.message || 'Failed to update settings', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  }

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  return (
    <div className='min-h-screen bg-[#EAF0F5] p-4 md:p-6 relative'>
      {/* Toast Notification - Now at the top */}
      {toast.show && (
        <div className='fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down'>
          <div
            className={`
            flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border
            ${toast.type === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
              }
          `}
          >
            <CheckCircle
              size={20}
              className={
                toast.type === 'success' ? 'text-green-500' : 'text-red-500'
              }
            />
            <p
              className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}
            >
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
          Settings
        </h1>
        <p className='text-xs sm:text-sm text-gray-500 mt-1'>
          Manage your profile and system preferences
        </p>
      </div>

      {/* Tabs */}
      <div className='flex gap-4 sm:gap-6 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide'>
        {[
          { id: 'profile', label: 'Admin Profile' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'system', label: 'System' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 sm:pb-3 whitespace-nowrap text-xs sm:text-sm font-medium transition ${activeTab === tab.id
              ? 'border-b-2 border-[#7C3AED] text-[#7C3AED]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* Profile Information */}
          <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-[18px] font-semibold text-[#1F2937]'>
                Profile Information
              </h2>
              {!isEditingProfile && (
                <button
                  onClick={handleEditClick}
                  className='p-2 hover:bg-gray-100 rounded-full transition'
                >
                  <Pencil size={18} className='text-gray-400' />
                </button>
              )}
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-[13px] text-gray-400'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={isEditingProfile ? editedProfile.email : profile.email}
                  disabled
                  readOnly
                  className={`mt-2 w-full border rounded-lg px-4 py-2 text-sm transition border-transparent bg-gray-50 text-gray-500 cursor-not-allowed`}
                />
                <p className='text-[10px] text-gray-400 mt-1'>Email cannot be changed contact super admin.</p>
              </div>

              <div>
                <label className='text-[13px] text-gray-400'>Full Name</label>
                <input
                  type='text'
                  value={isEditingProfile ? editedProfile.name : profile.name}
                  onChange={e =>
                    setEditedProfile({ ...editedProfile, name: e.target.value })
                  }
                  readOnly={!isEditingProfile}
                  className={`mt-2 w-full border rounded-lg px-4 py-2 text-sm transition ${isEditingProfile
                    ? 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white'
                    : 'border-transparent bg-gray-50 text-gray-600 cursor-default'
                    }`}
                />
              </div>

              {isEditingProfile && (
                <div className='flex gap-3 mt-4'>
                  <button
                    onClick={handleSaveProfile}
                    className='px-5 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium shadow-md hover:opacity-90 transition'
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className='px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition'
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Change Password */}
          <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
            <h2 className='text-[18px] font-semibold text-[#1F2937] mb-6'>
              Change Password
            </h2>

            <div className='space-y-4'>
              <div>
                <label className='text-[13px] text-gray-400'>
                  Current Password
                </label>
                <input
                  type='password'
                  value={passwords.current}
                  onChange={e =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder='Enter current password'
                  className={`mt-2 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${passwordErrors.current
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                    }`}
                />
                {passwordErrors.current && (
                  <p className='text-xs text-red-500 mt-1'>
                    {passwordErrors.current}
                  </p>
                )}
              </div>

              <div>
                <label className='text-[13px] text-gray-400'>
                  New Password
                </label>
                <input
                  type='password'
                  value={passwords.new}
                  onChange={e =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  placeholder='Enter new password'
                  className={`mt-2 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${passwordErrors.new
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                    }`}
                />
                {passwordErrors.new && (
                  <p className='text-xs text-red-500 mt-1'>
                    {passwordErrors.new}
                  </p>
                )}
              </div>

              <div>
                <label className='text-[13px] text-gray-400'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  value={passwords.confirm}
                  onChange={e =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder='Confirm new password'
                  className={`mt-2 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${passwordErrors.confirm
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                    }`}
                />
                {passwordErrors.confirm && (
                  <p className='text-xs text-red-500 mt-1'>
                    {passwordErrors.confirm}
                  </p>
                )}
              </div>

              <button
                onClick={handlePasswordChange}
                className='mt-4 px-5 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium shadow-md hover:opacity-90 transition'
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
          <h2 className='text-[18px] font-semibold text-[#1F2937] mb-6'>
            Notification Preferences
          </h2>

          <div className='space-y-4'>
            {/* Email Alerts */}
            <div className='flex items-center justify-between py-3 border-b border-gray-100'>
              <div className='flex items-start gap-3'>
                <Mail size={20} className='text-gray-400 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    Email Alerts
                  </p>
                  <p className='text-xs text-gray-500'>
                    Receive email notifications for important events
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('emailAlerts')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifications.emailAlerts ? 'bg-[#7C3AED]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications.emailAlerts
                    ? 'translate-x-6'
                    : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Booking Alerts */}
            <div className='flex items-center justify-between py-3 border-b border-gray-100'>
              <div className='flex items-start gap-3'>
                <Calendar size={20} className='text-gray-400 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    Booking Alerts
                  </p>
                  <p className='text-xs text-gray-500'>
                    Get notified about new and updated bookings
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('bookingAlerts')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifications.bookingAlerts ? 'bg-[#7C3AED]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications.bookingAlerts
                    ? 'translate-x-6'
                    : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Payment Alerts */}
            <div className='flex items-center justify-between py-3 border-b border-gray-100'>
              <div className='flex items-start gap-3'>
                <CreditCard size={20} className='text-gray-400 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    Payment Alerts
                  </p>
                  <p className='text-xs text-gray-500'>
                    Notifications for payment transactions
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('paymentAlerts')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifications.paymentAlerts ? 'bg-[#7C3AED]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications.paymentAlerts
                    ? 'translate-x-6'
                    : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Support Alerts */}
            <div className='flex items-center justify-between py-3 border-b border-gray-100'>
              <div className='flex items-start gap-3'>
                <LifeBuoy size={20} className='text-gray-400 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    Support Alerts
                  </p>
                  <p className='text-xs text-gray-500'>
                    Alerts for new support tickets
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('supportAlerts')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifications.supportAlerts ? 'bg-[#7C3AED]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications.supportAlerts
                    ? 'translate-x-6'
                    : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Professional Approval */}
            <div className='flex items-center justify-between py-3 border-b border-gray-100'>
              <div className='flex items-start gap-3'>
                <Users size={20} className='text-gray-400 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    Professional Approval
                  </p>
                  <p className='text-xs text-gray-500'>
                    Notifications for pending professional approvals
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('professionalApproval')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifications.professionalApproval
                  ? 'bg-[#7C3AED]'
                  : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notifications.professionalApproval
                    ? 'translate-x-6'
                    : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Save Preferences Button */}
            <div className='pt-4'>
              <button
                onClick={handleSavePreferences}
                className='px-6 py-2.5 rounded-lg bg-[#7C3AED] text-white text-sm font-medium shadow-md hover:opacity-90 transition'
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Config Tab - Updated layout */}
      {activeTab === 'system' && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* Commission Settings */}
          <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
            <div className='flex items-center gap-2 mb-6'>
              <Percent size={20} className='text-[#7C3AED]' />
              <h2 className='text-[18px] font-semibold text-[#1F2937]'>
                Commission Settings
              </h2>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-[13px] text-gray-400'>
                  Global Commission Rate (%)
                </label>
                <input
                  type='number'
                  value={commission.globalRate}
                  onChange={e => setCommission({ globalRate: e.target.value })}
                  className='mt-2 w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  This commission will be applied to all services unless
                  overridden
                </p>
              </div>

              <button
                onClick={handleCommissionUpdate}
                className='mt-4 px-5 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium shadow-md hover:opacity-90 transition'
              >
                Update Commission
              </button>
            </div>
          </div>

          {/* Tax Configuration - Now on the right side */}
          <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
            <div className='flex items-center gap-2 mb-6'>
              <DollarSign size={20} className='text-[#7C3AED]' />
              <h2 className='text-[18px] font-semibold text-[#1F2937]'>
                Tax Configuration
              </h2>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-[13px] text-gray-400'>
                  GST Rate (%)
                </label>
                <input
                  type='number'
                  value={tax.gstRate}
                  onChange={e => setTax({ ...tax, gstRate: e.target.value })}
                  className='mt-2 w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]'
                />
              </div>

              <div>
                <label className='text-[13px] text-gray-400'>
                  Service Tax (%)
                </label>
                <input
                  type='number'
                  value={tax.serviceTax}
                  onChange={e => setTax({ ...tax, serviceTax: e.target.value })}
                  className='mt-2 w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]'
                />
              </div>

              <button
                onClick={handleTaxUpdate}
                className='mt-4 px-5 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium shadow-md hover:opacity-90 transition'
              >
                Update Tax Settings
              </button>
            </div>
          </div>

          {/* Booking Policies - Full width below both */}
          <div className='lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
            <div className='flex items-center gap-2 mb-6'>
              <FileText size={20} className='text-[#7C3AED]' />
              <h2 className='text-[18px] font-semibold text-[#1F2937]'>
                Booking Policies
              </h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='text-[13px] text-gray-400'>
                  Cancellation Window (hours before event)
                </label>
                <input
                  type='number'
                  value={policies.cancellationWindow}
                  onChange={e =>
                    setPolicies({
                      ...policies,
                      cancellationWindow: e.target.value
                    })
                  }
                  className='mt-2 w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]'
                />
              </div>

              <div>
                <label className='text-[13px] text-gray-400'>
                  Reschedule Limit (times allowed)
                </label>
                <input
                  type='number'
                  value={policies.rescheduleLimit}
                  onChange={e =>
                    setPolicies({
                      ...policies,
                      rescheduleLimit: e.target.value
                    })
                  }
                  className='mt-2 w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]'
                />
              </div>

              <div>
                <label className='text-[13px] text-gray-400'>
                  Refund Processing Time (days)
                </label>
                <input
                  type='number'
                  value={policies.refundDays}
                  onChange={e =>
                    setPolicies({ ...policies, refundDays: e.target.value })
                  }
                  className='mt-2 w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]'
                />
              </div>
            </div>

            <button
              onClick={handlePoliciesSave}
              className='mt-6 px-5 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium shadow-md hover:opacity-90 transition'
            >
              Save Policies
            </button>
          </div>
        </div>
      )}

      {/* Hide Scrollbars */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Settings
