import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { formatPrice } from '@/utils/formatPrice'
import type { Product } from '@/types'
import './AdminProducts.css'
import AddProductModal from './AddProductModal'
import { productsService } from '@/services/products'
import { imageUrl } from '@/utils/imageUrl'
import EditProductModal from './EditProductModal'

export default function AdminProducts() {
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]   = useState('')
  const [gender, setGender]   = useState('tous')
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)


   useEffect(() => {
    productsService.getAll()
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])


  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.category.toLowerCase().includes(search.toLowerCase())
    const matchGender = gender === 'tous' || p.gender === gender
    return matchSearch && matchGender
  })

  const totalStock = (p: Product) =>
    p.variants.reduce((s, v) => s + v.stock, 0)

  
  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await productsService.delete(Number(id))
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  const handleUpdate = (updated: Product) => {
  setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
}

  
  const handleAdd = (product: Product) => {
    setProducts(prev => [product, ...prev])
  }

  return (
    <AdminLayout>
      <div className="ap-wrap">

        {/* Header */}
        <div className="ap-header">
          <div>
            <h2 className="ap-title">Produits</h2>
            <p className="ap-count">{filtered.length} produits</p>
          </div>
          <button className="ap-add-btn" onClick={() => setShowModal(true)}>
            + Add Product
          </button>        
        </div>

        {/* Filters */}
        <div className="ap-filters">
          <div className="ap-search-wrap">
            <svg className="ap-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="ap-search"
              placeholder="Rechercher produits..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="ap-gender-tabs">
            {['tous', 'homme', 'femme', 'enfant'].map(g => (
              <button
                key={g}
                className={`ap-tab${gender === g ? ' ap-tab--active' : ''}`}
                onClick={() => setGender(g)}
              >
                {g === 'tous' ? 'TOUS' : g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="ap-loading"><div className="ap-spinner" /></div>
        ) : ( 
          <div className="ap-card">
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Categorie</th>
                    <th>Sexe</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Variantes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product.id}>
                      {/* Product */}
                      <td>
                        <div className="ap-product-cell">
                          <img
                            src={imageUrl(product.images[0]?.url ?? '')}
                            alt={product.name}
                            className="ap-product-img"
                          />
                          <div>
                            <p className="ap-product-name">{product.name}</p>
                            <p className="ap-product-slug">{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="ap-cell-cap">{product.category}</td>

                      {/* Gender */}
                      <td>
                        <span className={`ap-gender-badge ap-gender--${product.gender}`}>
                          {product.gender}
                        </span>
                      </td>

                      {/* Price */}
                      <td>
                        <p className="ap-price">{formatPrice(product.price)}</p>
                        {product.compareAtPrice && (
                          <p className="ap-compare">{formatPrice(product.compareAtPrice)}</p>
                        )}
                      </td>

                      {/* Stock */}
                      <td>
                        <span className={`ap-stock${totalStock(product) <= 5 ? ' ap-stock--low' : ''}`}>
                          {totalStock(product)} unités
                        </span>
                      </td>

                      {/* Variants */}
                      <td>
                        <div className="ap-variants">
                          {[...new Set(product.variants.map(v => v.color))].map(color => {
                            const hex = product.variants.find(v => v.color === color)?.colorHex
                            return (
                              <span
                                key={color}
                                className="ap-color-dot"
                                style={{ background: hex }}
                                title={color}
                              />
                            )
                          })}
                          <span className="ap-variants-count">
                            {product.variants.length} variantes
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="ap-actions">
                          <button 
                            className="ap-action-btn ap-action-btn--edit"
                            onClick={() => setEditingProduct(product)}>
                            Modifier
                          </button>
                          <button
                            className="ap-action-btn ap-action-btn--delete"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                          >
                            {deleting === product.id ? '...' : 'Supprimer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Modal */}
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}

      {editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onUpdate={handleUpdate}
          />
        )}
    </AdminLayout>
  )
}