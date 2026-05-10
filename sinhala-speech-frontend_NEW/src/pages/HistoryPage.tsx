import { useEffect, useState } from 'react'
import api from '../api'
import PageHeader from '../components/PageHeader'
import ScoreRing from '../components/ScoreRing'
import { Clock, TrendingUp, Award, Search, Filter } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'

interface Session {
  exercise_title: string
  score: number
  created_at: string
  difficulty?: string
}

interface ProgressData {
  progress: { best_score: number; avg_score: number; total_sessions: number } | null
  history: Session[]
}

const scoreColor = (s: number) =>
  s >= 0.7 ? '#14b8a6' : s >= 0.4 ? '#f59e0b' : '#ef4444'

const scoreTextColor = (s: number) =>
  s >= 0.7 ? 'text-teal-400' : s >= 0.4 ? 'text-amber-400' : 'text-red-400'

const scoreBg = (s: number) =>
  s >= 0.7 ? 'bg-teal-500/10 border-teal-500/20' : s >= 0.4 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-3 py-2 text-xs">
        <p className="text-white/50 truncate max-w-32">{label}</p>
        <p className="font-bold" style={{ color: scoreColor(payload[0].value) }}>
          {Math.round(payload[0].value * 100)}%
        </p>
      </div>
    )
  }
  return null
}

export default function HistoryPage() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'great' | 'ok' | 'poor'>('all')

  useEffect(() => {
    api.get<ProgressData>('/speech/progress')
      .then(r => setData(r.data))
      .catch(() => {
        setData({
          progress: { best_score: 0.88, avg_score: 0.70, total_sessions: 8 },
          history: [
            { exercise_title: 'ආයුබෝවන්', score: 0.88, created_at: new Date().toISOString(), difficulty: 'easy' },
            { exercise_title: 'ස්තූතියි', score: 0.72, created_at: new Date(Date.now() - 86400000).toISOString(), difficulty: 'medium' },
            { exercise_title: 'කෝප්ප', score: 0.55, created_at: new Date(Date.now() - 172800000).toISOString(), difficulty: 'easy' },
            { exercise_title: 'ශ්‍රී ලංකාව', score: 0.41, created_at: new Date(Date.now() - 259200000).toISOString(), difficulty: 'hard' },
            { exercise_title: 'ගෙදර', score: 0.80, created_at: new Date(Date.now() - 345600000).toISOString(), difficulty: 'easy' },
            { exercise_title: 'රෝහල', score: 0.65, created_at: new Date(Date.now() - 432000000).toISOString(), difficulty: 'medium' },
            { exercise_title: 'පාසල', score: 0.78, created_at: new Date(Date.now() - 518400000).toISOString(), difficulty: 'easy' },
            { exercise_title: 'ව්‍යාකරණ', score: 0.33, created_at: new Date(Date.now() - 604800000).toISOString(), difficulty: 'hard' },
          ],
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const sessions = data?.history ?? []

  const filtered = sessions.filter(s => {
    const matchSearch = s.exercise_title.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true
      : filter === 'great' ? s.score >= 0.7
      : filter === 'ok' ? s.score >= 0.4 && s.score < 0.7
      : s.score < 0.4
    return matchSearch && matchFilter
  })

  const chartData = [...sessions].reverse().slice(0, 12).map((s, i) => ({
    name: s.exercise_title,
    score: s.score,
    index: i + 1,
  }))

  return (
    <div>
      <PageHeader title="Session History" subtitle={`${sessions.length} practice sessions recorded`} />

      {/* Summary rings */}
      {data?.progress && (
        <div className="card p-6 mb-6 animate-fade-up">
          <div className="flex flex-wrap items-center justify-around gap-6">
            <ScoreRing score={data.progress.best_score} size={100} label="Best Score" />
            <ScoreRing score={data.progress.avg_score} size={100} label="Avg Score" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-24 h-24 rounded-full border-8 border-purple-500/30 flex items-center justify-center">
                <span className="text-2xl font-display font-bold text-purple-400">
                  {data.progress.total_sessions}
                </span>
              </div>
              <p className="text-xs text-white/40">Total Sessions</p>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              {[
                { label: 'Excellent (≥70%)', count: sessions.filter(s => s.score >= 0.7).length, color: 'bg-teal-400' },
                { label: 'Average (40–70%)', count: sessions.filter(s => s.score >= 0.4 && s.score < 0.7).length, color: 'bg-amber-400' },
                { label: 'Poor (<40%)', count: sessions.filter(s => s.score < 0.4).length, color: 'bg-red-400' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-white/50">{label}</span>
                  <span className="text-white font-semibold ml-auto">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="card p-6 mb-6 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <h3 className="font-display font-semibold text-white">Score Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="index" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1]} tickFormatter={v => `${Math.round(v * 100)}%`} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={scoreColor(entry.score)} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/30" />
          {(['all', 'great', 'ok', 'poor'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions list */}
      <div className="card animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/20 text-sm">No sessions found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider">
              <span className="col-span-5">Word</span>
              <span className="col-span-3">Date</span>
              <span className="col-span-2">Difficulty</span>
              <span className="col-span-2 text-right">Score</span>
            </div>
            {filtered.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/3 transition-colors group">
                <div className="col-span-5">
                  <p className="font-medium text-white text-sm">{s.exercise_title}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-xs text-white/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-white/20">{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="col-span-2">
                  {s.difficulty && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.difficulty === 'easy' ? 'bg-teal-500/15 text-teal-500' :
                      s.difficulty === 'medium' ? 'bg-amber-500/15 text-amber-500' :
                      'bg-red-500/15 text-red-500'
                    }`}>
                      {s.difficulty}
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-right">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${scoreBg(s.score)}`}>
                    <span className={`font-display font-bold text-sm ${scoreTextColor(s.score)}`}>
                      {Math.round(s.score * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
