import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/formatPrice'
import type { Product, Variant } from '@/types'
import './ProductDetail.css'
import { SHIPPING_COST } from '@/utils/constants'
import { productsService } from '@/services/products'
import { imageUrl } from '@/utils/imageUrl'

/* ─── Size guide data ────────────────────────────────────── */
const SIZE_GUIDE = [
  { eu: 36, uk: 3,   us: 5.5,  cm: 23.0 },
  { eu: 37, uk: 4,   us: 6.5,  cm: 23.7 },
  { eu: 38, uk: 5,   us: 7.5,  cm: 24.3 },
  { eu: 39, uk: 6,   us: 8.5,  cm: 25.0 },
  { eu: 40, uk: 7,   us: 9.5,  cm: 25.7 },
  { eu: 41, uk: 7.5, us: 10,   cm: 26.3 },
  { eu: 42, uk: 8,   us: 10.5, cm: 27.0 },
  { eu: 43, uk: 9,   us: 11.5, cm: 27.7 },
  { eu: 44, uk: 10,  us: 12,   cm: 28.3 },
  { eu: 45, uk: 11,  us: 13,   cm: 29.0 },
]

/* ─── Helpers ────────────────────────────────────────────── */
function getUniqueColors(variants: Variant[]) {
  const seen = new Set<string>()
  return variants.filter(v => {
    if (seen.has(v.color)) return false
    seen.add(v.color)
    return true
  })
}

function getVariant(variants: Variant[], color: string, size: number) {
  return variants.find(v => v.color === color && v.size === size) ?? null
}

/* ─── Size Guide Modal ───────────────────────────────────── */
function SizeGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Size Guide</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p className="modal-hint">Mesurez la longueur de votre pied et trouvez la pointure EU correspondante ci-dessous</p>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th>EU</th><th>UK</th><th>US</th><th>CM</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.map(row => (
                <tr key={row.eu}>
                  <td><strong>{row.eu}</strong></td>
                  <td>{row.uk}</td>
                  <td>{row.us}</td>
                  <td>{row.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const addItem = useCartStore(s => s.addItem)

 /* ── State ─────────────────────────────────────────────── */
  const [product, setProduct]           = useState<Product | null>(null)
  const [loading, setLoading]           = useState(true)
  const [activeImg, setActiveImg]       = useState(0)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize]   = useState<number | null>(null)
  const [quantity, setQuantity]           = useState(1)
  const [showGuide, setShowGuide]         = useState(false)
  const [added, setAdded]                 = useState(false)

  /* ── Fetch product ─────────────────────────────────────── */
  useEffect(() => {
    if (!slug) return
    setLoading(true)
    productsService.getBySlug(slug)
      .then(data => {
        setProduct(data)
        const firstColor = getUniqueColors(data.variants)[0]?.color ?? ''
        setSelectedColor(firstColor)
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  /* ── Loading state ─────────────────────────────────────── */
  if (loading) {
    return (
      <PageWrapper>
        <div className="pd-loading container">
          <div className="pd-spinner" />
        </div>
      </PageWrapper>
    )
  }

  /* ── Not found ─────────────────────────────────────────── */
  if (!product) {
    return (
      <PageWrapper>
        <div className="pd-notfound container">
          <h2>Produit introuvable</h2>
          <Link to="/" className="pd-back">← Retour</Link>
        </div>
      </PageWrapper>
    )
  }

  /* ── Derived data ──────────────────────────────────────── */
  const colors     = getUniqueColors(product.variants)
  const activeColor = selectedColor

  const sizesForColor = product.variants
    .filter(v => v.color === activeColor)
    .sort((a, b) => a.size - b.size)

  const activeVariant = selectedSize
    ? getVariant(product.variants, activeColor, selectedSize)
    : null

  const inStock   = activeVariant ? activeVariant.stock > 0 : false
  const stockLeft = activeVariant?.stock ?? 0

  const discountPct = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null

  /* ── Handlers ──────────────────────────────────────────── */
  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setSelectedSize(null)   // reset size when color changes
    setQuantity(1)
  }

  const handleAddToCart = () => {
    if (!activeVariant || !inStock) return
    addItem(product, activeVariant, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <PageWrapper>

      {/* Breadcrumb */}
      <nav className="pd-breadcrumb container">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to={`/${product.gender}`}>{product.gender}</Link>
        <span>›</span>
        <span>{product.name}</span>
      </nav>

      <div className="pd-layout container">

        {/* ── Gallery ──────────────────────────────────── */}
        <div className="pd-gallery">
          <div className="pd-main-img-wrap">
            <img
              key={activeImg}
              src={imageUrl(product.images[activeImg]?.url ?? '')}

              alt={product.images[activeImg]?.alt}
              className="pd-main-img"
            />
            {discountPct && (
              <span className="pd-discount-badge">-{discountPct}%</span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="pd-thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  className={`pd-thumb${i === activeImg ? ' pd-thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Voir image ${i + 1}`}
                >
                  <img src={imageUrl(img.url)} alt={img.alt} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ─────────────────────────────────────── */}
        <div className="pd-info">

          <p className="pd-category">{product.category} · {product.gender}</p>
          <h1 className="pd-name">{product.name}</h1>

          <div className="pd-pricing">
            <span className="pd-price">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="pd-compare">{formatPrice(product.compareAtPrice)}</span>
            )}
            {discountPct && (
              <span className="pd-save">Enregistrer {discountPct}%</span>
            )}
          </div>

          <p className="pd-description">{product.description}</p>

          {/* ── Color picker — always visible ─────────── */}
          <div className="pd-section">
            <p className="pd-section-label">
              Color — <strong>{activeColor}</strong>
            </p>
            <div className="pd-colors">
              {colors.map(v => (
                <button
                  key={v.color}
                  className={`pd-color-btn${activeColor === v.color ? ' pd-color-btn--active' : ''}`}
                  style={{ background: v.colorHex }}
                  onClick={() => handleColorChange(v.color)}
                  aria-label={v.color}
                  title={v.color}
                />
              ))}
            </div>
          </div>

          {/* ── Size picker ───────────────────────────── */}
          <div className="pd-section">
            <div className="pd-section-header">
              <p className="pd-section-label">
                Pointure (EU){selectedSize ? ` — ${selectedSize}` : ''}
              </p>
              <button className="pd-guide-link" onClick={() => setShowGuide(true)}>
                Guide des pointures
              </button>
            </div>
            <div className="pd-sizes">
              {sizesForColor.map(v => (
                <button
                  key={v.id}
                  className={`pd-size-btn
                    ${selectedSize === v.size ? ' pd-size-btn--active' : ''}
                    ${v.stock === 0 ? ' pd-size-btn--out' : ''}
                  `}
                  onClick={() => v.stock > 0 && setSelectedSize(v.size)}
                  disabled={v.stock === 0}
                  title={v.stock === 0 ? 'Out of stock' : `Size ${v.size}`}
                >
                  {v.size}
                </button>
              ))}
            </div>

            {selectedSize && activeVariant && (
              <p className={`pd-stock-msg${stockLeft <= 2 ? ' pd-stock-msg--low' : ''}`}>
                {stockLeft === 0
                  ? 'Out of stock'
                  : stockLeft <= 2
                  ? `⚠ Only ${stockLeft} left`
                  : `✓ In stock`}
              </p>
            )}
            {!selectedSize && (
              <p className="pd-stock-msg">Veuillez séléctionner une pointure</p>
            )}
          </div>

          {/* ── Quantity + Add to cart ────────────────── */}
          <div className="pd-actions">
            <div className="pd-qty">
              <button
                className="pd-qty-btn"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >−</button>
              <span className="pd-qty-val">{quantity}</span>
              <button
                className="pd-qty-btn"
                onClick={() => setQuantity(q => Math.min(stockLeft, q + 1))}
                disabled={!inStock || quantity >= stockLeft}
              >+</button>
            </div>

            <button
              className={`pd-add-btn${added ? ' pd-add-btn--added' : ''}`}
              onClick={handleAddToCart}
              disabled={!selectedSize || !inStock}
            >
              {added
                ? '✓ Ajouté au panier'
                : !selectedSize
                ? 'Séléctionner une pointure'
                : !inStock
                ? 'Rupture de stock'
                : 'Ajouter au panier'}
            </button>
          </div>

          {/* ── Perks ────────────────────────────────── */}
          <div className="pd-perks">
            <div className="pd-perk">
              <span>🚚</span>
              <span>Livraison Rapide · {formatPrice(SHIPPING_COST)} Frais de livraison</span>
            </div>
            <div className="pd-perk">
              <span>💵</span>
              <span>Paiement à la livraison — paiement à réception de la commande</span>
            </div>
        
          </div>

        </div>
      </div>

      {/* Size guide modal */}
      {showGuide && <SizeGuideModal onClose={() => setShowGuide(false)} />}

    </PageWrapper>
  )
}