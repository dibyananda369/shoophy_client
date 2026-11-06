import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState(null)

  const fetchCart = async () => {
    if (!user) {
      setCart(null)
      return
    }
    setLoading(true)
    try {
      const { data } = await API.get('/cart')
      if (data.success) {
        setCart(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch cart', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [user])

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to your cart')
      return false
    }
    try {
      const { data } = await API.post('/cart/items', { productId, quantity })
      if (data.success) {
        setCart(data.data)
        toast.success('Item added to cart')
        return true
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart'
      toast.error(msg)
      return false
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return
    try {
      const { data } = await API.put(`/cart/items/${itemId}`, { quantity })
      if (data.success) {
        setCart(data.data)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity')
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await API.delete(`/cart/items/${itemId}`)
      if (data.success) {
        setCart(data.data)
        toast.success('Item removed from cart')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item')
    }
  }

  const clearCart = async () => {
    try {
      await API.delete('/cart')
      setCart((prev) => (prev ? { ...prev, items: [] } : null))
      setCoupon(null)
    } catch (err) {
      console.error('Failed to clear cart', err)
    }
  }

  const applyCoupon = async (code) => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty')
      return false
    }
    try {
      const { data } = await API.post('/coupons/validate', {
        code,
        orderTotal: subtotal,
      })
      if (data.success) {
        setCoupon(data.data)
        toast.success(`Coupon "${code}" applied! You saved ₹${data.data.discountAmount}`)
        return true
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code'
      toast.error(msg)
      return false
    }
  }

  const removeCoupon = () => {
    setCoupon(null)
    toast.success('Coupon removed')
  }

  // Calculate Subtotal & Totals
  const items = cart?.items || []
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.product.price)
    const discount = parseFloat(item.product.discount || 0)
    const discountedPrice = price * (1 - discount / 100)
    return sum + discountedPrice * item.quantity
  }, 0)

  const discountAmount = coupon ? parseFloat(coupon.discountAmount) : 0
  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const shippingCharge = afterDiscount >= 499 || afterDiscount === 0 ? 0 : 49
  const totalAmount = afterDiscount + shippingCharge

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        loading,
        coupon,
        subtotal,
        discountAmount,
        shippingCharge,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}

