import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Plus,
  CheckCircle,
  Truck,
  ArrowRight,
} from 'lucide-react'
import API from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import PaymentModal from '../../components/checkout/PaymentModal'
import toast from 'react-hot-toast'

// Loads Razorpay Checkout on demand (only needed when live gateway keys are configured)
const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Could not open the payment window. Please check your connection.'))
    document.body.appendChild(script)
  })

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, loading: cartLoading, subtotal, discountAmount, shippingCharge, totalAmount, coupon, refreshCart } = useCart()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY') // RAZORPAY (online) or COD
  const [notes, setNotes] = useState('')
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)

  // Built-in payment screen (used when no live Razorpay keys are configured)
  const [showPayment, setShowPayment] = useState(false)
  const pendingOrderRef = useRef(null) // order created by a payment attempt that hasn't succeeded yet

  // New Address Form Modal / Inline
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  })

  // Opening the form pre-fills name/phone from the profile (user may load after mount)
  const openAddressForm = () => {
    setAddressForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user?.name || '',
      phone: prev.phone || user?.phone || '',
    }))
    setShowAddressForm(true)
  }

  useEffect(() => {
    // Wait for the session check; otherwise a page refresh always bounces to /login
    if (authLoading) return
    if (!user) {
      navigate('/login?redirect=/checkout', { replace: true })
      return
    }

    const loadAddresses = async () => {
      try {
        const { data } = await API.get('/addresses')
        if (data.success) {
          setAddresses(data.data)
          const defaultAddr = data.data.find((a) => a.isDefault) || data.data[0]
          if (defaultAddr) setSelectedAddressId(defaultAddr.id)
        }
      } catch (err) {
        console.error('Failed to load addresses', err)
      } finally {
        setLoadingAddresses(false)
      }
    }

    loadAddresses()
  }, [user, authLoading, navigate])

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    try {
      const { data } = await API.post('/addresses', addressForm)
      if (data.success) {
        setAddresses((prev) => [data.data, ...prev])
        setSelectedAddressId(data.data.id)
        setShowAddressForm(false)
        toast.success('Address saved successfully')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address')
    }
  }

  // Online payment: the server creates a gateway order. Without live Razorpay keys it
  // answers isMock and confirms the payment directly; with keys, Razorpay Checkout opens.
  const payOnline = async (order) => {
    const { data: gatewayRes } = await API.post('/payments/create', { orderId: order.id })
    const gateway = gatewayRes.data

    if (gateway.isMock) {
      await API.post('/payments/verify', { orderId: order.id, isMock: true })
      return
    }

    const Razorpay = await loadRazorpay()
    const response = await new Promise((resolve, reject) => {
      const rzp = new Razorpay({
        key: gateway.key,
        amount: gateway.amount,
        currency: gateway.currency,
        order_id: gateway.id,
        name: 'Shoophy',
        description: `Order #${order.id.slice(0, 8)}`,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone || '' },
        theme: { color: '#2563eb' },
        handler: resolve,
        modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) },
      })
      // The Razorpay window stays open after a failed attempt so the customer can retry
      rzp.on('payment.failed', (resp) => {
        toast.error(resp.error?.description || 'Payment failed. Please try again.')
      })
      rzp.open()
    })

    await API.post('/payments/verify', {
      orderId: order.id,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
    })
  }

  // Create the order on the backend (atomic transaction validates stock, calculates totals)
  const createOrder = async () => {
    const { data } = await API.post('/orders', {
      addressId: selectedAddressId,
      paymentMethod,
      couponCode: coupon?.code,
      notes,
    })
    if (!data.success) throw new Error(data.message || 'Failed to place order')
    return data.data
  }

  // "Pay" on the built-in payment screen. The order is created on the first attempt only,
  // so retrying after a failed payment doesn't try to create a second order.
  const payWithBuiltInScreen = async (channel) => {
    if (!pendingOrderRef.current) pendingOrderRef.current = await createOrder()
    const order = pendingOrderRef.current
    await API.post('/payments/verify', { orderId: order.id, isMock: true, channel })
    pendingOrderRef.current = null
    return order
  }

  const goToOrder = async (order) => {
    setShowPayment(false)
    await refreshCart()
    navigate(`/order-success/${order.id}`)
  }

  const closePaymentScreen = () => {
    const unpaidOrder = pendingOrderRef.current
    pendingOrderRef.current = null
    if (unpaidOrder) {
      // The order was created but its payment failed: show it as "payment pending"
      toast.error('Payment not completed. Your order is waiting for payment.')
      goToOrder(unpaidOrder)
    } else {
      setShowPayment(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a shipping address')
      return
    }

    setPlacingOrder(true)

    if (paymentMethod === 'RAZORPAY') {
      // Ask the server which payment screen to use: Shoophy's own, or Razorpay (live keys)
      let gateway = 'builtin'
      try {
        const { data } = await API.get('/payments/config')
        gateway = data.data?.gateway || 'builtin'
      } catch {
        // fall back to the built-in screen
      }
      if (gateway === 'builtin') {
        pendingOrderRef.current = null
        setShowPayment(true)
        setPlacingOrder(false)
        return
      }
    }

    let order = null
    try {
      order = await createOrder()

      // 2. Handle Payment
      if (paymentMethod === 'RAZORPAY') {
        await payOnline(order)
        toast.success('Payment successful!')
      } else if (paymentMethod === 'COD') {
        toast.success('Order placed with Cash on Delivery!')
      }

      await refreshCart()
      navigate(`/order-success/${order.id}`)
    } catch (err) {
      if (order) {
        // The order exists and the server already emptied the cart; only payment failed.
        toast.error(err.response?.data?.message || err.message || 'Order placed, but payment failed. Payment is still pending.')
        await refreshCart()
        navigate(`/order-success/${order.id}`)
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to process order. Please try again.')
      }
    } finally {
      setPlacingOrder(false)
    }
  }

  if (authLoading || !user || (cartLoading && items.length === 0)) {
    return (
      <div className="flex justify-center py-24" role="status" aria-label="Loading checkout">
        <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-4">Add items to cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white text-xs font-semibold px-5 py-2 rounded-full"
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
        Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left: Address Selection & Payment Methods */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Shipping Address */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Select Delivery Address
                </h3>
              </div>

              {!showAddressForm && (
                <button
                  onClick={openAddressForm}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Address List */}
            {loadingAddresses ? (
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
            ) : addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p>No saved addresses found. Please add a shipping address to proceed.</p>
                <button
                  onClick={openAddressForm}
                  className="mt-3 bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  Add Shipping Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`relative flex flex-col justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                      selectedAddressId === addr.id
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-sm text-slate-900">{addr.fullName}</span>
                      </div>
                      {addr.isDefault && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 mt-2 space-y-0.5 pl-6">
                      <p>{addr.addressLine1}</p>
                      {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="font-semibold text-slate-800 pt-1">Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold uppercase text-slate-700">Add New Shipping Address</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="10-digit Phone Number"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Flat, House no., Building, Apartment"
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                />

                <input
                  type="text"
                  placeholder="Area, Street, Sector, Village (Optional)"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                />

                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="isDefault" className="text-xs text-slate-600">
                    Set as default delivery address
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-lg transition"
                >
                  Save & Use Address
                </button>
              </form>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Choose Payment Method
              </h3>
            </div>

            <div className="space-y-3">
              {/* Option 1: Online Payment */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      Online Payment
                    </span>
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay securely with UPI, credit/debit card or net banking. Your order is confirmed as soon as the payment succeeds.
                  </p>
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <div className="flex-1">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-emerald-600" />
                    Cash on Delivery (COD)
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay with cash or UPI upon courier arrival at your doorstep.
                  </p>
                </div>
              </label>
            </div>

            {/* Delivery Notes */}
            <div className="pt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave with security guard, call before delivery"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({items.length} items)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                    alt={item.product.name}
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                    <p className="text-slate-400">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ₹{Math.round(parseFloat(item.product.price) * (1 - parseFloat(item.product.discount || 0) / 100) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon ({coupon?.code})</span>
                <span className="font-semibold">-₹{Math.round(discountAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCharge === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingCharge}`}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-sm font-extrabold text-slate-900">Final Total</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ₹{Math.round(totalAmount).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder || !selectedAddressId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
          >
            {placingOrder ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <span>Place Order & Pay</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          amount={totalAmount}
          onPay={payWithBuiltInScreen}
          onClose={closePaymentScreen}
          onSuccess={goToOrder}
        />
      )}
    </div>
  )
}

