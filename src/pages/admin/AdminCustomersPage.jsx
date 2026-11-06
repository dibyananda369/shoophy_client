import { useState, useEffect } from 'react'
import { Users, Search, UserX, UserCheck } from 'lucide-react'
import API from '../../api/axios'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCustomers = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await API.get('/admin/customers', {
        params: { page, limit: 10, search: search || undefined },
      })
      if (data.success) {
        setCustomers(data.data)
        if (data.meta) setMeta(data.meta)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await API.patch(`/admin/customers/${id}/toggle-status`)
      if (data.success) {
        toast.success(data.message)
        fetchCustomers(meta.page)
      }
    } catch (err) {
      toast.error('Failed to change customer status')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Customer Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review buyer accounts, purchase activity, and account status
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="p-4 font-bold">Customer Name</th>
              <th className="p-4 font-bold">Email</th>
              <th className="p-4 font-bold">Phone</th>
              <th className="p-4 font-bold">Orders Placed</th>
              <th className="p-4 font-bold">Account Status</th>
              <th className="p-4 font-bold text-right">Toggle Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="p-4 text-slate-600">{c.email}</td>
                  <td className="p-4 text-slate-500">{c.phone || '—'}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800">
                      {c._count?.orders || 0} orders
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        c.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id)}
                      className={`font-bold text-xs px-3 py-1.5 rounded-xl transition ${
                        c.isActive
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-4 border-t border-slate-100 flex justify-center">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => fetchCustomers(p)}
          />
        </div>
      </div>
    </div>
  )
}

