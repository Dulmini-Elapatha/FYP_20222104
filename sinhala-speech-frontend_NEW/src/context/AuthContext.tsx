// 


import { createContext, useContext, useState, ReactNode } from 'react'

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
  // Check localStorage for persisted mock user
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('mock_user')
    return stored ? JSON.parse(stored) : null
  })

  async function signup(email: string, password: string, name: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    const newUser = { name, email }
    localStorage.setItem('mock_user', JSON.stringify(newUser))
    setUser(newUser)
  }

  async function login(email: string, password: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    // Accept any credentials for testing
    const mockUser = { name: 'Test User', email }
    localStorage.setItem('mock_user', JSON.stringify(mockUser))
    setUser(mockUser)
  }

  function logout() {
    localStorage.removeItem('mock_user')
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