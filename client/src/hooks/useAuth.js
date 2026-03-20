import { useState, useCallback } from 'react'
import api from '../lib/api'

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { userId: payload.userId, email: payload.email, role: payload.role || 'user' }
  } catch {
    return null
  }
}

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token')
    return t ? decodeToken(t) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(decodeToken(data.token))
      return true
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/auth/register', { email, password })
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(decodeToken(data.token))
      return true
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }, [])

  return { token, user, loading, error, login, register, logout }
}