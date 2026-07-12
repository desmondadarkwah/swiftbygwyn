import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('swg_admin_token')
  const riderToken = localStorage.getItem('swg_rider_token')
  const url = config.url || ''

  const isRiderRoute =
    url.includes('/riders/me') ||
    url.includes('/orders/rider') ||
    url.includes('/proof')

  if (isRiderRoute && riderToken) {
    config.headers.Authorization = `Bearer ${riderToken}`
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const status = error.response?.status

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/riders/login')

    if (status === 401 && !isAuthEndpoint) {
      const isRiderRoute =
        config.url?.includes('/riders/me') ||
        config.url?.includes('/orders/rider') ||
        config.url?.includes('/orders/') && config.url?.includes('/proof')
      if (isRiderRoute) {
        localStorage.removeItem('swg_rider_token')
        window.location.href = '/rider/login'
      } else {
        localStorage.removeItem('swg_admin_token')
        window.location.href = '/admin/login'
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

// ─── AUTH ─────────────────────────────────────────────
export const loginAdmin = async (payload) => {
  const { data } = await axiosInstance.post('/api/auth/login', payload)
  return data
}

// ─── ORDERS ───────────────────────────────────────────
export const createOrder = async (formData) => {
  const { data } = await axiosInstance.post('/api/orders', formData)
  return data.data
}

export const trackOrder = async (orderID) => {
  const { data } = await axiosInstance.get(`/api/orders/track/${orderID}`)
  return data.data
}

export const getAllOrders = async (status) => {
  const url = status ? `/api/orders?status=${status}` : '/api/orders'
  const { data } = await axiosInstance.get(url)
  return data.data || []
}

export const assignRider = async (orderId, riderId) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/assign`, { riderId })
  return data.data
}

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/status`, { status })
  return data.data
}

export const uploadProof = async (orderId, formData) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/proof`, formData)
  return data.data
}

export const getStats = async () => {
  const { data } = await axiosInstance.get('/api/orders/stats')
  return data.data
}

// ─── RIDERS ───────────────────────────────────────────
export const loginRider = async (payload) => {
  const { data } = await axiosInstance.post('/api/riders/login', payload)
  return data
}

export const getRiderMe = async () => {
  const { data } = await axiosInstance.get('/api/riders/me')
  return data.data
}

export const getRiderOrders = async () => {
  const { data } = await axiosInstance.get('/api/orders/rider')
  return data.data || []
}

export const getAllRiders = async () => {
  const { data } = await axiosInstance.get('/api/riders')
  return data.data || []
}

export const createRider = async (payload) => {
  const { data } = await axiosInstance.post('/api/riders', payload)
  return data.data
}

export const updateRiderStatus = async (id, status) => {
  const { data } = await axiosInstance.put(`/api/riders/${id}/status`, { status })
  return data.data
}

export const deleteRider = async (id) => {
  const { data } = await axiosInstance.delete(`/api/riders/${id}`)
  return data
}


