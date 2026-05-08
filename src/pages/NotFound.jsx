import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Home, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center">
        <p className="font-heading text-6xl sm:text-8xl font-bold text-amber-500/30">404</p>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50 mt-4">Page not found</h1>
        <p className="text-stone-400 mt-2">The path you’re looking for doesn’t exist or has been moved.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-stone-900 font-semibold hover:brightness-110 transition">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link to="/explore" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-amber-700/50 text-amber-100 font-medium hover:bg-amber-900/30 transition">
            <Compass className="w-4 h-4" /> Explore monasteries
          </Link>
        </div>
      </div>
    </Layout>
  )
}
