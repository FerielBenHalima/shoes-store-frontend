import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { formatPrice } from '@/utils/formatPrice'
import './Dashboard.css'
import { ordersService } from '@/services/orders'
import type { Product } from '@/types'
import { productsService } from '@/services/products'
import { imageUrl } from '@/utils/imageUrl'



const STATUS_COLOR: Record<string, string> = {
  EN_ATTENTE:   'status--pending',
  CONFIRME: 'status--confirmed',
  EXPEDIE:   'status--shipped',
  LIVRE: 'status--delivered',
  ANNULE: 'status--cancelled',
}
export { STATUS_COLOR }

export default function Dashboard() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pd, setProducts]   = useState<Product[]>([])

  useEffect(() => {
    ordersService.getDashboard()
      .then(d => setData(d))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

   useEffect(() => {
    productsService.getAll()
      .then(pd => setProducts(pd))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])



  
 if (loading) {
    return (
      <AdminLayout>
        <div className="dash-loading">
          <div className="dash-spinner" />
        </div>
      </AdminLayout>
    )
  }


  return (
    <AdminLayout>
      <div className="dash">

        {/* ── Stats ──────────────────────────────────── */}
        <div className="dash-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon--green">💰</div>
            <div>
              <p className="stat-label">Ventes totales</p>
              <p className="stat-value">{formatPrice(data?.totalRevenue)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--blue">📦</div>
            <div>
              <p className="stat-label">Commandes</p>
              <p className="stat-value">{data?.totalOrders}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--amber">⏳</div>
            <div>
              <p className="stat-label">En attente</p>
              <p className="stat-value">{data?.pendingOrders}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--purple">👟</div>
            <div>
              <p className="stat-label">Produits</p>
              <p className="stat-value">{data?.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* ── Recent orders ──────────────────────────── */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Commandes récentes</h2>
            <a href="/admin/orders" className="dash-card-link">Afficher tout →</a>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Ville</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="order-num">{order.orderNumber}</td>
                    <td>{order.fullName}</td>
                    <td>{order.city}</td>
                    <td className="order-total">{formatPrice(order.total)}</td>
                    <td>
                      <span className={`status-badge ${STATUS_COLOR[order.status]}`}>
                        {order.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="order-date">
                       {new Date(order.createdAt).toLocaleDateString('fr-TN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Low stock alert ────────────────────────── */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Stock faible</h2>
          </div>
          <div className="low-stock-list">
            {pd.flatMap(p =>
              p.variants
                .filter(v => v.stock > 0 && v.stock <= 3)
                .map(v => ({ product: p, variant: v }))
            ).map(({ product, variant }) => (
              <div key={variant.id} className="low-stock-item">
                <img
                  src={imageUrl(product.images[0]?.url ?? '')}
                  alt={product.name}
                  className="low-stock-img"
                />
                <div className="low-stock-info">
                  <p className="low-stock-name">{product.name}</p>
                  <p className="low-stock-meta">
                    EU {variant.size} · {variant.color}
                  </p>
                </div>
                <span className={`stock-pill${variant.stock === 1 ? ' stock-pill--critical' : ''}`}>
                  {variant.stock} restant
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}