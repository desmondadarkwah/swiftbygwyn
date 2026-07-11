import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import BookDelivery from './pages/BookDelivery'
import TrackOrder from './pages/TrackOrder'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminProtectedRoute from './components/AdminProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/book" element={<BookDelivery />} />
      <Route path="/track" element={<TrackOrder />} />
      <Route path="/track/:orderID" element={<TrackOrder />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
    </Routes>
  )
}

export default App