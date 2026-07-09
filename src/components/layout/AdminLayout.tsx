import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminStore } from '@/store/adminStore'
import './AdminLayout.css'

const NAV_ITEMS = [
  {
    to: '/admin',
    label: 'Tableau de bord',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: '/admin/products',
    label: 'Produits',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    to: '/admin/orders',
    label: 'Commandes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="2"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
]

interface Props { children: React.ReactNode }

export default function AdminLayout({ children }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const logout   = useAdminStore(s => s.logout)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="adm-shell">

      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className={`adm-sidebar${sidebarOpen ? ' adm-sidebar--open' : ''}`}>
        <div className="adm-sidebar-logo">
          <Link to="/" className="adm-logo">Mansour<span>.</span></Link>
          <span className="adm-logo-tag">Admin</span>
        </div>

        <nav className="adm-nav">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`adm-nav-item${active ? ' adm-nav-item--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="adm-sidebar-footer">
          <Link to="/" className="adm-footer-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Store
          </Link>
          <button className="adm-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnecter
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="adm-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ─────────────────────────────────────── */}
      <div className="adm-main">
        {/* Topbar */}
        <header className="adm-topbar">
          <button
            className="adm-burger"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
          <h1 className="adm-page-title">
            {NAV_ITEMS.find(i => i.to === location.pathname)?.label ?? 'Admin'}
          </h1>
        </header>

        {/* Content */}
        <div className="adm-content">
          {children}
        </div>
      </div>

    </div>
  )
}