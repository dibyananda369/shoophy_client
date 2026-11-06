import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle,
  X,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export default function CartPage() {
  const { user } = useAuth()
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingCharge,
    totalAmount,
    coupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)
  const navigate = useNavigate()

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    setApplying(true)
    await applyCoupon(couponInput.trim())
    setApplying(false)
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Waiting</h2>
        <p className="text-sm text-slate-500 mb-6">
          Sign in to view your items, saved coupons, and personalized offers.
        </p>
        <Link
          to="/login?redirect=/cart"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm inline-block shadow-md transition"
        >
          Sign In Now
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="h-20 w-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 mb-6">
          Looks like you haven't added anything to your cart yet. Discover trending products right now!
        </p>
        <Link
          to="/products"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-full text-sm inline-flex items-center gap-2 shadow-md transition"
        >
          <span>Start Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
        Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product
            const price = parseFloat(product.price)
            const discount = parseFloat(product.discount || 0)
            const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price
            const primaryImage =
              product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-2xs hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Link
                    to={`/products/${product.slug || product.id}`}
                    className="h-20 w-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/50"
                  >
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    {product.brand && (
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {product.brand}
                      </span>
                    )}
                    <Link
                      to={`/products/${product.slug || product.id}`}
                      className="block text-sm font-bold text-slate-900 hover:text-blue-600 truncate transition"
                    >
                      {product.name}
                    </Link>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-extrabold text-slate-900">
                        ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
                      </span>
                      {discount > 0 && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{Math.round(price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Quantity Controller */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30 rounded-l-xl transition"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-r-xl transition"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-sm font-bold text-slate-900">
                      ₹{Math.round(discountedPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                    title="Remove from cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Have a Promo Coupon?</h3>
            </div>

            {coupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">{coupon.code}</p>
                    <p className="text-[10px] text-emerald-700">₹{coupon.discountAmount} saved</p>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={applying || !couponInput.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shrink-0"
                >
                  {applying ? 'Applying...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Quick Coupon Suggestions */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCouponInput('WELCOME10')}
                className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded font-mono font-bold text-slate-600 transition"
              >
                WELCOME10 (10% OFF)
              </button>
              <button
                onClick={() => setCouponInput('FLAT200')}
                className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded font-mono font-bold text-slate-600 transition"
              >
                FLAT200 (₹200 OFF)
              </button>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-slate-900">
                  ₹{Math.round(subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">
                    -₹{Math.round(discountAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping Delivery</span>
                <span>
                  {shippingCharge === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-xs">
                      FREE
                    </span>
                  ) : (
                    `₹${shippingCharge}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <div>
                <span className="text-base font-extrabold text-slate-900">Total Amount</span>
                <p className="text-[10px] text-slate-400">Inclusive of all taxes</p>
              </div>
              <span className="text-2xl font-extrabold text-slate-900">
                ₹{Math.round(totalAmount).toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Safe & Secure Bank-Grade Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

