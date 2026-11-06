import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  Flame,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  Star,
  ShieldCheck,
  Truck,
  Zap,
  Tag,
} from 'lucide-react'
import API from '../../api/axios'
import ProductCard from '../../components/common/ProductCard'
import { ProductGridSkeleton } from '../../components/common/Skeleton'

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [trendingProducts, setTrendingProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, featRes, trendRes, newRes, bannerRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products/featured'),
          API.get('/products/trending'),
          API.get('/products/new-arrivals'),
          API.get('/banners'),
        ])

        if (catRes.data.success) setCategories(catRes.data.data)
        if (featRes.data.success) setFeaturedProducts(featRes.data.data)
        if (trendRes.data.success) setTrendingProducts(trendRes.data.data)
        if (newRes.data.success) setNewArrivals(newRes.data.data)
        if (bannerRes.data.success && bannerRes.data.data.length > 0) {
          setBanners(bannerRes.data.data)
        }
      } catch (err) {
        console.error('Failed to load homepage data', err)
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  const defaultBanners = [
    {
      title: 'Next-Gen Audio & Smart Tech',
      highlight: 'Up to 40% OFF',
      subtitle: 'Experience spatial sound, noise cancellation, and high-fidelity curved monitors built for peak performance.',
      buttonText: 'Shop Electronics',
      link: '/products?category=electronics',
      tag: '🔥 TRENDING TECH DEALS',
      accentColor: 'from-blue-600 via-indigo-600 to-violet-800',
      badgeText: 'Top Seller • AeroPulse',
      badgePrice: '₹11,999',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600',
    },
    {
      title: 'Summer Luxury & Linen Styles',
      highlight: 'Flat 25% OFF',
      subtitle: 'Crafted from 100% breathable organic European flax linen and premium tailoring for modern elegance.',
      buttonText: 'Explore Apparel',
      link: '/products?category=men-fashion',
      tag: '✨ NEW SEASON 2026',
      accentColor: 'from-amber-700 via-orange-800 to-slate-950',
      badgeText: 'Pure Flax Linen Shirt',
      badgePrice: '₹2,124',
      image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600',
    },
    {
      title: 'Artisan Living & Ceramic Kitchen',
      highlight: 'Special Festival Drop',
      subtitle: 'Transform your home with handcrafted ceramic sets, barista espresso makers, and Scandinavian decor.',
      buttonText: 'Discover Home Decor',
      link: '/products?category=home-kitchen',
      tag: '🏡 CURATED HOME COLLECTION',
      accentColor: 'from-emerald-800 via-teal-900 to-slate-950',
      badgeText: 'Barista Espresso Machine',
      badgePrice: '₹18,039',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600',
    },
  ]

  const activeBanners = banners.length > 0 ? banners.map((b, i) => ({
    ...defaultBanners[i % defaultBanners.length],
    ...b,
  })) : defaultBanners

  // Auto rotate banners every 6 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [activeBanners.length])

  const cur = activeBanners[currentSlide] || activeBanners[0]

  return (
    <div className="space-y-16 pb-12">
      {/* ─── Ultra Modern Hero Section ────────────────────────────── */}
      <section className="relative mx-3 sm:mx-6 lg:mx-8 mt-3">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800/80">
          {/* Subtle Ambient Radial Glow Blobs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none"></div>

          {/* Background Image with Dynamic Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={cur.image}
              alt={cur.title}
              key={cur.image}
              className="w-full h-full object-cover object-center opacity-30 transform scale-105 transition-all duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent"></div>
          </div>

          {/* Main Hero Content Grid */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:py-24 sm:px-10 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column (Copy + CTA + Trust) */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              {/* Tag / Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md shadow-sm transition">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>{cur.tag || '🔥 SPECIAL OFFER'}</span>
              </div>

              {/* Title with Gradient Accent */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                  {cur.title}{' '}
                  {cur.highlight && (
                    <span className="block bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                      {cur.highlight}
                    </span>
                  )}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl pt-2">
                  {cur.subtitle}
                </p>
              </div>

              {/* CTA Buttons & Coupon Teaser */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={cur.link || '/products'}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{cur.buttonText || 'Shop Collection'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/products?trending=true"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-2xl backdrop-blur-md border border-white/20 transition"
                >
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Trending Deals</span>
                </Link>
              </div>

              {/* Social Proof & Trust Badges */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-white">4.9 / 5</span>
                  <span>(12,000+ reviews)</span>
                </div>

                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-400" />
                  <span>Free Express Delivery above ₹499</span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>100% Genuine Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Right Column (Hero Card Showcase with Glassmorphism Overlays) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src={cur.image}
                  alt={cur.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
                />

                {/* Floating Discount Ribbon */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg">
                  Limited Drop
                </div>

                {/* Glassmorphism Floating Product Highlight Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      Featured Pick
                    </span>
                    <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                      {cur.badgeText || 'Premium Selection'}
                    </h4>
                    <p className="text-xs font-extrabold text-amber-300">
                      {cur.badgePrice || 'Exclusive Price'}
                    </p>
                  </div>
                  <Link
                    to={cur.link || '/products'}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl shadow-md transition"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Controls: Arrows & Indicators */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
              <button
                onClick={() =>
                  setCurrentSlide(
                    (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                  )
                }
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/10 transition"
                title="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-2">
                {activeBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === i ? 'w-8 bg-blue-500 shadow-md shadow-blue-500/50' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    title={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
                }
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/10 transition"
                title="Next Slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Category Navigation Strip under Hero.
            Outer div scrolls sideways on small screens; the inner w-max + mx-auto row is
            centred when it fits and still scrolls from the first link when it doesn't. */}
        <div className="mt-4 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex w-max mx-auto items-center gap-2 text-xs font-semibold">
          <Link
            to="/products"
            className="shrink-0 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xs hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Tag className="h-3.5 w-3.5 text-blue-400" />
            <span>All Departments</span>
          </Link>
          <Link
            to="/products?featured=true"
            className="shrink-0 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Featured Picks</span>
          </Link>
          <Link
            to="/products?category=electronics"
            className="shrink-0 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition"
          >
            🎧 Electronics & Audio
          </Link>
          <Link
            to="/products?category=men-fashion"
            className="shrink-0 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition"
          >
            👔 Men's Fashion
          </Link>
          <Link
            to="/products?category=women-fashion"
            className="shrink-0 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition"
          >
            👗 Women's Style
          </Link>
          <Link
            to="/products?category=home-kitchen"
            className="shrink-0 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition"
          >
            🏡 Home & Living
          </Link>
          <Link
            to="/products?category=footwear"
            className="shrink-0 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:border-blue-400 hover:text-blue-600 transition"
          >
            👟 Sneakers & Boots
          </Link>
          <Link
            to="/products?trending=true"
            className="shrink-0 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl hover:bg-rose-100 transition flex items-center gap-1.5"
          >
            <Flame className="h-3.5 w-3.5 text-rose-600" />
            <span>Flash Deals</span>
          </Link>
        </div>
        </div>
      </section>

      {/* Featured Categories Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore our wide variety of top-tier selections
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-slate-100 mb-3 border-2 border-transparent group-hover:border-blue-500 transition-all">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 line-clamp-1 transition">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {cat._count?.products || 0} Items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Trending Now
              </h2>
              <p className="text-sm text-slate-500">
                Most popular products handpicked this week
              </p>
            </div>
          </div>
          <Link
            to="/products?trending=true"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>See More</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner Mid-page */}
      {banners[1] && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="max-w-lg space-y-4">
              <span className="bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Limited Time Offer
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {banners[1].title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {banners[1].subtitle}
              </p>
              <Link
                to={banners[1].link || '/products'}
                className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 py-3 rounded-full text-sm shadow-md transition"
              >
                <span>{banners[1].buttonText || 'Claim Offer'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="w-full md:w-1/2 aspect-video max-w-md rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={banners[1].image}
                alt={banners[1].title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Editor's Choice & Featured
              </h2>
              <p className="text-sm text-slate-500">
                Top rated selections recommended by experts
              </p>
            </div>
          </div>
          <Link
            to="/products?featured=true"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>See More</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Fresh Arrivals
              </h2>
              <p className="text-sm text-slate-500">
                Brand new products added to our catalog
              </p>
            </div>
          </div>
          <Link
            to="/products?sortBy=newest"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

