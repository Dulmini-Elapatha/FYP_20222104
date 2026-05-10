
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, AlertCircle, Waves, ArrowRight, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const reqs = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Lowercase letter', met: /[a-z]/.test(password) },
    { text: 'A number', met: /[0-9]/.test(password) },
  ]

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (!reqs.every(r => r.met)) { setError('Password must meet all requirements'); return }
    try {
      setError('')
      setLoading(true)
      await signup(email, password, name)
      navigate('/dashboard')
    } catch (err: unknown) {
      const ae = err as { response?: { data?: { error?: string } } }
      setError(ae.response?.data?.error ?? 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden py-8"
      style={{ background: 'linear-gradient(135deg, #07051a 0%, #0f0c29 50%, #0d1a2e 100%)' }}>
      
      <div className="orb w-96 h-96 bg-teal-500 top-[-15%] left-[-10%]" />
      <div className="orb w-72 h-72 bg-amber-500 bottom-[-5%] right-[-5%]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 mb-4 glow-teal">
            <Waves className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">සිංහල Speech</h1>
          <p className="text-white/40 text-sm mt-1">Start your pronunciation journey</p>
        </div>

        <div className="card p-8 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-display font-semibold text-white mb-1">Create account</h2>
          <p className="text-white/40 text-sm mb-6">Join thousands of Sinhala learners</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                  placeholder="John Doe" disabled={loading} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                  placeholder="you@email.com" disabled={loading} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="password" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                  placeholder="••••••••" disabled={loading} />
              </div>
              {password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {reqs.map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle className={`w-3 h-3 ${r.met ? 'text-teal-400' : 'text-white/20'}`} />
                      <span className={`text-xs ${r.met ? 'text-teal-400' : 'text-white/30'}`}>{r.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="password" value={confirm} onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
                  className={`w-full bg-white/5 border text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all ${
                    confirm && password !== confirm ? 'border-red-500/50' : 'border-white/10 focus:border-teal-500/50'
                  }`}
                  placeholder="••••••••" disabled={loading} />
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-teal-400 hover:to-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 glow-teal mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
