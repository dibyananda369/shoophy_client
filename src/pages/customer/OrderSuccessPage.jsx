import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle,
  AlertCircle,
  Package,
  ArrowRight,
  Truck,
  MapPin,
  CreditCard,
} from 'lucide-react'
import API from '../../api/axios'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`)
        if (data.success) {
          setOrder(data.data)
        }
      } catch (err) {
        console.error('Failed to load order', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center animate-pulse">
        <div className="h-16 w-16 bg-slate-200 rounded-full mx-auto mb-4"></div>
        <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">We couldn&apos;t load this order</h1>
        <p className="text-sm text-slate-500">
          It may not exist, or you may need to sign in again. Your orders are listed in your account.
        </p>
        <Link
          to="/dashboard?tab=orders"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full text-xs"
        >
          <Package className="h-4 w-4" />
          <span>Go to My Orders</span>
        </Link>
      </div>
    )
  }

  const isPaid = order.payment?.status === 'PAID'
  const isCod = order.payment?.method === 'COD'
  const paymentPending = !isPaid && !isCod

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-lg space-y-6">
        <div
          className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto shadow-inner ${
            paymentPending ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
          }`}
        >
          {paymentPending ? <AlertCircle className="h-10 w-10" /> : <CheckCircle className="h-10 w-10" />}
        </div>

        <div>
          <span
            className={`text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full ${
              paymentPending ? 'text-amber-700 bg-amber-50' : 'text-emerald-600 bg-emerald-50'
            }`}
          >
            {isPaid ? 'Order Confirmed' : isCod ? 'Order Placed' : 'Payment Pending'}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-3">
            {paymentPending ? 'Your order is awaiting payment' : 'Thank you for your order!'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Your order <strong className="text-slate-800">#{order.id}</strong>{' '}
            {paymentPending
              ? 'was created, but we have not received the payment yet.'
              : isCod
                ? 'has been received. Please pay the amount below on delivery.'
                : 'has been received and is being processed.'}
          </p>
        </div>

        {/* Order Details Card */}
        {order && (
          <div className="bg-slate-50 rounded-2xl p-5 text-left text-xs space-y-3 border border-slate-200/70">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Order ID</span>
              <span className="font-mono font-bold text-slate-800">{order.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Status</span>
              <span className={`font-bold uppercase ${paymentPending ? 'text-amber-600' : 'text-emerald-600'}`}>{order.status}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Payment</span>
              <span className="font-bold text-slate-800">
                {isCod ? 'Cash on Delivery' : 'Online Payment'} ({order.payment?.status})
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">{isPaid ? 'Total Paid' : 'Amount Due'}</span>
              <span className="font-extrabold text-sm text-slate-900">
                ₹{Math.round(parseFloat(order.totalAmount)).toLocaleString('en-IN')}
              </span>
            </div>
            {order.address && (
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">Delivering To:</span>
                <p className="font-bold text-slate-800">{order.address.fullName}</p>
                <p className="text-slate-600">{order.address.addressLine1}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/dashboard?tab=orders"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full text-xs shadow-md transition inline-flex items-center justify-center gap-2"
          >
            <Package className="h-4 w-4" />
            <span>Track in My Orders</span>
          </Link>
          <Link
            to="/products"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3 rounded-full text-xs transition inline-flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

