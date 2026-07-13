import api from './api'
import type { Product } from '@/types'

export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products')
    return data
  },

  async getByGender(gender: string): Promise<Product[]> {
    const { data } = await api.get<Product[]>(`/products/gender/${gender}`)
    return data
  },

  async getFeatured(): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products/featured')
    return data
  },

  async getBySlug(slug: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${slug}`)
    return data
  },

  async search(query: string): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products/search', {
      params: { q: query },
    })
    return data
  },

  async create(formData: FormData): Promise<Product> {
    const token = localStorage.getItem('admin_token')
    const { data } = await api.post<Product>('/products', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      
        'Authorization': `Bearer ${token}`,

       },
    })
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`)
  },

  async update(id: number, formData: FormData): Promise<Product> {
    const token = localStorage.getItem('admin_token')
    const { data } = await api.put<Product>(`/products/${id}`, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,

     },
  })
  return data
},
}