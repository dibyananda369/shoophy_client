import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Share2,
} from 'lucide-react'
import API from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import ProductCard from '../../components/common/ProductCard'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const { data } = await API.get(`/products/${id}`)
        if (data.success) {
          setProduct(data.data)
          setSelectedImage(0)

          // Load related products
          const relRes = await API.get(`/products/${data.data.id}/related`)
          if (relRes.data.success) setRelated(relRes.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch product', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
    window.scrollTo(0, 0)
  }, [id])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to submit a review')
      return
    }
    setSubmittingReview(true)
    try {
      const { data } = await API.post(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
      })
      if (data.success) {
        toast.success('Thank you! Your review has been submitted.')
        setReviewTitle('')
        setReviewBody('')
        // Refresh product to show new review
        const pRes = await API.get(`/products/${product.id}`)
        if (pRes.data.success) setProduct(pRes.data.data)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-24 bg-slate-200 rounded w-full"></div>
            <div className="h-12 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested product does not exist or has been discontinued.
        </p>
        <Link
          to="/products"
          className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm inline-block"
        >
          Back to Products
        </Link>
      </div>
    )
  }

  const images = product.images?.length > 0
    ? product.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800']

  const price = parseFloat(product.price)
  const discount = parseFloat(product.discount || 0)
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price
  const stock = product.inventory?.quantity ?? 0
  const isWishlisted = isInWishlist(product.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-blue-600">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {Math.round(discount)}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === i ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="space-y-6">
          <div>
            {product.brand && (
              <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">
                {product.brand}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-900">
                  {Number(product.rating || 4.5).toFixed(1)}
                </span>
                <span className="text-[11px] text-amber-700">
                  ({product.reviews?.length || product.reviewCount || 0} reviews)
                </span>
              </div>
              <span className="text-xs text-slate-400">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
            </span>
            {discount > 0 && (
              <>
                <span className="text-base text-slate-400 line-through">
                  ₹{Math.round(price).toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  Save ₹{Math.round(price - discountedPrice).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>

          {/* Stock Status Badge */}
          <div className="flex items-center gap-2">
            {stock > 10 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle className="h-3.5 w-3.5" /> In Stock ({stock} units ready to dispatch)
              </span>
            ) : stock > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                <AlertCircle className="h-3.5 w-3.5" /> Low Stock! Only {stock} units left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                <AlertCircle className="h-3.5 w-3.5" /> Currently Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-slate-600 leading-relaxed border-t border-b border-slate-200 py-4">
            <p>{product.description}</p>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || stock === 0}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 rounded-l-xl transition"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-slate-900 min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={quantity >= stock || stock === 0}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 rounded-r-xl transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => addToCart(product.id, quantity)}
                disabled={stock === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-center ${
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 text-center">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <Truck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-800">Free Shipping</p>
              <p className="text-[10px] text-slate-400">Above ₹499</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-800">100% Genuine</p>
              <p className="text-[10px] text-slate-400">Authentic brand</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <RotateCcw className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-800">7 Days Return</p>
              <p className="text-[10px] text-slate-400">Hassle free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-12 border-t border-slate-200 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Customer Reviews & Ratings
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Real feedback from verified purchasers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-4xl font-extrabold text-slate-900">
              {Number(product.rating || 4.5).toFixed(1)}
            </div>
            <div>
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating || 5) ? 'fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Based on {product.reviews?.length || 0} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Write a Review Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Write a Product Review</h3>
          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= reviewRating ? 'fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Review headline (e.g. Superb quality and fast delivery)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Write your detailed review about durability, performance, fit, etc..."
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500">
              Please <Link to="/login" className="text-blue-600 font-semibold underline">login</Link> to post a review.
            </p>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rev.user?.avatar ? (
                      <img
                        src={rev.user.avatar}
                        alt={rev.user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {rev.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.user?.name || 'Verified Buyer'}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating ? 'fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.title && (
                  <h4 className="text-sm font-bold text-slate-900">{rev.title}</h4>
                )}
                <p className="text-xs text-slate-600 leading-relaxed">{rev.body}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              No customer reviews yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-slate-200 space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

