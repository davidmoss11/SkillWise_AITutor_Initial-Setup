import { createContext, useContext, useEffect, useState } from 'react'
import { api, setAuthToken, decodeToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('app_token')
    if (stored) {
      setAuthToken(stored)
      setToken(stored)
      // Try /auth/me first
      api.get('/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => {
          const payload = decodeToken(stored)
          if (payload?.id) setUser({ id: payload.id })
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function login(newToken, userObj) {
    setToken(newToken)
    setAuthToken(newToken)
    localStorage.setItem('app_token', newToken)
    setUser(userObj || decodeToken(newToken) || null)
  }

  function logout() {
    api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('app_token')
    setAuthToken(null)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
