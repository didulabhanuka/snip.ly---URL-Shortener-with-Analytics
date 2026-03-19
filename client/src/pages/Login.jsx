import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, register, loading, error } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    const ok = mode === 'login'
      ? await login(email, password)
      : await register(email, password)
    if (ok) navigate('/')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">⚡ snip.ly</h1>
        <p className="auth-subtitle">Shorten links. Track clicks.</p>

        <div className="tab-group">
          <button
            className={`tab ${mode === 'login' ? 'tab-active' : ''}`}
            onClick={() => setMode('login')}
          >
            Log in
          </button>
          <button
            className={`tab ${mode === 'register' ? 'tab-active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}