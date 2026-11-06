import { Link } from 'react-router-dom'
import { Star, Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const primaryImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'

  const price = parseFloat(product.price)
  const discount = parseFloat(product.discount || 0)
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price
  const isWishlisted = isInWishlist(product.id)
  const inStock = (product.inventory?.quantity ?? 10) > 0

  return (
    <div className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full">
      {/* Badges & Wishlist Button */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          {discount > 0 && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {Math.round(discount)}% OFF
            </span>
          )}
          {product.isTrending && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              TRENDING
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product.id)
          }}
          className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition shadow-xs ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link
        to={`/products/${product.slug || product.id}`}
        className="block relative aspect-square overflow-hidden bg-slate-100"
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="truncate">{product.category?.name || 'General'}</span>
            {product.brand && <span className="font-medium text-slate-500 truncate">{product.brand}</span>}
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.slug || product.id}`}
            className="block font-semibold text-slate-900 text-sm hover:text-blue-600 line-clamp-2 transition mb-2"
          >
            {product.name}
          </Link>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {Number(product.rating || 4.5).toFixed(1)}
            </span>
            <span className="text-[11px] text-slate-400">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Pricing & Cart Action */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-slate-900">
                  ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
                </span>
                {discount > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{Math.round(price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => addToCart(product.id, 1)}
              disabled={!inStock}
              className={`p-2 rounded-xl transition flex items-center justify-center shadow-xs ${
                inStock
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="Add to Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

