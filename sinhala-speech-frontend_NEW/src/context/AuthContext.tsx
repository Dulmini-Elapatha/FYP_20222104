import { createContext, useContext, useState, ReactNode } from 'react'
import api from '../api' // Make sure this points to your axios instance

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Check localStorage for persisted user
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('app_user')
    return stored ? JSON.parse(stored) : null
  })

  async function signup(email: string, password: string, name: string) {
    // Send JSON data to your FastAPI /auth/register endpoint
    const res = await api.post('/auth/register', { name, email, password })
    
    const newUser = { name, email: res.data.email }
    localStorage.setItem('app_user', JSON.stringify(newUser))
    setUser(newUser)
  }

  async function login(email: string, password: string) {
    // Send JSON data to your FastAPI /auth/login endpoint
    const res = await api.post('/auth/login', { email, password })
    
    // We use the email prefix as a display name since login only requires email
    const displayName = res.data.email.split('@')[0]
    const loggedInUser = { name: displayName, email: res.data.email }
    
    localStorage.setItem('app_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  function logout() {
    localStorage.removeItem('app_user')
    // SECURE LOGOUT: Wipe previous user's dashboard history from the browser!
    localStorage.removeItem('practice_history')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}