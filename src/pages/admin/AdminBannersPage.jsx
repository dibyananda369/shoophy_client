import { useState, useEffect } from 'react'
import { Plus, Image as ImageIcon, Trash2, X, ExternalLink } from 'lucide-react'
import API from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [image, setImage] = useState('')
  const [link, setLink] = useState('/products')
  const [buttonText, setButtonText] = useState('Shop Now')
  const [order, setOrder] = useState('1')
  const [submitting, setSubmitting] = useState(false)

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/admin/banners')
      if (data.success) setBanners(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await API.post('/admin/banners', {
        title,
        subtitle,
        image,
        link,
        buttonText,
        order: parseInt(order, 10),
      })
      if (data.success) {
        toast.success('Banner added successfully')
        setShowModal(false)
        setTitle('')
        setSubtitle('')
        setImage('')
        fetchBanners()
      }
    } catch (err) {
      toast.error('Failed to create banner')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return
    try {
      await API.delete(`/admin/banners/${id}`)
      toast.success('Banner removed')
      fetchBanners()
    } catch (err) {
      toast.error('Failed to remove banner')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Homepage Hero Banners
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage carousel hero graphics, seasonal promotion cards, and call-to-actions
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-xs text-slate-400">Loading banners...</p>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Priority: #{b.order}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1">
                <h4 className="font-extrabold text-sm text-slate-900">{b.title}</h4>
                {b.subtitle && <p className="text-xs text-slate-500 line-clamp-2">{b.subtitle}</p>}
                <div className="flex items-center gap-2 text-[11px] text-blue-600 font-semibold pt-1">
                  <span>CTA: {b.buttonText || 'Shop Now'}</span>
                  <span>({b.link})</span>
                </div>
              </div>

              <div className="p-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Banner</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-base text-slate-900">Add Promotional Banner</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Luxury Drops"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Up to 40% OFF on high-fidelity audio"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link Destination</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Order Priority</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
                >
                  {submitting ? 'Saving...' : 'Add Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

