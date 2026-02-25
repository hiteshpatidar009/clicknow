import { EyeOff, Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('dev@local.test')
  const [password, setPassword] = useState('123456')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const validateForm = () => {
    let isValid = true
    const newErrors = { email: '', password: '' }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (validateForm()) {
      try {
        const normalizedEmail = email.trim().toLowerCase()
        const normalizedPassword = password.trim()

        const { response, payload: data } = await apiFetch('/api/v1/auth/login', {
          method: 'POST',
          auth: false,
          body: JSON.stringify({
            email: normalizedEmail,
            password: normalizedPassword,
          }),
        });

        if (response.ok) {
          // Store token and user data
          localStorage.setItem('token', data.data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          navigate('/dashboard');
        } else {
          const validationMessage = data?.errors?.[0]?.message
          setErrors({
            ...errors,
            email: validationMessage || data.message || 'Login failed',
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ ...errors, email: 'Connection error. Is backend running?' });
      }
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#EAF0F5] px-4 sm:px-6 lg:px-8'>
      {/* Main Card */}
      <div
        className='
          w-full max-w-[900px] h-auto lg:h-[600px]
          bg-white rounded-xl md:rounded-2xl
          flex flex-col lg:flex-row overflow-hidden
          shadow-lg md:shadow-xl
          login-card
        '
      >
        {/* LEFT SECTION */}
        <div
          className='
            w-full lg:w-1/2 
            bg-[#0F172A] text-white 
            p-6 sm:p-8 md:p-10 
            flex flex-col justify-between 
            login-left
            min-h-[320px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-auto
          '
        >
          {/* Branding */}
          <div>
            <div className='flex items-center gap-2 mb-4 md:mb-6 mt-0 lg:mt-5'>
              <div className='bg-white text-[#0F172A] font-bold px-2 py-1 rounded text-sm md:text-base'>
                CN
              </div>
              <h2 className='text-base md:text-lg font-semibold'>
                ClickNow Admins
              </h2>
            </div>

            <h1 className='text-xl sm:text-2xl md:text-3xl font-semibold leading-snug mb-3 md:mb-4'>
              Centralized ERP & <br className='hidden sm:block' /> GST
              Management
            </h1>

            <p className='text-xs sm:text-sm text-gray-300 max-w-sm'>
              Streamline your multi-business operations with precision an ease.
            </p>
          </div>

          {/* Image */}
          <div className='flex justify-center mt-4 md:mt-0'>
            <img
              src='/media/CameraImg.png'
              alt='Camera'
              className='
                w-[220px] sm:w-[280px] md:w-[320px] 
                h-auto object-contain
                max-h-[150px] sm:max-h-[180px] md:max-h-none
              '
            />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div
          className='
            w-full lg:w-1/2 
            p-6 sm:p-8 md:p-10 lg:p-14 
            flex flex-col justify-center 
            login-right
            flex-1
          '
        >
          <div className='max-w-md mx-auto w-full'>
            <h2 className='text-xl sm:text-2xl font-semibold text-gray-900 mb-1'>
              Welcome Back
            </h2>
            <p className='text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8'>
              Enter Your credentials to access your dashboard.
            </p>

            {/* Email */}
            <div className='mb-4 sm:mb-5'>
              <label className='text-xs sm:text-sm font-medium text-gray-700 mb-1 block'>
                Admin Email
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`
                    w-full 
                    pl-9 sm:pl-11 pr-3 sm:pr-4 
                    py-2.5 sm:py-3 
                    text-sm sm:text-base
                    rounded-lg border 
                    ${errors.email ? 'border-red-500' : 'border-gray-200'}
                    bg-gray-50 
                    focus:outline-none focus:ring-2 focus:ring-[#0F172A]
                  `}
                />
              </div>
              {errors.email && (
                <p className='text-red-500 text-xs mt-1'>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className='mb-4'>
              <label className='text-xs sm:text-sm font-medium text-gray-700 mb-1 block'>
                Admin Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`
                    w-full 
                    pl-9 sm:pl-11 pr-9 sm:pr-11 
                    py-2.5 sm:py-3
                    text-sm sm:text-base
                    rounded-lg border 
                    ${errors.password ? 'border-red-500' : 'border-gray-200'}
                    bg-gray-50 
                    focus:outline-none focus:ring-2 focus:ring-[#0F172A]
                  `}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeOff className='w-4 h-4' />
                </button>
              </div>
              {errors.password && (
                <p className='text-red-500 text-xs mt-1'>{errors.password}</p>
              )}
            </div>

            {/* Options */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 sm:mb-6 gap-3 sm:gap-0'>
              <label className='flex items-center gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer'>
                <input
                  type='checkbox'
                  className='rounded border-gray-300 w-4 h-4'
                />
                Keep me logged in.
              </label>

              <button className='text-xs sm:text-sm text-gray-600 hover:underline text-left sm:text-right'>
                Forgot Password?
              </button>
            </div>

            {/* Button */}
            <button
              onClick={handleLogin}
              className='
                w-full 
                bg-[#0F172A] text-white 
                py-2.5 sm:py-3 
                text-sm sm:text-base
                rounded-lg font-medium 
                hover:opacity-90 transition
                focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:ring-offset-2
              '
            >
              Login to system
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
