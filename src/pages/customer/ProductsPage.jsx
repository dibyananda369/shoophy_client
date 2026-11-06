import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Star,
  ChevronDown,
} from 'lucide-react'
import API from '../../api/axios'
import ProductCard from '../../components/common/ProductCard'
import { ProductGridSkeleton } from '../../components/common/Skeleton'
import Pagination from '../../components/common/Pagination'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Filter states
  const categoryParam = searchParams.get('category') || ''
  const searchParam = searchParams.get('search') || ''
  const sortByParam = searchParams.get('sortBy') || 'newest'
  const minPriceParam = searchParams.get('minPrice') || ''
  const maxPriceParam = searchParams.get('maxPrice') || ''
  const minRatingParam = searchParams.get('minRating') || ''
  const pageParam = parseInt(searchParams.get('page') || '1', 10)

  const [searchQuery, setSearchQuery] = useState(searchParam)
  const [minPrice, setMinPrice] = useState(minPriceParam)
  const [maxPrice, setMaxPrice] = useState(maxPriceParam)

  // Fetch categories
  useEffect(() => {
    API.get('/categories')
      .then((res) => {
        if (res.data.success) setCategories(res.data.data)
      })
      .catch((err) => console.error(err))
  }, [])

  // Fetch products whenever search params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams(searchParams)
        if (!queryParams.has('limit')) queryParams.set('limit', '12')

        const { data } = await API.get(`/products?${queryParams.toString()}`)
        if (data.success) {
          setProducts(data.data)
          if (data.meta) setMeta(data.meta)
        }
      } catch (err) {
        console.error('Failed to fetch products', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams])

  // Apply several param changes in ONE URL update (separate calls would each start
  // from the same stale searchParams and overwrite one another)
  const updateFilters = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    next.set('page', '1') // reset page on filter change
    setSearchParams(next)
  }

  const updateFilter = (key, value) => updateFilters({ [key]: value })

  const handlePriceApply = (e) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (minPrice) next.set('minPrice', minPrice)
    else next.delete('minPrice')
    if (maxPrice) next.set('maxPrice', maxPrice)
    else next.delete('maxPrice')
    next.set('page', '1')
    setSearchParams(next)
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams())
    setSearchQuery('')
    setMinPrice('')
    setMaxPrice('')
  }

  const activeFilterCount = [
    categoryParam,
    searchParam,
    minPriceParam,
    maxPriceParam,
    minRatingParam,
  ].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {categoryParam
              ? categories.find((c) => c.slug === categoryParam)?.name || 'Products'
              : searchParam
              ? `Results for "${searchParam}"`
              : 'All Products'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {products.length} of {meta.total} products
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortByParam}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Sort by: Newest Arrivals</option>
              <option value="popular">Sort by: Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              <span>Filter Products</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Categories</h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition ${
                  !categoryParam
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition ${
                    categoryParam === cat.slug
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {cat._count?.products || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Price Range (₹)</h4>
            <form onSubmit={handlePriceApply} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 rounded-lg transition"
              >
                Apply Price
              </button>
            </form>
          </div>

          {/* Rating Filter */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Customer Rating</h4>
            <div className="space-y-2">
              {[4, 3, 2].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    updateFilter(
                      'minRating',
                      minRatingParam === String(rating) ? '' : String(rating)
                    )
                  }
                  className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded-lg transition ${
                    minRatingParam === String(rating)
                      ? 'bg-amber-50 text-amber-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span>{rating} Stars & above</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-slate-400 font-medium">Applied:</span>
              {categoryParam && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                  Category: {categoryParam}
                  <button onClick={() => updateFilter('category', '')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchParam && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                  Query: {searchParam}
                  <button onClick={() => updateFilter('search', '')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(minPriceParam || maxPriceParam) && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                  ₹{minPriceParam || '0'} - ₹{maxPriceParam || 'Any'}
                  <button
                    aria-label="Remove price filter"
                    onClick={() => {
                      updateFilters({ minPrice: '', maxPrice: '' })
                      setMinPrice('')
                      setMaxPrice('')
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minRatingParam && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                  {minRatingParam}★ & above
                  <button onClick={() => updateFilter('minRating', '')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
              <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                We couldn't find any products matching your filters. Try resetting your search or price criteria.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={(p) => updateFilter('page', String(p))}
              />
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          ></div>
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <span className="font-bold text-slate-900">Filter Products</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">Categories</h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        updateFilter('category', cat.slug)
                        setMobileFilterOpen(false)
                      }}
                      className="block w-full text-left text-xs py-1.5 px-2 rounded-lg hover:bg-slate-100"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  clearAllFilters()
                  setMobileFilterOpen(false)
                }}
                className="w-full bg-slate-100 text-slate-700 text-xs font-semibold py-2.5 rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

