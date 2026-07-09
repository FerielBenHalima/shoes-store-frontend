import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCartStore, cartItemCount } from '@/store/cartStore'
import { useAdminStore } from '@/store/adminStore'
import { FiUser, FiShoppingCart } from 'react-icons/fi'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location       = useLocation()
  const items          = useCartStore(s => s.items)
  const count          = cartItemCount(items)
  const isAdminLogged  = useAdminStore(s => s.isAuthenticated)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  return (
    <>
      <div className="topbar">      
        <span className="topbar-center">Livraison rapide dans toute la Tunisie · 8 DT</span>
        <div className="topbar-right">
          <span>+216 55 000 111</span>
          <span>store@mansour.tn</span>
        </div>
      </div>

      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <button
          className="navbar-burger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>

        <Link to="/" className="navbar-logo">Mansour<span>.</span></Link>

        <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/homme">Homme</Link></li>
          <li><Link to="/femme">Femme</Link></li>
          <li><Link to="/enfant">Enfant</Link></li>
          <li>
            <a href="#footer" onClick={e => {
              e.preventDefault()
              document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              À propos
            </a>
          </li>        
        </ul>

        <div className="navbar-actions">

          <Link
            to={isAdminLogged ? '/admin' : '/admin/login'}
            className="icon-btn"
            aria-label={isAdminLogged ? 'Admin dashboard' : 'Admin login'}
            title={isAdminLogged ? 'Go to dashboard' : 'Admin login'}
          >
            <FiUser size={17} />
            {isAdminLogged && <span className="admin-dot" />}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <FiShoppingCart size={17} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>

        </div>
      </nav>

      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </>
  )
}