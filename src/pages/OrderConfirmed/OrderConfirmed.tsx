import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import { formatPrice } from '@/utils/formatPrice'
import { SHIPPING_COST } from '@/utils/constants'
import type { CartItem } from '@/types'
import './OrderConfirmed.css'
import { imageUrl } from '@/utils/imageUrl'

interface OrderState {
  orderNumber: string
  customer: {
    fullName: string
    phone:    string
    city:   string
    address:  string
    notes?:   string
  }
  items: CartItem[]
  total: number
}

export default function OrderConfirmed() {
  const location = useLocation()
  const navigate = useNavigate()
  const state    = location.state as OrderState | null

  // If someone navigates here directly with no order state, send them home
  useEffect(() => {
    if (!state) navigate('/', { replace: true })
  }, [state, navigate])

  if (!state) return null

  const { orderNumber, customer, items, total } = state
  const subtotal = total - SHIPPING_COST

  return (
    <PageWrapper>
      <div className="oc-wrap container">

        {/* ── Success banner ──────────────────────────── */}
        <div className="oc-banner">
          <div className="oc-check">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="oc-banner-text">
            <h1 className="oc-title">Commande Confirmée!</h1>
            <p className="oc-subtitle">
              Merci, <strong>{customer.fullName.split(' ')[0]}</strong>. Votre commande a été passée avec succès.
            </p>
          </div>
        </div>

        {/* ── Order number ────────────────────────────── */}
        <div className="oc-order-number">
          <span className="oc-order-label">Numéro de commande</span>
          <span className="oc-order-value">{orderNumber}</span>
        </div>

        <div className="oc-layout">

          {/* ── Left column ─────────────────────────── */}
          <div className="oc-left">

            {/* Delivery info */}
            <div className="oc-card">
              <h2 className="oc-card-title">Informations de livraison</h2>
              <div className="oc-info-grid">
                <div className="oc-info-item">
                  <span className="oc-info-label">Nom</span>
                  <span className="oc-info-value">{customer.fullName}</span>
                </div>
                <div className="oc-info-item">
                  <span className="oc-info-label">Téléphone</span>
                  <span className="oc-info-value">+216 {customer.phone}</span>
                </div>
                <div className="oc-info-item">
                  <span className="oc-info-label">Ville</span>
                  <span className="oc-info-value">{customer.city}</span>
                </div>
                <div className="oc-info-item">
                  <span className="oc-info-label">Adresse</span>
                  <span className="oc-info-value">{customer.address}</span>
                </div>
                {customer.notes && (
                  <div className="oc-info-item oc-info-item--full">
                    <span className="oc-info-label">Notes</span>
                    <span className="oc-info-value">{customer.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="oc-card">
              <h2 className="oc-card-title">Paiement</h2>
              <div className="oc-payment">
                <span className="oc-payment-icon">💵</span>
                <div>
                  <p className="oc-payment-label">Paiement à la livraison</p>
                  <p className="oc-payment-sub">
                    Merci de préparer <strong>{formatPrice(total)}</strong> à l’arrivée du livreur.
                  </p>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="oc-card">
              <h2 className="oc-card-title">Prochaines étapes ?</h2>
              <div className="oc-steps">
                <div className="oc-step">
                  <div className="oc-step-dot oc-step-dot--done">1</div>
                  <div className="oc-step-content">
                    <p className="oc-step-title">Commande passée</p>
                    <p className="oc-step-desc">Commande reçue et en cours de préparation.</p>
                  </div>
                </div>
                <div className="oc-step-line" />
                <div className="oc-step">
                  <div className="oc-step-dot">2</div>
                  <div className="oc-step-content">
                    <p className="oc-step-title">Commande confirmée</p>
                    <p className="oc-step-desc">Notre équipe vous appellera pour confirmer les détails.</p>
                  </div>
                </div>
                <div className="oc-step-line" />
                <div className="oc-step">
                  <div className="oc-step-dot">3</div>
                  <div className="oc-step-content">
                    <p className="oc-step-title">En cours de livraison</p>
                    <p className="oc-step-desc">Vos chaussures sont en route — 2 à 4 jours ouvrés.</p>
                  </div>
                </div>
                <div className="oc-step-line" />
                <div className="oc-step">
                  <div className="oc-step-dot">4</div>
                  <div className="oc-step-content">
                    <p className="oc-step-title">Livré</p>
                    <p className="oc-step-desc">Payez le livreur et profitez de vos nouvelles chaussures !</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Right column ─────────────────────────── */}
          <div className="oc-right">

            {/* Order summary */}
            <div className="oc-card oc-summary">
              <h2 className="oc-card-title">Détails de la commande</h2>

              <div className="oc-items">
                {items.map(item => (
                  <div key={item.id} className="oc-item">
                    <div className="oc-item-img-wrap">
                      <img
                        src={imageUrl(item.product.images[0]?.url ?? '')}
                        alt={item.product.name}
                        className="oc-item-img"
                      />
                      <span className="oc-item-qty">{item.quantity}</span>
                    </div>
                    <div className="oc-item-info">
                      <p className="oc-item-name">{item.product.name}</p>
                      <p className="oc-item-meta">
                        EU {item.variant.size} · {item.variant.color}
                      </p>
                    </div>
                    <p className="oc-item-price">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="oc-totals">
                <div className="oc-total-row">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="oc-total-row">
                  <span>Livraison</span>
                  <span>{formatPrice(SHIPPING_COST)}</span>
                </div>
                <div className="oc-total-divider" />
                <div className="oc-total-row oc-total-final">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="oc-actions">
              <Link to="/" className="oc-btn oc-btn--dark">
                Poursuivre vos achats
              </Link>
              <Link to="/homme" className="oc-btn oc-btn--outline">
                Collection Homme
              </Link>
              <Link to="/femme" className="oc-btn oc-btn--outline">
                Collection Femme
              </Link>
            </div>

          </div>
        </div>
      </div>
    </PageWrapper>
  )
}