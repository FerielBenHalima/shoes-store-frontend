import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { formatPrice } from '@/utils/formatPrice'
import './AdminOrders.css'
import { ordersService } from '@/services/orders'
import { STATUS_COLOR } from '../Dashboard/Dashboard'


type Status = 'EN_ATTENTE' | 'CONFIRME' | 'EXPEDIE' | 'LIVRE' | 'ANNULE'

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'CONFIRME',   label: 'Confirmé'   },
  { value: 'EXPEDIE',    label: 'Expédié'    },
  { value: 'LIVRE',      label: 'Livré'      },
  { value: 'ANNULE',     label: 'Annulé'     },
]

export default function AdminOrders() {
  const [orders, setOrders]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<Status | 'all'>('all')
  const [search, setSearch]     = useState('')
  const [updating, setUpdating] = useState<number  | null>(null)


   useEffect(() => {
    ordersService.getAll()
      .then(data => setOrders(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                        o.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        o.city.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const updateStatus = async (id: number, status: Status) => {
    setUpdating(id)
    try {
      const updated = await ordersService.updateStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? updated : o))
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

    const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = orders.filter(o => o.status === s.value).length
    return acc
  }, {} as Record<string, number>)

    const getLabel = (status: string) =>
    STATUS_OPTIONS.find(s => s.value === status)?.label ?? status

  return (
    <AdminLayout>
      <div className="ao-wrap">

        {/* Header */}
        <div className="ao-header">
          <div>
            <h2 className="ao-title">Commandes</h2>
            <p className="ao-count">{filtered.length} commandes</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="ao-tabs">
          <button
            className={`ao-tab${filter === 'all' ? ' ao-tab--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous <span className="ao-tab-count">{orders.length}</span>
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              className={`ao-tab${filter === s.value ? ' ao-tab--active' : ''}`}
              onClick={() => setFilter(s.value)}
            >
              {s.label}
              {counts[s.value] > 0 && (
                <span className="ao-tab-count">{counts[s.value]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ao-search-wrap">
          <svg className="ao-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="ao-search"
            placeholder="Recherche par N° Commande, client ou ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="ao-card">
          <div className="ao-table-wrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Ville</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Mettre à jour</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="ao-empty"> Pas de commandes trouvées</td>
                  </tr>
                ) : (
                  filtered.map(order => (
                    <tr key={order.id}>
                      <td className="ao-order-num">{order.orderNumber}</td>
                      <td>{order.fullName}</td>
                      <td>{order.city}</td>
                      <td className="ao-total">{formatPrice(order.total)}</td>
                      <td className="ao-date">
                        {new Date(order.createdAt).toLocaleDateString('fr-TN')}

                      </td>
                      <td>
                        <span className={`status-badge ${STATUS_COLOR[order.status]}`}>
                          {order.status.toLowerCase()}
                        </span>
                      </td>
                      <td>
                        <select
                          className="ao-status-select"
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value as Status)}
                          disabled={updating === order.id}
                        >
                          {STATUS_OPTIONS.map(s => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                        </select>
                        {updating === order.id && (
                          <span className="ao-updating">enregistrement...</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}