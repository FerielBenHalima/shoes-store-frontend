
import { useState, useEffect, useRef } from 'react'
import './Home.css'
import PageWrapper from '@/components/layout/PageWrapper'
import enfant from '@/assets/enfant.png';
import woman from '@/assets/woman.png';
import men from '@/assets/men.png';

import type { Product } from '@/types';
import { productsService } from '@/services/products';
import ProductCard from '@/components/product/ProductCard';

/* ─── Mock data ─────────────────────────────────────────── */


const CATEGORIES = [
  { id: 'homme',   label: 'HOMME',   sub: "Collection Homme",   image: men },
  { id: 'femme', label: 'FEMME',   sub: "Collection Femme", image: woman },
  { id: 'enfant',  label: 'ENFANTS', sub: "Collection Enfant",   image: enfant},
]

const HERO_SLIDES = [
  { tag: 'Nouvelle Saison',  headline: ['Affirmez Votre Style',  'à Chaque Pas'],    sub: 'Trouvez la paire idéale pour chaque occasion et chaque style.' },
  { tag: 'Nouvelle Collection', headline: ['Marchez Avec ',  'Confiance'],    sub: 'Des chaussures en cuir faites pour vous accompagner à chaque pas..'},
]



/* ─── Hero ───────────────────────────────────────────────── */
function Hero() {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = (idx: number) =>
    setCurrent((idx + HERO_SLIDES.length) % HERO_SLIDES.length)

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const slide = HERO_SLIDES[current]

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-blob hero-blob--1" />
        <div className="hero-blob hero-blob--2" />
      </div>

      <div className="hero-content container">
        <div className="hero-text">
          <span className="hero-tag">{slide.tag}</span>
          <h1 className="hero-headline">
            {slide.headline.map((line, i) => (
              <span key={i} className="hero-line">{line}</span>
            ))}
          </h1>
          <p className="hero-sub">{slide.sub}</p>
          
        </div>

        <div className="hero-visual">
          <div className="hero-shoe-grid">
            <img src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=280&q=80" alt="Oxford shoe" className="shoe-img shoe-img--main" />
            <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&q=80"   alt="Heels"      className="shoe-img shoe-img--top"  />
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80"   alt="Sneaker"    className="shoe-img shoe-img--bot"  />
          </div>
        </div>
      </div>

      <div className="hero-dots">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`dot${i === current ? ' dot--active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Category Banners ───────────────────────────────────── */
function CategoryBanners() {
  return (
    <section className="categories container">
      {CATEGORIES.map(cat => (
        <a key={cat.id} href={`/${cat.id}`} className="cat-card">
          <img src={cat.image} alt={cat.label} className="cat-img" />
          <div className="cat-overlay" />
          <div className="cat-body">
            <p className="cat-sub">{cat.sub}</p>
            <h3 className="cat-label">{cat.label}</h3>
            <span className="cat-link">Voir la collection →</span>
          </div>
        </a>
      ))}
    </section>
  )
}



/* ─── Featured Products ──────────────────────────────────── */
function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    productsService.getFeatured()
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="featured container">
      <div className="section-header">
        <h2 className="section-title">Recommandés pour vous</h2>
        
      </div>

      {loading ? (
        <div className="featured-loading">
          <div className="featured-spinner" />
        </div>
      ) : products.length === 0 ? (
        <p className="featured-empty">
          Aucun produit en vedette pour le moment.
        </p>
      ) : (
        <div className="products-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ─── Perks ──────────────────────────────────────────────── */
function Perks() {
  const perks = [
    { icon: '🎧', title: 'Support En Ligne',    desc: 'Équipe de support dédiée'      },
    { icon: '🚚', title: 'Livraison Rapide', desc: 'Livraison à Domicile · 8 DT' },
    { icon: '🕐', title: 'Shopping intemporel', desc: 'Achats 24/7'             },
  ]
  return (
    <section className="perks container">
      {perks.map(p => (
        <div key={p.title} className="perk">
          <span className="perk-icon">{p.icon}</span>
          <div>
            <p className="perk-title">{p.title}</p>
            <p className="perk-desc">{p.desc}</p>
          </div>
        </div>
      ))}
    </section>
  )
}


/* ─── Page ───────────────────────────────────────────────── */
export default function Home() {
  return (
     <PageWrapper>
      <Hero />
      <CategoryBanners />
      <FeaturedProducts />
      <Perks />
    </PageWrapper>
  )
}