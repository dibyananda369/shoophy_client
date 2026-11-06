import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  User,
  Package,
  MapPin,
  Heart,
  KeyRound,
  LogOut,
  Trash2,
  ExternalLink,
  Truck,
  CheckCircle,
  Clock,
  ShoppingCart,
} from 'lucide-react'
import API from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, loading: authLoading, logout, updateProfile, changePassword } = useAuth()
  const { items: wishlistItems, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTab = searchParams.get('tab') || 'profile'

  // Orders state
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Addresses state
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  // Profile form state (null = untouched, so the profile fills in once the user loads)
  const [profileNameDraft, setProfileName] = useState(null)
  const [profilePhoneDraft, setProfilePhone] = useState(null)
  const profileName = profileNameDraft ?? user?.name ?? ''
  const profilePhone = profilePhoneDraft ?? user?.phone ?? ''

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    // Wait for the session check; otherwise a page refresh always bounces to /login
    if (authLoading) return
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/dashboard?tab=${currentTab}`)}`, { replace: true })
      return
    }

    if (currentTab === 'orders') {
      setLoadingOrders(true)
      API.get('/orders')
        .then((res) => {
          if (res.data.success) setOrders(res.data.data)
        })
        .finally(() => setLoadingOrders(false))
    }

    if (currentTab === 'addresses') {
      setLoadingAddresses(true)
      API.get('/addresses')
        .then((res) => {
          if (res.data.success) setAddresses(res.data.data)
        })
        .finally(() => setLoadingAddresses(false))
    }
  }, [user, authLoading, currentTab, navigate])

  const setTab = (tab) => {
    setSearchParams({ tab })
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    await updateProfile({ name: profileName, phone: profilePhone })
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    const res = await changePassword(currentPassword, newPassword)
    if (res?.success) {
      setCurrentPassword('')
      setNewPassword('')
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await API.delete(`/addresses/${id}`)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Address removed')
    } catch (err) {
      toast.error('Failed to remove address')
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex justify-center py-24" role="status" aria-label="Loading your account">
        <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="p-3 border-b border-slate-100 flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => setTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              currentTab === 'profile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setTab('orders')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              currentTab === 'orders'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>My Orders & Tracking</span>
          </button>

          <button
            onClick={() => setTab('wishlist')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              currentTab === 'wishlist'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>My Wishlist ({wishlistItems.length})</span>
          </button>

          <button
            onClick={() => setTab('addresses')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              currentTab === 'addresses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Saved Addresses</span>
          </button>

          <button
            onClick={() => setTab('password')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              currentTab === 'password'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Change Password</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Tab Content */}
        <main className="flex-1 w-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          {/* TAB 1: PROFILE */}
          {currentTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-xl font-extrabold text-slate-900">Personal Profile</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5">Email address cannot be changed</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition"
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {currentTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900">Order History & Tracking</h2>

              {loadingOrders ? (
                <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p>No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                        <div>
                          <span className="text-slate-400">Order Placed: </span>
                          <span className="font-bold text-slate-800">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-slate-300 mx-2">|</span>
                          <span className="text-slate-400">ID: </span>
                          <span className="font-mono text-slate-700">{order.id}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-full text-[11px] uppercase">
                            {order.status}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            ₹{Math.round(parseFloat(order.totalAmount)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Items snapshot */}
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                                alt={item.productName}
                                className="h-10 w-10 rounded-lg object-cover bg-slate-100"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{item.productName}</p>
                                <p className="text-slate-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-800">
                              ₹{Math.round(parseFloat(item.subtotal)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Shipment Tracking if available */}
                      {order.shipment && (
                        <div className="bg-slate-50 rounded-xl p-3 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <span>Carrier: <strong>{order.shipment.carrier || 'Express Courier'}</strong></span>
                            {order.shipment.trackingNumber && (
                              <span className="text-slate-500 font-mono">({order.shipment.trackingNumber})</span>
                            )}
                          </div>
                          <span className="text-[11px] text-emerald-600 font-bold">
                            {order.shipment.deliveredAt ? 'Delivered' : 'In Transit'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {currentTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900">
                My Wishlist ({wishlistItems.length})
              </h2>

              {wishlistItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Heart className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p>Your wishlist is currently empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
                          <img
                            src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                          {item.product?.name}
                        </h4>
                        <p className="font-extrabold text-sm text-slate-900 mt-1">
                          ₹{Math.round(parseFloat(item.product?.price || 0)).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-100 mt-3">
                        <button
                          onClick={() => addToCart(item.productId, 1)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.productId)}
                          className="p-2 border border-slate-200 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {currentTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900">Saved Addresses</h2>

              {loadingAddresses ? (
                <div className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
              ) : addresses.length === 0 ? (
                <p className="text-xs text-slate-400">No saved addresses yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="bg-slate-100 text-[10px] font-bold px-2 py-0.5 rounded text-slate-600">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-slate-600">{addr.addressLine2}</p>}
                        <p className="text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-slate-800 font-semibold pt-1">Phone: {addr.phone}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs text-rose-600 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PASSWORD */}
          {currentTab === 'password' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-xl font-extrabold text-slate-900">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password (min 8 chars, 1 uppercase, 1 number)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

