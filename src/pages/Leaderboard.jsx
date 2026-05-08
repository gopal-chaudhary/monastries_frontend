import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { api, getErrorMessage } from '../api'
import { Layout } from '../components/Layout'
import { Award, Trophy } from 'lucide-react'

export default function Leaderboard() {
  const [list, setList] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/contributions/leaderboard?limit=20'),
      api.get('/contributions/stats').catch(() => ({ data: {} })),
    ])
      .then(([lb, st]) => {
        setList(lb.data.data || [])
        setStats(st.data.data || null)
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-amber-50 mb-2 flex items-center gap-2"><Trophy className="w-8 h-8" /> Top contributors</h1>
        <p className="text-stone-400 text-sm mb-6">Community members who have contributed monasteries and earned points.</p>
        {stats && (
          <div className="glass rounded-xl p-4 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div><p className="text-2xl font-heading font-bold text-amber-400">{stats.totalContributions ?? 0}</p><p className="text-xs text-stone-500">Total contributions</p></div>
            <div><p className="text-2xl font-heading font-bold text-amber-400">{stats.pending ?? 0}</p><p className="text-xs text-stone-500">Pending</p></div>
            <div><p className="text-2xl font-heading font-bold text-amber-400">{stats.approved ?? 0}</p><p className="text-xs text-stone-500">Approved</p></div>
            <div><p className="text-2xl font-heading font-bold text-amber-400">{stats.totalPointsAwarded ?? 0}</p><p className="text-xs text-stone-500">Points awarded</p></div>
          </div>
        )}
        {loading && <p className="text-stone-400">Loading...</p>}
        {!loading && list.length === 0 && <p className="text-stone-400">No contributors yet.</p>}
        {!loading && list.length > 0 && (
          <ul className="space-y-3">
            {list.map((u, i) => (
              <li key={u._id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/30 text-amber-200 font-bold text-sm">{i + 1}</span>
                  <div>
                    <p className="font-medium text-amber-100">{u.firstName} {u.lastName}</p>
                    <p className="text-stone-400 text-xs">Contributions: {u.contributionsCount ?? 0} · Badges: {(u.badges || []).join(', ') || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Award className="w-4 h-4" /> <span className="font-semibold">{u.contributionPoints ?? 0}</span> pts
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
