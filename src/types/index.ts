export type Gender = 'homme' | 'femme' | 'enfant'
export type OrderStatus = 'en_attente' | 'expédié' | 'livré' | 'annulé'

export interface ProductImage {
  id: string
  url: string
  alt: string
}

export interface Variant {
  id: string
  size: number
  color: string
  colorHex: string
  stock: number
  sku: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  gender: Gender
  category: string
  images: ProductImage[]
  variants: Variant[]
  isFeatured: boolean
  createdAt: string
}

export interface CartItem {
  id: string
  product: Product
  variant: Variant
  quantity: number
}

export interface OrderCustomer {
  fullName: string
  phone: string
  city: string
  address: string
  notes?: string
}

export interface OrderItem {
  productId: string
  variantId: string
  productName: string
  size: number
  color: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  customer: OrderCustomer
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
}

export interface ProductForm {
  name:           string
  slug:           string
  description:    string
  price:          string
  compareAtPrice: string
  gender:         Gender | ''
  category:       string
  isFeatured:     boolean
}

export interface VariantForm {
  size:     string
  color:    string
  colorHex: string
  stock:    string
  sku:      string
}

export interface ColorVariant {
  id:       number
  color:    string
  colorHex: string
  sizes: {
    size:  number
    stock: string
    sku:   string
    checked: boolean
  }[]
}