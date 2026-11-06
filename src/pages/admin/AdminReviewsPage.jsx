import { useState, useEffect } from 'react'
import { Star, CheckCircle, XCircle } from 'lucide-react'
import API from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/admin/reviews')
      if (data.success) setReviews(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleModerate = async (id, isApproved) => {
    try {
      const { data } = await API.patch(`/admin/reviews/${id}/moderate`, { isApproved })
      if (data.success) {
        toast.success(`Review ${isApproved ? 'approved' : 'rejected'}`)
        fetchReviews()
      }
    } catch (err) {
      toast.error('Failed to moderate review')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Review Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor customer feedback, ratings and moderate abusive reviews
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="p-4 font-bold">Product</th>
              <th className="p-4 font-bold">Author</th>
              <th className="p-4 font-bold">Rating</th>
              <th className="p-4 font-bold">Review Content</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  Loading reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  No reviews submitted yet.
                </td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-slate-900 max-w-[150px] truncate">
                    {rev.product?.name}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{rev.user?.name}</p>
                    <p className="text-[10px] text-slate-400">{rev.user?.email}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < rev.rating ? 'fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    {rev.title && <p className="font-bold text-slate-800">{rev.title}</p>}
                    <p className="text-slate-500 text-[11px] line-clamp-2">{rev.body}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        rev.isApproved
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {rev.isApproved ? 'Approved' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleModerate(rev.id, !rev.isApproved)}
                      className={`font-bold text-xs px-3 py-1.5 rounded-xl transition ${
                        rev.isApproved
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {rev.isApproved ? 'Hide Review' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

