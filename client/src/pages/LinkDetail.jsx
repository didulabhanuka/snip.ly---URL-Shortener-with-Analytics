import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { formatDate, copyToClipboard } from '../lib/utils'
import {
  ClicksOverTimeChart,
  BreakdownBarChart,
  DeviceDoughnut,
} from '../components/StatsChart'

export default function LinkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get(`/api/analytics/${id}`)
      .then((res) => setData(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleCopy() {
    const shortUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${data.url.slug}`
    await copyToClipboard(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <p className="loading-text">Loading analytics…</p>
  if (!data) return null

  return (
    <div className="page">
      <button className="btn btn-ghost back-btn" onClick={() => navigate('/')}>
        ← Back
      </button>

      {/* Header */}
      <div className="detail-header">
        <div>
          <h2 className="page-title">/{data.url.slug}</h2>
          <p className="cell-muted">{data.url.originalUrl}</p>
          <p className="cell-muted">Created {formatDate(data.url.createdAt)}</p>
        </div>
        <div className="detail-actions">
          <span className="total-clicks">{data.totalClicks} clicks</span>
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        </div>
      </div>

      {data.totalClicks === 0 ? (
        <div className="empty-state">
          <p>No clicks recorded yet. Share your link to start tracking!</p>
        </div>
      ) : (
        <div className="charts-grid">
          <div className="chart-card chart-wide">
            <h3 className="chart-title">Clicks over time</h3>
            <ClicksOverTimeChart data={data.clicksByDate} />
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Top countries</h3>
            <BreakdownBarChart data={data.byCountry} label="Clicks" />
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Browsers</h3>
            <BreakdownBarChart data={data.byBrowser} label="Clicks" />
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Devices</h3>
            <DeviceDoughnut data={data.byDevice} />
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Top referrers</h3>
            <BreakdownBarChart data={data.byReferrer} label="Clicks" />
          </div>
        </div>
      )}
    </div>
  )
}