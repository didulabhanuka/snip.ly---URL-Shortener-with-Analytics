import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate, truncate, copyToClipboard } from '../lib/utils'

export default function LinkTable({ links, onDelete }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(null)

  async function handleCopy(e, shortUrl, id) {
    e.stopPropagation()
    await copyToClipboard(shortUrl)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (confirm('Delete this link? This cannot be undone.')) {
      await onDelete(id)
    }
  }

  if (!links.length) {
    return (
      <div className="empty-state">
        <p>No links yet. Shorten your first URL above.</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Short URL</th>
            <th>Original URL</th>
            <th>Clicks</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr
              key={link.id}
              className="table-row-clickable"
              onClick={() => navigate(`/links/${link.id}`)}
            >
              <td>
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-short"
                  onClick={(e) => e.stopPropagation()}
                >
                  {link.shortUrl.replace(/^https?:\/\//, '')}
                </a>
              </td>
              <td className="cell-muted">{truncate(link.originalUrl)}</td>
              <td>
                <span className="badge">{link.clicks}</span>
              </td>
              <td className="cell-muted">{formatDate(link.createdAt)}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => handleCopy(e, link.shortUrl, link.id)}
                  >
                    {copied === link.id ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => handleDelete(e, link.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}