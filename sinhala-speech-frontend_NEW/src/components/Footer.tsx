import { Waves, Heart, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <Waves className="w-3.5 h-3.5 text-teal-500/60" />
          <span>සිංහල Speech Trainer</span>
          <span>·</span>
          <span>AI-Powered Pronunciation Coach</span>
        </div>
        <div className="flex items-center gap-3 text-white/20 text-xs">
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500/60 mx-0.5" /> for Sinhala learners
          </span>
          <span>·</span>
          <span>v1.0.0</span>
          <a
            href="https://github.com"
            className="hover:text-white/50 transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
