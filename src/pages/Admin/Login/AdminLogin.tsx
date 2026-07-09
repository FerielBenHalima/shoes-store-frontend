import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminStore } from '@/store/adminStore'
import './AdminLogin.css'
import { FiEye, FiEyeOff, FiHome, FiUser } from 'react-icons/fi'

export default function AdminLogin() {
  const login    = useAdminStore(s => s.login)
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const ok = await login(email, password)
    if (ok) {
      navigate('/admin', { replace: true })
    } else {
      setError('Email ou Mot de passe Invalide')
      setLoading(false)
    }
  }

  return (
    <div className="al-page">
      <div className="al-card">
        <Link to="/" className="al-home-btn" aria-label="Back to store">
          <FiHome size={22} />
        </Link>
        <div className="al-logo">
          Mansour<span>.</span>
        </div>
        <FiUser size={120} />
        <h2 className="al-title">Lotfi Gharbi</h2>

        <form className="al-form" onSubmit={handleSubmit}>
          <div className="al-field">
            <label className="al-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="al-input"
              placeholder="admin@store.tn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="al-field">
            <label className="al-label" htmlFor="password">Mot de passe</label>
            <div className="al-pass-wrap">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="al-input al-input--pass"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="al-pass-toggle"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <FiEyeOff/> : <FiEye/>}
              </button>
            </div>
          </div>

          {error && <p className="al-error">{error}</p>}

          <button
            type="submit"
            className="al-submit"
            disabled={loading}
          >
            {loading ? <span className="al-spinner" /> : 'Se Connecter'}
          </button>
        </form>

        <p className="al-hint">
          Default: admin@store.tn / admin123
        </p>
      </div>
    </div>
  )
}