import type { Gender, ProductForm, VariantForm } from "@/types"

export const SHIPPING_COST = 8_000  

export const EMPTY_FORM: ProductForm = {
  name: '', slug: '', description: '',
  price: '', compareAtPrice: '',
  gender: '', category: '',
  isFeatured: false,
}

export const EMPTY_VARIANT: VariantForm = {
  size: '', color: '', colorHex: '#000000', stock: '',
}


export const CATEGORIES = ['derby', 'boots', 'loafers', 'sneakers', 'sandals', 'heels', 'mules', 'flats']
export const GENDERS: Gender[] = ['homme', 'femme', 'enfant']

export const MEN_SIZES   = [39, 40, 41, 42, 43, 44, 45, 46]
export const WOMEN_SIZES = [36, 37, 38, 39, 40, 41]
export const KIDS_SIZES  = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
export const ALL_SIZES   = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]