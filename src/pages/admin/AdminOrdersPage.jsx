import { useState, useEffect } from 'react'
import { Truck, CheckCircle, Clock, XCircle, Search, Edit2 } from 'lucide-react'
import API from '../../api/axios'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 })
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('BlueDart Express')
  const [updating, setUpdating] = useState(false)

  const fetchOrders = async (page = 1, status = statusFilter) => {
    setLoading(true)
    try {
      const { data } = await API.get('/admin/orders', {
        params: { page, limit: 10, status: status || undefined, search: search || undefined },
      })
      if (data.success) {
        setOrders(data.data)
        if (data.meta) setMeta(data.meta)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleOpenStatusModal = (ord) => {
    setSelectedOrder(ord)
    setNewStatus(ord.status)
    setTrackingNumber(ord.shipment?.trackingNumber || '')
    setCarrier(ord.shipment?.carrier || 'BlueDart Express')
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const { data } = await API.patch(`/admin/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
      })
      if (data.success) {
        toast.success(`Order #${selectedOrder.id.slice(0, 8)} updated to ${newStatus}`)
        setSelectedOrder(null)
        fetchOrders(meta.page)
      }
    } catch (err) {
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order Fulfillment & Shipping
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch, track carrier assignments, review payments and customer deliveries
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          {['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st)
                fetchOrders(1, st)
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st || 'All Orders'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Payment</th>
                <th className="p-4 font-bold">Order Status</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No orders matching this filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-slate-800">
                      #{ord.id.slice(0, 8)}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{ord.user?.name}</p>
                      <p className="text-[10px] text-slate-400">{ord.user?.email}</p>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">
                      ₹{Math.round(parseFloat(ord.totalAmount)).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-700">{ord.payment?.method}</span>
                      <span className="block text-[10px] text-emerald-600 font-bold uppercase">
                        {ord.payment?.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-[10px] uppercase ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ord.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-700'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Update Status</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-center">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => fetchOrders(p)}
          />
        </div>
      </div>

      {/* Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          ></div>
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Update Order #{selectedOrder.id.slice(0, 8)}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Customer: {selectedOrder.user?.name}</p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Change Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {newStatus === 'SHIPPED' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Carrier Name
                    </label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BD-8937402"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

