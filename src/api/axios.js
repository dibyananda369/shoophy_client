import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // for cookies
})

// Attach Bearer token from localStorage as fallback
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, notify or clear session if needed
    return Promise.reject(error)
  }
)

export default API

