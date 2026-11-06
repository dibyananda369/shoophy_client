import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist(null)
      return
    }
    setLoading(true)
    try {
      const { data } = await API.get('/wishlist')
      if (data.success) {
        setWishlist(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch wishlist', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [user])

  const isInWishlist = (productId) => {
    if (!wishlist || !wishlist.items) return false
    return wishlist.items.some((item) => item.productId === productId)
  }

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to add to wishlist')
      return false
    }
    try {
      const { data } = await API.post('/wishlist', { productId })
      if (data.success) {
        setWishlist(data.data)
        toast.success('Added to wishlist')
        return true
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to wishlist')
      return false
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      const { data } = await API.delete(`/wishlist/${productId}`)
      if (data.success) {
        setWishlist(data.data)
        toast.success('Removed from wishlist')
        return true
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove from wishlist')
      return false
    }
  }

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId)
    } else {
      return await addToWishlist(productId)
    }
  }

  const items = wishlist?.items || []

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        items,
        itemCount: items.length,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}

