import { useLinks } from '../hooks/useLinks'
import LinkForm from '../components/LinkForm'
import LinkTable from '../components/LinkTable'

export default function Dashboard() {
  const { links, loading, error, createLink, deleteLink } = useLinks()

  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0)

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Your Links</h2>
        <div className="stats-row">
          <div className="stat-chip">
            <span className="stat-value">{links.length}</span>
            <span className="stat-label">links</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{totalClicks}</span>
            <span className="stat-label">total clicks</span>
          </div>
        </div>
      </div>

      <LinkForm onCreate={createLink} />

      {loading && <p className="loading-text">Loading links…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && <LinkTable links={links} onDelete={deleteLink} />}
    </div>
  )
}