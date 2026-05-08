import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BookOpen, ExternalLink, Hotel, MapPin, ArrowLeft, Sparkles } from 'lucide-react'
import { api, getErrorMessage } from '../api'
import { Layout } from '../components/Layout'

async function fetchWikiPageTitle(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json&origin=*`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to search Wikipedia')
  const data = await res.json()
  return data?.[1]?.[0] || null
}

async function fetchWikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Failed to load Wikipedia summary')
  return await res.json()
}

export default function MonasteryWiki() {
  const { id } = useParams()
  const [monastery, setMonastery] = useState(null)
  const [travelGuide, setTravelGuide] = useState(null)
  const [wiki, setWiki] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wikiLoading, setWikiLoading] = useState(false)

  const wikiQuery = useMemo(() => {
    if (!monastery?.name) return null
    const base = monastery.name
    // Bias search toward the obvious Wikipedia page
    return base.toLowerCase().includes('monastery') ? base : `${base} monastery`
  }, [monastery])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data } = await api.get(`/monasteries/${id}`)
        if (!cancelled) setMonastery(data.data)
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) load()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!id || !monastery) return
    let cancelled = false
    api.get(`/monasteries/${id}/travel-guide`)
      .then(({ data }) => { if (!cancelled) setTravelGuide(data.data) })
      .catch(() => { if (!cancelled) setTravelGuide(null) })
    return () => { cancelled = true }
  }, [id, monastery])

  useEffect(() => {
    if (!wikiQuery) return
    let cancelled = false
    async function loadWiki() {
      setWikiLoading(true)
      try {
        const title = await fetchWikiPageTitle(wikiQuery)
        if (!title) throw new Error('No Wikipedia page found')
        const summary = await fetchWikiSummary(title)
        if (!cancelled) setWiki(summary)
      } catch (err) {
        if (!cancelled) {
          setWiki(null)
          toast.error(err?.message || 'Failed to load Wikipedia details')
        }
      } finally {
        if (!cancelled) setWikiLoading(false)
      }
    }
    loadWiki()
    return () => { cancelled = true }
  }, [wikiQuery])

  if (loading || !monastery) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="glass rounded-2xl p-6">
            <p className="text-stone-400 text-sm">Loading monastery details...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const wikiUrl = wiki?.content_urls?.desktop?.page || (wiki?.title ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.title.replace(/ /g, '_'))}` : null)
  const heroImage = wiki?.thumbnail?.source || monastery.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200'

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to={`/monastery/${id}`} className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200">
            <ArrowLeft className="w-4 h-4" />
            Back to monastery
          </Link>
          <span className="text-xs text-stone-500">Powered by Wikipedia</span>
        </div>

        <div className="rounded-2xl overflow-hidden bg-stone-900/60 border border-amber-900/30 mb-8">
          <div className="relative aspect-[21/9] sm:aspect-[3/1]">
            <img src={heroImage} alt={wiki?.title || monastery.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/90 text-stone-900 text-xs font-semibold">{monastery.region}</span>
              <span className="flex items-center gap-1 text-amber-200/90 text-sm"><MapPin className="w-4 h-4" /> {monastery.location}</span>
              <span className="flex items-center gap-1 text-amber-200/90 text-sm"><BookOpen className="w-4 h-4" /> Wikipedia</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-50">
              {wiki?.title || monastery.name}
            </h1>
            <p className="text-stone-400 mt-2">{monastery.description}</p>

            <div className="mt-6 glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="font-heading text-lg font-bold text-amber-50">Wikipedia overview</h2>
              </div>

              {wikiLoading && <p className="text-stone-400 text-sm">Loading Wikipedia details...</p>}
              {!wikiLoading && wiki && (
                <>
                  <p className="text-stone-200 leading-relaxed">{wiki.extract || 'No summary available.'}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {wikiUrl && (
                      <a
                        href={wikiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-950/60 border border-amber-900/40 text-amber-200 hover:bg-stone-950/80 hover:border-amber-500/40 transition"
                      >
                        Read on Wikipedia <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {wiki?.description && (
                      <span className="px-3 py-2 rounded-xl bg-amber-900/30 border border-amber-900/40 text-amber-100 text-sm">
                        {wiki.description}
                      </span>
                    )}
                  </div>
                </>
              )}
              {!wikiLoading && !wiki && (
                <p className="text-stone-400 text-sm">
                  Wikipedia details not available for this monastery.
                </p>
              )}
            </div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="font-heading text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
            <Hotel className="w-5 h-5" /> Hotels nearby
          </h2>

          {travelGuide?.recommendedHotel && (
            <div className="glass rounded-2xl p-6 mb-4">
              <p className="text-amber-100 font-medium">Recommended stay: {travelGuide.recommendedHotel.name}</p>
              <p className="text-stone-400 text-sm mt-1">{travelGuide.recommendedHotel.reason}</p>
            </div>
          )}

          {travelGuide?.hotels?.length ? (
            <div className="glass rounded-2xl p-6">
              <ul className="space-y-3">
                {travelGuide.hotels.slice(0, 10).map((h, i) => (
                  <li key={i} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-amber-100/90 font-medium">{h.name}</p>
                      <p className="text-stone-400 text-sm">
                        {h.address || '—'} {h.distance?.text ? `· ${h.distance.text}` : ''} {h.rating ? `· ${h.rating}/5` : ''}
                      </p>
                    </div>
                    {h.map && (
                      <a
                        href={h.map}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 px-3 py-2 rounded-xl bg-stone-950/60 border border-amber-900/40 text-amber-200 hover:bg-stone-950/80 hover:border-amber-500/40 transition text-sm"
                      >
                        Open map <ExternalLink className="w-4 h-4 inline" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-stone-500 mt-4">Tip: distances and availability can change—always verify before booking.</p>
            </div>
          ) : (
            <p className="text-stone-500 text-sm">No hotel data available for this monastery yet.</p>
          )}
        </section>
      </div>
    </Layout>
  )
}

