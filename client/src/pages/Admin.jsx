import { useState, useEffect } from 'react'
import api from '../lib/api'
import { formatDate, truncate } from '../lib/utils'

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value ?? '—'}</span>
      {sub && <span className="stat-card-sub" style={{ color: '#6b7280' }}>{sub}</span>}
    </div>
  )
}

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [links, setLinks] = useState([])
  const [tab, setTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, usersRes, linksRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/links'),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setLinks(linksRes.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  async function handleDeleteUser(id, email) {
    if (!confirm(`Delete user ${email} and all their links?`)) return
    try {
      await api.delete(`/api/admin/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user')
    }
  }

  async function handleDeleteLink(id, slug) {
    if (!confirm(`Delete link /${slug}?`)) return
    try {
      await api.delete(`/api/admin/links/${id}`)
      setLinks((prev) => prev.filter((l) => l.id !== id))
      setStats((s) => s ? { ...s, totalLinks: s.totalLinks - 1 } : s)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete link')
    }
  }

  async function handleRoleChange(id, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`Change this user's role to ${newRole}?`)) return
    try {
      const { data } = await api.patch(`/api/admin/users/${id}/role`, { role: newRole })
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: data.role } : u))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role')
    }
  }

  return (
    <div className="db-page">
      <div className="db-header">
        <h2 className="db-title">Admin panel</h2>
        <span className="db-range-badge" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
          🔑 Admin
        </span>
      </div>

      {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      {/* Platform stats */}
      <div className="db-stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Total users" value={stats?.totalUsers} sub={`+${stats?.newUsers ?? 0} this week`} />
        <StatCard label="Total links" value={stats?.totalLinks} sub={`+${stats?.newLinks ?? 0} this week`} />
        <StatCard label="Total clicks" value={stats?.totalClicks?.toLocaleString()} sub={`+${stats?.newClicks ?? 0} this week`} />
      </div>

      {/* Tab switcher */}
      <div className="db-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === 'users' ? 'admin-tab-active' : ''}`}
            onClick={() => setTab('users')}
          >
            Users ({users.length})
          </button>
          <button
            className={`admin-tab ${tab === 'links' ? 'admin-tab-active' : ''}`}
            onClick={() => setTab('links')}
          >
            Links ({links.length})
          </button>
        </div>

        {loading && <p className="db-muted" style={{ padding: '1.5rem' }}>Loading…</p>}

        {/* Users table */}
        {!loading && tab === 'users' && (
          <table className="db-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Links</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="db-table-row">
                  <td>{u.email}</td>
                  <td>
                    <span className="admin-role-badge" data-role={u.role}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.linkCount}</td>
                  <td className="db-muted-cell">{formatDate(u.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="db-btn-ghost"
                        onClick={() => handleRoleChange(u.id, u.role)}
                      >
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        className="db-btn-danger"
                        onClick={() => handleDeleteUser(u.id, u.email)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Links table */}
        {!loading && tab === 'links' && (
          <table className="db-table">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Destination</th>
                <th>Owner</th>
                <th>Clicks</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="db-table-row">
                  <td>
                    <span className="db-link">/{l.slug}</span>
                    {l.protected && <span className="admin-lock">🔒</span>}
                  </td>
                  <td className="db-muted-cell">{truncate(l.originalUrl, 40)}</td>
                  <td className="db-muted-cell">{l.userEmail}</td>
                  <td style={{ fontWeight: 600 }}>{l.clicks}</td>
                  <td className="db-muted-cell">{formatDate(l.createdAt)}</td>
                  <td>
                    <button
                      className="db-btn-danger"
                      onClick={() => handleDeleteLink(l.id, l.slug)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}