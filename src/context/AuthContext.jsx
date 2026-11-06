import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch current user on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await API.get('/auth/me')
        if (data.success) {
          setUser(data.data)
        }
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password })
      if (data.success) {
        setUser(data.data.user)
        if (data.data.token) {
          localStorage.setItem('token', data.data.token)
        }
        toast.success(`Welcome back, ${data.data.user.name}!`)
        return { success: true, user: data.data.user }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(msg)
      return { success: false, message: msg }
    }
  }

  const register = async (name, email, password, phone) => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password, phone })
      if (data.success) {
        setUser(data.data.user)
        if (data.data.token) {
          localStorage.setItem('token', data.data.token)
        }
        toast.success('Registration successful! Welcome to Shoophy.')
        return { success: true, user: data.data.user }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
      return { success: false, message: msg }
    }
  }

  const logout = async () => {
    try {
      await API.post('/auth/logout')
    } catch (_) {
      // ignore
    } finally {
      setUser(null)
      localStorage.removeItem('token')
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/profile', profileData)
      if (data.success) {
        setUser(data.data)
        toast.success('Profile updated successfully')
        return { success: true }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile'
      toast.error(msg)
      return { success: false, message: msg }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await API.put('/auth/change-password', { currentPassword, newPassword })
      if (data.success) {
        toast.success('Password updated successfully')
        return { success: true }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password'
      toast.error(msg)
      return { success: false, message: msg }
    }
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

