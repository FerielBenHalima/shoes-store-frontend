import { formatPrice } from '@/utils/formatPrice'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import './ProductCard.css'
import { imageUrl } from '@/utils/imageUrl'


export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)

  const primary   = imageUrl(product.images[0]?.url ?? '')  || 'https://placehold.co/400x500?text=No+Image'
  const secondary = imageUrl(product.images[1]?.url ?? '') || primary
  const discountPct = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null

  return (
    <Link
      to={`/shop/${product.slug}`}
      className={`pcard${hovered ? ' pcard--hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="pcard-img-wrap">
        <img src={primary}   alt={product.name} className="pcard-img pcard-img--primary" />
        <img src={secondary} alt={product.name} className="pcard-img pcard-img--hover"   />
        {discountPct && <span className="pcard-badge">-{discountPct}%</span>}
        <div className="pcard-actions">
          <button
            className="pcard-action-btn"
            onClick={e => e.preventDefault()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Ajouter au panier
          </button>
        </div>
      </div>

      <div className="pcard-info">
        <p className="pcard-category">{product.category}</p>
        <h4 className="pcard-name">{product.name}</h4>
        <div className="pcard-pricing">
          <span className="pcard-price">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="pcard-compare">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}