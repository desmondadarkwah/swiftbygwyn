import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import BookDelivery from './pages/BookDelivery'
import TrackOrder from './pages/TrackOrder'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import RiderLogin from './pages/RiderLogin'
import RiderDashboard from './pages/RiderDashboard'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import RiderProtectedRoute from './components/RiderProtectedRoute'

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
      <Route path="/rider/login" element={<RiderLogin />} />
      <Route path="/rider" element={
        <RiderProtectedRoute>
          <RiderDashboard />
        </RiderProtectedRoute>
      } />
    </Routes>
  )
}

export default App

// rider created succesffully and rider logged in succesesfully and done and pushed also and i assigend and so it on the rider dashboar and when i clicked to confirm delivery i got ✕ Rider access only at the rider side, and i had to go to the admin side to rather trigger delivered and it automaticallly did delivered at the rider side too but it is still the rider that has to do delivered like the way when rider is assigend the rider cilck mark as assigend mark as transit etc, or maybe i'm not getting things well