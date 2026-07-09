import { Link, useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/formatPrice'
import './Cart.css'
import { SHIPPING_COST } from '@/utils/constants'
import { imageUrl } from '@/utils/imageUrl'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const navigate = useNavigate()
  const subtotal  = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shipping  = SHIPPING_COST
  const total     = subtotal + shipping

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="cart-empty container">
          <div className="cart-empty-icon">🛍️</div>
          <h2>Votre panier est vide</h2>
          <p>Vous n’avez encore rien ajouté.</p>
          <div className="cart-empty-links">
            <Link to="/homme"   className="cart-empty-btn">Collection Homme</Link>
            <Link to="/femme" className="cart-empty-btn">Collection Femme</Link>
            <Link to="/enfant"  className="cart-empty-btn">Collection Enfant</Link>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="cart-header container">
        <h1 className="cart-title">Votre Panier</h1>
        <span className="cart-count">{items.length} article{items.length > 1 ? 's' : ''}</span>
      </div>

      <div className="cart-layout container">

        {/* ── Items ──────────────────────────────────────── */}
        <div className="cart-items">
          <div className="cart-items-header">
            <span>Produit</span>
            <span>Pointure</span>
            <span>Qté</span>
            <span>Prix</span>
          </div>

          {items.map(item => (
            <div key={item.id} className="cart-item">
              {/* Image */}
              <Link to={`/shop/${item.product.slug}`} className="cart-item-img-wrap">
                <img
                  src={imageUrl(item.product.images[0]?.url ?? '')}
                  alt={item.product.name}
                  className="cart-item-img"
                />
              </Link>

              {/* Info */}
              <div className="cart-item-info">
                <Link to={`/shop/${item.product.slug}`} className="cart-item-name">
                  {item.product.name}
                </Link>
                <p className="cart-item-color">
                  <span
                    className="cart-item-color-dot"
                    style={{ background: item.variant.colorHex }}
                  />
                  {item.variant.color}
                </p>
                <button
                  className="cart-item-remove"
                  onClick={() => removeItem(item.id)}
                >
                  Effacer
                </button>
              </div>

              {/* Size */}
              <div className="cart-item-size">
                EU {item.variant.size}
              </div>

              {/* Quantity */}
              <div className="cart-item-qty">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >−</button>
                <span className="qty-val">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.variant.stock}
                >+</button>
              </div>

              {/* Price */}
              <div className="cart-item-price">
                {formatPrice(item.product.price * item.quantity)}
                {item.quantity > 1 && (
                  <span className="cart-item-unit">
                    <b>{formatPrice(item.product.price)} </b>
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Clear cart */}
          <div className="cart-items-footer">
            <button className="cart-clear" onClick={clearCart}>
              🗑 Vider le panier
            </button>
            <Link to="/" className="cart-continue">
              ← Poursuivre vos achats
            </Link>
          </div>
        </div>

        {/* ── Summary ────────────────────────────────────── */}
        <div className="cart-summary">
          <h2 className="cart-summary-title">Détails de la commande</h2>

          <div className="cart-summary-rows">
            <div className="cart-summary-row">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
                <span>Livraison</span>
                <span>{formatPrice(shipping)}</span>

            </div>
            
            <div className="cart-summary-divider" />
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="cart-summary-cod">
            <span>💵</span>
            <span>Paiement à la livraison — paiement à réception de la commande</span>
          </div>

          <button
            className="cart-checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            Finaliser la commande →
          </button>

          {/* What's in the box */}
          <div className="cart-summary-items-mini">
            {items.map(item => (
              <div key={item.id} className="mini-item">
                <img
                  src={imageUrl(item.product.images[0]?.url ?? '')}

                  alt={item.product.name}
                  className="mini-item-img"
                />
                <div className="mini-item-info">
                  <p className="mini-item-name">{item.product.name}</p>
                  <p className="mini-item-meta">
                    EU {item.variant.size} · {item.variant.color} · x{item.quantity}
                  </p>
                </div>
                <p className="mini-item-price">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}