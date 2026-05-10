import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  color?: string
  delay?: number
}

export default function StatCard({ icon: Icon, label, value, sub, color = 'text-teal-400', delay = 0 }: StatCardProps) {
  return (
    <div
      className="card card-hover p-5 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
