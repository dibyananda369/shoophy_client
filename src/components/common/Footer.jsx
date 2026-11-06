import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-20 border-t border-slate-800">
      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="flex items-center sm:items-start gap-4 flex-col sm:flex-row">
            <div className="p-3 bg-slate-800 rounded-xl text-blue-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Free Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">
                On all eligible orders above ₹499
              </p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-4 flex-col sm:flex-row">
            <div className="p-3 bg-slate-800 rounded-xl text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Secure Checkout</h4>
              <p className="text-xs text-slate-400 mt-1">
                100% encrypted & secure payments
              </p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-4 flex-col sm:flex-row">
            <div className="p-3 bg-slate-800 rounded-xl text-amber-400">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-1">
                Hassle-free 7-day replacement policy
              </p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-4 flex-col sm:flex-row">
            <div className="p-3 bg-slate-800 rounded-xl text-purple-400">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">24/7 Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-1">
                Prompt help via email and hotline
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl text-white">
                Shoo<span className="text-blue-500">phy</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your premier e-commerce destination for curated electronics, high-end fashion, home essentials, and lifestyle accessories. Designed with passion for performance and reliability.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Shoophy Tech Park, Bangalore, Karnataka 560001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                <span>+91 9337614754</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                <span>support@shoophy.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-blue-400 transition">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-blue-400 transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 transition">
                  Customer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h5 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Popular Categories
            </h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/products?category=electronics" className="hover:text-blue-400 transition">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=men-fashion" className="hover:text-blue-400 transition">
                  Men's Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?category=women-fashion" className="hover:text-blue-400 transition">
                  Women's Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-kitchen" className="hover:text-blue-400 transition">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link to="/products?category=footwear" className="hover:text-blue-400 transition">
                  Footwear Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Newsletter
            </h5>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe for exclusive coupon codes, weekly drops, and flash sales.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-xs transition"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center sm:flex sm:justify-between sm:text-left text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Shoophy Technologies Inc. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">
          Crafted with <span className="text-rose-500">❤️</span> by <span className="text-white font-semibold">Krishna Kumari</span>
        </p>
      </div>
    </footer>
  )
}

