import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import StatCard from '../components/StatCard'
import ScoreRing from '../components/ScoreRing'
import PageHeader from '../components/PageHeader'
import {
  Trophy, TrendingUp, BookOpen, Mic,
  ArrowRight, Zap, Target, Star,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface ProgressData {
  progress: {
    best_score: number
    avg_score: number
    total_sessions: number
  } | null
  history: { exercise_title: string; score: number; created_at: string }[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-3 py-2 text-xs">
        <p className="text-white/50">{label}</p>
        <p className="text-teal-400 font-bold">{Math.round(payload[0].value * 100)}%</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ProgressData>('/speech/progress')
      .then(r => setProgress(r.data))
      .catch(() => {
        // Use mock data if backend not ready
        setProgress({
          progress: { best_score: 0.85, avg_score: 0.67, total_sessions: 12 },
          history: [
            { exercise_title: 'ආයුබෝවන්', score: 0.85, created_at: new Date().toISOString() },
            { exercise_title: 'ස්තූතියි', score: 0.70, created_at: new Date(Date.now() - 86400000).toISOString() },
            { exercise_title: 'කෝප්ප', score: 0.55, created_at: new Date(Date.now() - 172800000).toISOString() },
          ],
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const chartData = [...(progress?.history ?? [])]
    .reverse()
    .slice(0, 10)
    .map((s, i) => ({
      session: `S${i + 1}`,
      score: s.score,
    }))

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  const scoreColor = (s: number) =>
    s >= 0.7 ? 'text-teal-400' : s >= 0.4 ? 'text-amber-400' : 'text-red-400'

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Track your Sinhala pronunciation progress"
        action={
          <Link to="/practice"
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-teal-400 hover:to-teal-500 transition-all glow-teal">
            <Mic className="w-4 h-4" /> Start Practice
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Trophy} label="Best Score" color="text-amber-400"
          value={progress?.progress ? `${Math.round(progress.progress.best_score * 100)}%` : '--'}
          sub="All time high" delay={0} />
        <StatCard icon={TrendingUp} label="Avg Score" color="text-teal-400"
          value={progress?.progress ? `${Math.round(progress.progress.avg_score * 100)}%` : '--'}
          sub="Across all sessions" delay={100} />
        <StatCard icon={BookOpen} label="Sessions" color="text-purple-400"
          value={progress?.progress?.total_sessions ?? '--'}
          sub="Practice sessions" delay={200} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="card p-6 lg:col-span-2 animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Score Progress</h3>
            <span className="text-xs text-white/30">Last 10 sessions</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="session" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <p className="text-white/20 text-sm">No sessions yet — start practicing!</p>
            </div>
          )}
        </div>

        {/* Quick score ring */}
        <div className="card p-6 flex flex-col items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <h3 className="font-display font-semibold text-white text-sm">Current Average</h3>
          <ScoreRing score={progress?.progress?.avg_score ?? 0} size={130} label="pronunciation" />
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400 inline-block" /> ≥70% Great</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> ≥40% OK</div>
          </div>
        </div>
      </div>

      {/* Tips + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tips */}
        <div className="card p-6 animate-fade-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          <h3 className="font-display font-semibold text-white mb-4">Quick Tips</h3>
          <div className="space-y-3">
            {[
              { icon: Zap, text: 'Practice 10 minutes daily for best results', color: 'text-amber-400' },
              { icon: Target, text: 'Focus on words scoring below 50%', color: 'text-red-400' },
              { icon: Star, text: 'RL agent adapts exercises to your level', color: 'text-teal-400' },
            ].map(({ icon: Icon, text, color }, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                <Icon className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
                <p className="text-sm text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="card p-6 animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Recent Sessions</h3>
            <Link to="/history" className="text-xs text-teal-400 flex items-center gap-1 hover:text-teal-300">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          ) : (progress?.history?.length ?? 0) === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/20 text-sm">No sessions yet</p>
              <Link to="/practice" className="text-teal-400 text-sm mt-1 block">Start practicing →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {progress!.history.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{s.exercise_title}</p>
                    <p className="text-xs text-white/30">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-bold ${scoreColor(s.score)}`}>
                    {Math.round(s.score * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
