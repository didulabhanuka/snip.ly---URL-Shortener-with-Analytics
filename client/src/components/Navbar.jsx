import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">⚡ snip.ly</Link>
      {token && (
        <div className="navbar-right">
          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar-admin-link">
              🔑 Admin
            </Link>
          )}
          <span className="navbar-email">{user?.email}</span>
          <button onClick={logout} className="btn btn-ghost">Logout</button>
        </div>
      )}
    </nav>
  )
}