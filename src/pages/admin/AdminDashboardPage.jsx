import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import API from '../../api/axios'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.data)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="h-64 bg-slate-200/60 rounded-3xl animate-pulse"></div>
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${Math.round(parseFloat(stats?.totalRevenue || 0)).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Registered Customers',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Active Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Overview & Metrics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Live real-time telemetry from your MySQL database
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.title}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{c.title}</span>
                <div className={`p-2.5 rounded-xl ${c.lightColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">{c.value}</p>
            </div>
          )
        })}
      </div>

      {/* Low Stock Alerts & Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Low Stock Inventory Alerts ({stats?.lowStockAlerts || 0})
              </h3>
            </div>
            <Link
              to="/admin/products"
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Manage Inventory
            </Link>
          </div>

          {stats?.lowStockList && stats.lowStockList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium">Product Name</th>
                    <th className="pb-2 font-medium">Stock Left</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.lowStockList.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-mono text-slate-500">{item.product?.sku}</td>
                      <td className="py-2.5 font-bold text-slate-800">{item.product?.name}</td>
                      <td className="py-2.5 font-extrabold text-rose-600">{item.quantity} units</td>
                      <td className="py-2.5">
                        <span className="bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded text-[10px]">
                          Restock Required
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">All products maintain healthy inventory levels.</p>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
            Orders by Status
          </h3>

          <div className="space-y-3">
            {stats?.ordersByStatus && stats.ordersByStatus.length > 0 ? (
              stats.ordersByStatus.map((st) => (
                <div key={st.status} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 uppercase">{st.status}</span>
                  <span className="bg-slate-100 font-extrabold px-2.5 py-1 rounded-full text-slate-800">
                    {st._count.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No orders recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Recent Customer Orders</h3>
          <Link
            to="/admin/orders"
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            View All Orders
          </Link>
        </div>

        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">Order ID</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Items</th>
                  <th className="pb-2 font-medium">Payment</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-mono font-bold text-slate-800">{ord.id.slice(0, 8)}...</td>
                    <td className="py-3 font-semibold text-slate-700">{ord.user?.name}</td>
                    <td className="py-3 text-slate-600">{ord.items?.length || 0} items</td>
                    <td className="py-3 font-bold text-emerald-600">
                      {ord.payment?.method} ({ord.payment?.status})
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4">No recent orders.</p>
        )}
      </div>
    </div>
  )
}

