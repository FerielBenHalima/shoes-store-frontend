import { useState, useMemo, useEffect } from 'react'
import type {Product } from '@/types'
import ProductCard from './ProductCard'
import PageWrapper from '@/components/layout/PageWrapper'
import './CollectionPage.css'
import { productsService } from '@/services/products'


/* ─── Constants ──────────────────────────────────────────── */
const CATEGORIES_BY_GENDER: Record<string, string[]> = {
  homme:  ['derby', 'boots', 'loafers', 'sneakers', 'sandals'],
  femme:  ['heels', 'mules', 'flats', 'sandals', 'boots', 'sneakers'],
  enfant: ['sneakers', 'boots', 'sandals', 'derby'],
}

const SORT_OPTIONS = [
  { value: 'nouveautés',     label: 'Nouveautés' },
  { value: 'prix-cro',  label: 'Prix: Croissant' },
  { value: 'prix-dec', label: 'Prix: Décroissant' },
]

const COLLECTION_META: Record<string, { title: string; hero: string }> = {
  homme:   { title: "Collection Homme",   hero: 'Le confort à chaque pas.' },
  femme: { title: "Collection Femme", hero: 'L’élégance à chaque pas.' },
  enfant:  { title: "Collection Enfant",   hero: 'Faites pour suivre leurs aventures.' },
}

/* ─── Types ──────────────────────────────────────────────── */
interface Filters {
  search:   string
  categories: string[]
  sizes:    number[]
  minPrice: string
  maxPrice: string
  sort:     string
}

interface Props {
  gender: 'homme' | 'femme' | 'enfant'
}

/* ─── Component ──────────────────────────────────────────── */
export default function CollectionPage({ gender }: Props) {
  const meta = COLLECTION_META[gender]
  const categories = CATEGORIES_BY_GENDER[gender]

  const [products, setProducts] = useState<Product[]>([])
  const [_loading, setLoading]   = useState(true)

  const [filters, setFilters] = useState<Filters>({
    search: '', categories: [], sizes: [],
    minPrice: '', maxPrice: '', sort: 'nouveautés',
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

// Fetch products from backend
  useEffect(() => {
    setLoading(true)
    productsService.getByGender(gender)
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [gender])


  /* ── Filter + sort logic ──────────────────────────────── */
  const results = useMemo(() => {
    let list = [...products]

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }

    if (filters.categories.length > 0) {
      list = list.filter(p => filters.categories.includes(p.category))
    }

    if (filters.sizes.length > 0) {
      list = list.filter(p =>
        p.variants.some(v => filters.sizes.includes(v.size) && v.stock > 0)
      )
    }

    if (filters.minPrice) {
      list = list.filter(p => p.price >= Number(filters.minPrice) * 100)
    }
    if (filters.maxPrice) {
      list = list.filter(p => p.price <= Number(filters.maxPrice) * 100)
    }

    list = [...list].sort((a, b) => {
      if (filters.sort === 'prix-cro')  return a.price - b.price
      if (filters.sort === 'prix-dec') return b.price - a.price
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return list
  }, [products, filters])

  /* ── Helpers ──────────────────────────────────────────── */
  const toggleCategory = (cat: string) =>
    setFilters(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }))

  const toggleSize = (size: number) =>
    setFilters(f => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter(s => s !== size)
        : [...f.sizes, size],
    }))

  const clearFilters = () =>
    setFilters({ search: '', categories: [], sizes: [], minPrice: '', maxPrice: '', sort: 'nouveautés' })

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== ''

  /* ── Available sizes for this gender ─────────────────── */
  const availableSizes = [...new Set(
    products.flatMap(p => p.variants.map(v => v.size))
  )].sort((a, b) => a - b)

  return (
    <PageWrapper>
      {/* ── Collection hero banner ────────────────────── */}
      <div className="coll-hero">
        <div className="coll-hero-content container">
          <p className="coll-hero-sub">{meta.hero}</p>
          <h1 className="coll-hero-title">{meta.title}</h1>
          <p className="coll-hero-count">{results.length} produits</p>
        </div>
      </div>

      <div className="coll-layout container">

        {/* ── Mobile filter toggle ──────────────────── */}
        <button className="filter-toggle" onClick={() => setSidebarOpen(v => !v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6"  x2="20" y2="6"/>
            <line x1="8" y1="12" x2="20" y2="12"/>
            <line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          Filtres {hasActiveFilters && <span className="filter-dot" />}
        </button>

        {/* ── Sidebar ───────────────────────────────── */}
        <aside className={`coll-sidebar${sidebarOpen ? ' coll-sidebar--open' : ''}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Filtres</h3>
            {hasActiveFilters && (
              <button className="clear-btn" onClick={clearFilters}>Effacer tout</button>
            )}
          </div>

          {/* Search */}
          <div className="filter-group">
            <label className="filter-label">Recherche</label>
            <div className="search-wrap">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Recherchez..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />
              {filters.search && (
                <button className="search-clear" onClick={() => setFilters(f => ({ ...f, search: '' }))}>✕</button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="filter-group">
            <label className="filter-label">Categorie</label>
            <div className="filter-options">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-chip${filters.categories.includes(cat) ? ' filter-chip--active' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="filter-group">
            <label className="filter-label">Pointure (EU)</label>
            <div className="size-grid">
              {availableSizes.map(size => (
                <button
                  key={size}
                  className={`size-btn${filters.sizes.includes(size) ? ' size-btn--active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="filter-group">
            <label className="filter-label">Prix (DT)</label>
              <input
                type="number"
                className="price-input"
                placeholder="Min"
                value={filters.minPrice}
                onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
              />
              <input
                type="number"
                className="price-input"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
              />
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label className="filter-label">Trier par</label>
            <select
              className="sort-select"
              value={filters.sort}
              onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Product grid ──────────────────────────── */}
        <div className="coll-main">
          {results.length === 0 ? (
            <div className="no-results">
              <p className="no-results-icon">🔍</p>
              <h3>Pas de chaussures trouvées</h3>
              <p>Ajuster vos filtres.</p>
              <button className="btn-clear-all" onClick={clearFilters}>Effacer les filtres</button>
            </div>
          ) : (
            <div className="coll-grid">
              {results.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  )
}