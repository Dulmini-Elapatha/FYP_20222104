import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, AlertCircle, Waves, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    
    // 1. Frontend Format Check (Stops the blue screen!)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g., name@domain.com)");
      return;
    }

    if (!email || !password) { setError('Please fill in all fields'); return }
    
    try {
      setError('')
      setLoading(true)
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      // 2. Safe Error Catching (Prevents React crashes)
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0].msg || 'Invalid format');
      } else {
        setError(typeof detail === 'string' ? detail : 'Invalid email or password');
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #07051a 0%, #0f0c29 50%, #0d1a2e 100%)' }}>
      
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-teal-500 top-[-15%] right-[-10%]" />
      <div className="orb w-72 h-72 bg-amber-500 bottom-[-10%] left-[-5%]" />
      <div className="orb w-48 h-48 bg-purple-600 top-[40%] left-[20%]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 mb-4 glow-teal">
            <Waves className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">සිංහල Speech</h1>
          <p className="text-white/40 text-sm mt-1">AI-Powered Pronunciation Coach</p>
        </div>

        {/* Card */}
        <div className="card p-8 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-display font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-white/40 text-sm mb-6">Sign in to continue your learning journey</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 focus:bg-white/8 transition-all"
                  placeholder="you@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 focus:bg-white/8 transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-teal-400 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-teal mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}