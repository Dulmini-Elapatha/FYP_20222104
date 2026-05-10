import React from 'react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import { User, Mail, Lock, Save, AlertCircle, CheckCircle, Shield, Bell } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email] = useState(user?.email ?? '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [saved, setSaved] = useState(false)
  const [error] = useState('')

  function handleSave() {
    // In a real app, call API to save
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account settings" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="card p-6 flex flex-col items-center text-center animate-fade-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-display font-bold text-white mb-3">
            {initials}
          </div>
          <p className="font-display font-semibold text-white">{user?.name}</p>
          <p className="text-sm text-white/40">{user?.email}</p>

          <div className="w-full mt-6 space-y-3">
            {[
              { icon: Shield, label: 'Account Status', value: 'Active', color: 'text-teal-400' },
              { icon: Bell, label: 'Notifications', value: 'Enabled', color: 'text-amber-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-white/30" />
                  <span className="text-xs text-white/50">{label}</span>
                </div>
                <span className={`text-xs font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal info */}
          <div className="card p-6 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" />
              Personal Information
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {saved && (
              <div className="mb-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <p className="text-sm text-teal-400">Changes saved successfully!</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-white/3 border border-white/5 text-white/40 rounded-xl pl-10 pr-4 py-3 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-white/20 mt-1">Email cannot be changed</p>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-teal-400 hover:to-teal-500 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Change password */}
          <div className="card p-6 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
                  />
                </div>
              </div>
              <button
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 hover:text-white transition-all"
              >
                <Lock className="w-4 h-4" />
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
