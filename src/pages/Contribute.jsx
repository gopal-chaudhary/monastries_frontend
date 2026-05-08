import { useState } from 'react'
import { toast } from 'react-toastify'
import { api, getErrorMessage } from '../api'
import { validateContribution } from '../utils/validation'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Send } from 'lucide-react'

export default function Contribute() {
  const [form, setForm] = useState({
    monasteryName: '',
    location: '',
    region: '',
    description: '',
    established: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
    additionalInfo: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const coordinates = {
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    }
    const errs = validateContribution({
      ...form,
      coordinates: form.latitude && form.longitude ? coordinates : null,
    })
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error('Please fix the errors below.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/contributions/submit', {
        monasteryName: form.monasteryName.trim(),
        location: form.location.trim(),
        region: form.region.trim(),
        description: form.description.trim(),
        established: form.established ? Number(form.established) : undefined,
        coordinates: { latitude: coordinates.latitude, longitude: coordinates.longitude },
        imageUrl: form.imageUrl.trim() || undefined,
        additionalInfo: form.additionalInfo.trim() || undefined,
      })
      toast.success(data.message || 'Contribution submitted!')
      setForm({ monasteryName: '', location: '', region: '', description: '', established: '', latitude: '', longitude: '', imageUrl: '', additionalInfo: '' })
      setErrors({})
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50 mb-2">Contribute a monastery</h1>
          <p className="text-stone-400 text-sm mb-6">Submit a monastery that’s not yet in our database. We’ll review and add it.</p>
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Monastery name *</label>
              <input name="monasteryName" value={form.monasteryName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="e.g. Rumtek Monastery" />
              {errors.monasteryName && <p className="text-xs text-rose-400 mt-1">{errors.monasteryName}</p>}
            </div>
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Location *</label>
              <input name="location" value={form.location} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="e.g. Rumtek, East Sikkim" />
              {errors.location && <p className="text-xs text-rose-400 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Region *</label>
              <select name="region" value={form.region} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                <option value="">Select region</option>
                <option value="East Sikkim">East Sikkim</option>
                <option value="West Sikkim">West Sikkim</option>
                <option value="North Sikkim">North Sikkim</option>
                <option value="South Sikkim">South Sikkim</option>
              </select>
              {errors.region && <p className="text-xs text-rose-400 mt-1">{errors.region}</p>}
            </div>
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none" />
              {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Established year (optional)</label>
              <input name="established" type="number" value={form.established} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="e.g. 1740" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Latitude *</label>
                <input name="latitude" value={form.latitude} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="e.g. 27.2983" />
              </div>
              <div>
                <label className="block text-sm text-amber-200/90 mb-1">Longitude *</label>
                <input name="longitude" value={form.longitude} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="e.g. 88.5714" />
              </div>
            </div>
            {errors.coordinates && <p className="text-xs text-rose-400">{errors.coordinates}</p>}
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Image URL (optional)</label>
              <input name="imageUrl" type="url" value={form.imageUrl} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Additional info (optional)</label>
              <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition disabled:opacity-60 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit for review'}
            </button>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
