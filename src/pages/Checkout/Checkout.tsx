import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/formatPrice'
import './Checkout.css'
import { SHIPPING_COST } from '@/utils/constants'
import { ordersService } from '@/services/orders'
import { imageUrl } from '@/utils/imageUrl'

/* ─── Tunisian citys ───────────────────────────────────── */
const VILLE = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba',
  'Nabeul', 'Zaghouan', 'Bizerte', 'Béja',
  'Jendouba', 'Le Kef', 'Siliana', 'Sousse',
  'Monastir', 'Mahdia', 'Sfax', 'Kairouan',
  'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kébili',
]

/* ─── Types ──────────────────────────────────────────────── */
interface FormData {
  fullName:  string
  phone:     string
  city:    string
  address:   string
  notes:     string
}

interface FormErrors {
  fullName?: string
  phone?:    string
  city?:   string
  address?:  string
}

/* ─── Validation ─────────────────────────────────────────── */
function validate(form: FormData): FormErrors {
  const errors: FormErrors = {}

  if (!form.fullName.trim())
    errors.fullName = 'Le nom complet est obligatoire'
  else if (form.fullName.trim().length < 3)
    errors.fullName = 'Le nom est invalide'

  if (!form.phone.trim())
    errors.phone = 'Le Numéro de téléphone est obligatoire'
  else if (!/^[2459]\d{7}$/.test(form.phone.trim()))
    errors.phone = 'Entrer un numéro valide (e.g. 55 000 111)'

  if (!form.city)
    errors.city = 'Veuillez séléctionner votre ville'

  if (!form.address.trim())
    errors.address = "L'Adresse est obligatoire"
  else if (form.address.trim().length < 7)
    errors.address = "Entrer l'adresse complète"

  return errors
}

/* ─── Component ──────────────────────────────────────────── */
export default function Checkout() {
  const { items, clearCart } = useCartStore()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormData>({
    fullName: '', phone: '', city: '', address: '', notes: '',
  })
  const [errors, setErrors]     = useState<FormErrors>({})
  const [loading, setLoading]   = useState(false)
  const [touched, setTouched]   = useState<Record<string, boolean>>({})

  /* ── Totals ──────────────────────────────────────────── */
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shipping = SHIPPING_COST
  const total    = subtotal + shipping

  /* ── Redirect if cart empty ──────────────────────────── */
  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="co-empty container">
          <h2>Votre panier est vide</h2>
          <p>Ajoutez des chaussures avant de finaliser votre commande</p>
          <Link to="/" className="co-empty-btn">Retour</Link>
        </div>
      </PageWrapper>
    )
  }

  /* ── Handlers ────────────────────────────────────────── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    // Clear error as user types
    if (errors[name as keyof FormErrors]) {
      setErrors(e => ({ ...e, [name]: undefined }))
    }
  }

  const handleBlur = (name: string) => {
    setTouched(t => ({ ...t, [name]: true }))
    const result = validate(form)
    setErrors(result)
  }

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({ fullName: true, phone: true, city: true, address: true })
    const result = validate(form)
    setErrors(result)
    console.log(form)
    if (Object.keys(result).length > 0) return

    
    setLoading(true)

    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        city: form.city,
        address: form.address,
        notes: form.notes,
        total,
        items: items.map(item => ({
          productId: Number(item.product.id),
          variantId: Number(item.variant.id),
          productName: item.product.name,
          size: item.variant.size,
          color: item.variant.color,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      }

      console.log("ORDER PAYLOAD:", payload);

      const order = await ordersService.create(payload);

      clearCart()
      navigate('/order/confirmed', {
        state: {
          orderNumber: order.orderNumber,
          customer:    form,
          items,
          total,
        },
      })
    } catch (err) {
      setErrors({ fullName: 'Un problème est survenu. Veuillez réessayer' })
      setLoading(false)
    }
  }

  /* ── Field helper ────────────────────────────────────── */
  const field = (name: keyof FormErrors) =>
    touched[name] && errors[name]

  return (
    <PageWrapper>
      {/* Header */}
      <div className="co-header container">
        <nav className="co-breadcrumb">
          <Link to="/cart">Panier</Link>
          <span>›</span>
          <span className="co-breadcrumb-active">Validation</span>
        </nav>
        <h1 className="co-title">Validation</h1>
      </div>

      <div className="co-layout container">

        {/* ── Form ─────────────────────────────────────── */}
        <div className="co-form-wrap">

          {/* Customer info */}
          <div className="co-card">
            <h1 className="co-card-title">
              <span className="co-step">1</span>
               Informations
            </h1>

            <div className="co-fields">

              {/* Full name */}
              <div className={`co-field${field('fullName') ? ' co-field--error' : ''}`}>
                <label className="co-label" htmlFor="fullName">
                  Nom Complet <span className="co-required">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="co-input"
                  placeholder="e.g. Ahmed Ben Ali"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  autoComplete="name"
                />
                {field('fullName') && (
                  <p className="co-error">{errors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div className={`co-field${field('phone') ? ' co-field--error' : ''}`}>
                <label className="co-label" htmlFor="phone">
                  Téléphone <span className="co-required">*</span>
                </label>
                <div className="co-phone-wrap">
                  <span className="co-phone-prefix">🇹🇳 +216</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="co-input co-input--phone"
                    placeholder="55 000 111"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('phone')}
                    autoComplete="tel"
                    maxLength={8}
                  />
                </div>
                {field('phone') && (
                  <p className="co-error">{errors.phone}</p>
                )}
              </div>

              {/* Ville */}
              <div className={`co-field${field('city') ? ' co-field--error' : ''}`}>
                <label className="co-label" htmlFor="city">
                  Ville <span className="co-required">*</span>
                </label>
                <select
                  id="city"
                  name="city"
                  className="co-select"
                  value={form.city}
                  onChange={handleChange}
                  onBlur={() => handleBlur('city')}
                >
                  <option value="">Séléctionner votre ville</option>
                  {VILLE.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                {field('city') && (
                  <p className="co-error">{errors.city}</p>
                )}
              </div>

              {/* Address */}
              <div className={`co-field co-field--full${field('address') ? ' co-field--error' : ''}`}>
                <label className="co-label" htmlFor="address">
                  Adresse <span className="co-required">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="co-input"
                  placeholder="e.g. 12 Rue de la République, Cité El Menzah"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={() => handleBlur('address')}
                  autoComplete="street-address"
                />
                {field('address') && (
                  <p className="co-error">{errors.address}</p>
                )}
              </div>

              {/* Notes */}
              <div className="co-field co-field--full">
                <label className="co-label" htmlFor="notes">
                  Notes <span className="co-optional">(optionel)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="co-textarea"
                  placeholder="e.g. Appeler avant la livraison...."
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

            </div>
          </div>

          {/* Delivery method */}
          <div className="co-card">
            <h1 className="co-card-title">
              <span className="co-step">2</span>
              Livraison & Paiement
            </h1>
            <div className="co-delivery-option">
              <div className="co-delivery-radio">
                <div className="co-radio-dot" />
              </div>
              <div className="co-delivery-info">
                <p className="co-delivery-label">Livraison à domicile</p>
                <p className="co-delivery-sub">
                {formatPrice(shipping)} frais de livraison · 2–4 jours
                </p>
              </div>
              <p className="co-delivery-price">{formatPrice(shipping)}</p>
            </div>

            <div className="co-payment-option">
              <span className="co-payment-icon">💵</span>
              <div>
                <p className="co-payment-label">Paiement à la livraison </p>
                <p className="co-payment-sub">Paiement à réception de la commande.</p>
              </div>
            </div>
          </div>

          {/* Submit — mobile only shows here */}
          <button
            className="co-submit-btn co-submit-btn--mobile"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <span className="co-spinner" />
              : `Confirm Order · ${formatPrice(total)}`}
          </button>

        </div>

        {/* ── Order summary ─────────────────────────────── */}
        <div className="co-summary">
          <h2 className="co-summary-title">Détails de la commande</h2>

          {/* Items */}
          <div className="co-summary-items">
            {items.map(item => (
              <div key={item.id} className="co-summary-item">
                <div className="co-summary-img-wrap">
                  <img
                    src={imageUrl(item.product.images[0]?.url ?? '')}
                    alt={item.product.name}
                    className="co-summary-img"
                  />

                
                  <span className="co-summary-qty">{item.quantity}</span>
                </div>
                <div className="co-summary-item-info">
                  <p className="co-summary-item-name">{item.product.name}</p>
                  <p className="co-summary-item-meta">
                    EU {item.variant.size} · {item.variant.color}
                  </p>
                </div>
                <p className="co-summary-item-price">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="co-summary-totals">
            <div className="co-summary-row">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="co-summary-row">
              <span>Livraison</span>
              <span>{formatPrice(shipping)}</span>

            </div>
            <div className="co-summary-divider" />
            <div className="co-summary-row co-summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Submit button */}
          <button
            className="co-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <span className="co-spinner" />
              : `Confirmer · ${formatPrice(total)}`}
          </button>

          <p className="co-submit-hint">
            En confirmant, vous acceptez de payer à la livraison. Aucun paiement en ligne n’est requis..
          </p>

          <Link to="/cart" className="co-back-link">← Retour au panier</Link>
        </div>

      </div>
    </PageWrapper>
  )
}