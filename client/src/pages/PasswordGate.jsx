import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function PasswordGate() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post(`/api/verify/${slug}`, { password })
      // Redirect the browser to the destination URL
      window.location.href = data.url
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="gate-icon">🔒</div>
        <h2 className="auth-title" style={{ fontSize: '1.4rem' }}>Protected link</h2>
        <p className="auth-subtitle">
          <code style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>
            /{slug}
          </code>
          {' '}requires a password to continue.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="password"
            className="input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Verifying…' : 'Unlock link'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.82rem', color: '#9ca3af' }}>
          Don't have the password? Contact the person who shared this link.
        </p>
      </div>
    </div>
  )
}