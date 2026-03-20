import { useState } from 'react'

export default function LinkForm({ onCreate }) {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [password, setPassword] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url) return
    setLoading(true)
    setError(null)
    try {
      await onCreate(url, customSlug || undefined, password || undefined)
      setUrl('')
      setCustomSlug('')
      setPassword('')
      setShowAdvanced(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="link-form" onSubmit={handleSubmit}>
      <div className="link-form-row">
        <input
          type="url"
          className="input"
          placeholder="https://example.com/your-long-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setShowAdvanced((v) => !v)}
          title="Advanced options"
        >
          ⚙ Options
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Shortening…' : 'Shorten'}
        </button>
      </div>

      {showAdvanced && (
        <div className="link-form-advanced">
          <div className="link-form-advanced-row">
            <div className="advanced-field">
              <label className="advanced-label">Custom slug (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="my-custom-slug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                maxLength={32}
              />
            </div>
            <div className="advanced-field">
              <label className="advanced-label">
                🔒 Password protect (optional)
              </label>
              <input
                type="password"
                className="input"
                placeholder="Leave blank for public link"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </form>
  )
}