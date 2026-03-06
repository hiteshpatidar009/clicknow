import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import Professionals from './pages/Professionals'
import Customers from './pages/Customers'
import Layout from './components/Layout'
import Bookings from './pages/Booking'
import ServicesPage from './pages/Services'
import Support from './pages/Support'
import PaymentsPage from './pages/Paymentpage'
import ContentPortfolio from './pages/content&portfolio'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route
          path='/dashboard'
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path='/professionals'
          element={
            <Layout>
              <Professionals />
            </Layout>
          }
        />
        <Route
          path='/customers'
          element={
            <Layout>
              <Customers />
            </Layout>
          }
        />

        <Route
          path='/bookings'
          element={
            <Layout>
              <Bookings />
            </Layout>
          }
        />

        <Route
          path='/services'
          element={
            <Layout>
              <ServicesPage />
            </Layout>
          }
        />
        <Route
          path='/support'
          element={
            <Layout>
              <Support />
            </Layout>
          }
        />

        <Route
          path='/payments'
          element={
            <Layout>
              <PaymentsPage />
            </Layout>
          }
        />

         <Route
          path='/content'
          element={
            <Layout>
              <ContentPortfolio />
            </Layout>
          }
        />
        <Route
          path='/reports'
          element={
            <Layout>
              <Reports />
            </Layout>
          }
        />
        <Route
          path='/settings'
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
