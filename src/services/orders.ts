import api from './api'
import type { Order } from '@/types'

export interface CreateOrderPayload {
  fullName:  string
  phone:     string
  city:    string
  address:   string
  notes?:    string
  total:     number
  items: {
    productId:   number
    variantId:   number
    productName: string
    size:        number
    color:       string
    quantity:    number
    unitPrice:   number
  }[]
}

export const ordersService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post<Order>('/orders', payload)
    return data
  },

  async getAll(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders')
    return data
  },

  async getById(id: number): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`)
    return data
  },

  async updateStatus(id: number, status: string): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, { status })
    return data
  },

  async getDashboard(): Promise<{
    totalRevenue:  number
    totalOrders:   number
    pendingOrders: number
    totalProducts: number
    recentOrders:  Order[]
  }> {
    const { data } = await api.get('/orders/dashboard')
    return data
  },
}