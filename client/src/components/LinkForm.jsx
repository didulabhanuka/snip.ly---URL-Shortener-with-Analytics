import { useState } from 'react'

export default function LinkForm({ onCreate }) {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url) return
    setLoading(true)
    setError(null)
    try {
      await onCreate(url, customSlug || undefined)
      setUrl('')
      setCustomSlug('')
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
        <input
          type="text"
          className="input input-slug"
          placeholder="custom slug (optional)"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
          maxLength={32}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Shortening…' : 'Shorten'}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}