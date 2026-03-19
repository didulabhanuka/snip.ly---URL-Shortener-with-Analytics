import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout, token } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ⚡ snip.ly
      </Link>
      {token && (
        <div className="navbar-right">
          <span className="navbar-email">{user?.email}</span>
          <button onClick={logout} className="btn btn-ghost">
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}