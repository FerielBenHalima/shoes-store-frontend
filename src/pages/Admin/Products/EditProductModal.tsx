import { useState } from 'react'
import type { Product, Variant, Gender, ProductForm } from '@/types'
import { productsService } from '@/services/products'
import { imageUrl } from '@/utils/imageUrl'
import './AddProductModal.css'

/* ─── Constants ──────────────────────────────────────────── */
const CATEGORIES = ['derby', 'boots', 'loafers', 'sneakers', 'sandals', 'heels', 'mules', 'flats']
const GENDERS: Gender[] = ['homme', 'femme', 'enfant']

const MEN_SIZES   = [39, 40, 41, 42, 43, 44, 45, 46]
const WOMEN_SIZES = [36, 37, 38, 39, 40, 41]
const KIDS_SIZES  = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
const ALL_SIZES   = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]

function getSizes(gender: string) {
  if (gender === 'homme')   return MEN_SIZES
  if (gender === 'femme') return WOMEN_SIZES
  if (gender === 'enfant')  return KIDS_SIZES
  return ALL_SIZES
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function generateSku(productName: string, color: string, size: number): string {
  const namePart  = productName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)
  const colorPart = color.trim().slice(0, 3).toUpperCase()
  return `${namePart}-${colorPart}-${size}`
}

/* ─── Color variant type ─────────────────────────────────── */
interface ColorVariant {
  id:       number
  color:    string
  colorHex: string
  sizes: {
    size:    number
    stock:   string
    sku:     string
    checked: boolean
  }[]
}

function buildColorVariants(variants: Variant[], gender: string): ColorVariant[] {
  // Group existing variants by color
  const colorMap = new Map<string, Variant[]>()
  variants.forEach(v => {
    if (!colorMap.has(v.color)) colorMap.set(v.color, [])
    colorMap.get(v.color)!.push(v)
  })

  return Array.from(colorMap.entries()).map(([color, vList], idx) => {
    const colorHex = vList[0].colorHex
    const checkedSizes = new Set(vList.map(v => v.size))

    return {
      id:       idx + 1,
      color,
      colorHex,
      sizes: getSizes(gender).map(size => {
        const existing = vList.find(v => v.size === size)
        return {
          size,
          stock:   existing ? existing.stock.toString() : '',
          sku:     existing ? existing.sku : '',
          checked: checkedSizes.has(size),
        }
      }),
    }
  })
}

/* ─── Props ──────────────────────────────────────────────── */
interface Props {
  product:  Product
  onClose:  () => void
  onUpdate: (p: Product) => void
}

/* ─── Component ──────────────────────────────────────────── */
export default function EditProductModal({ product, onClose, onUpdate }: Props) {
  const [form, setForm] = useState<ProductForm>({
    name:           product.name,
    slug:           product.slug,
    description:    product.description,
    price:          (product.price / 1000).toFixed(3),
    compareAtPrice: product.compareAtPrice ? (product.compareAtPrice / 1000).toFixed(3) : '',
    gender:         product.gender,
    category:       product.category,
    isFeatured:     product.isFeatured,
  })

  const [colorVariants, setColorVariants] = useState<ColorVariant[]>(
    () => buildColorVariants(product.variants, product.gender)
  )

  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(
    imageUrl(product.images[0]?.url ?? '')
  )
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [step, setStep]       = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)

  /* ── Field change ────────────────────────────────────── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : value

    setForm(f => ({
      ...f,
      [name]: val,
      ...(name === 'name' ? { slug: slugify(value) } : {}),
    }))

    if (name === 'gender') {
      setColorVariants(prev => prev.map(cv => ({
        ...cv,
        sizes: getSizes(value).map(size => {
          const existing = cv.sizes.find(s => s.size === size)
          return existing ?? { size, stock: '', sku: '', checked: false }
        }),
      })))
    }

    setErrors(e => ({ ...e, [name]: '' }))
  }

  /* ── Color variant helpers ───────────────────────────── */
  const addColorVariant = () => {
    setColorVariants(prev => [...prev, {
      id:       Date.now(),
      color:    '',
      colorHex: '#c8975a',
      sizes:    getSizes(form.gender).map(size => ({
        size, stock: '', sku: '', checked: false,
      })),
    }])
  }

  const removeColorVariant = (id: number) =>
    setColorVariants(prev => prev.filter(cv => cv.id !== id))

  const updateColorVariant = (id: number, field: 'color' | 'colorHex', value: string) => {
    setColorVariants(prev => prev.map(cv =>
      cv.id === id
        ? {
            ...cv,
            [field]: value,
            sizes: field === 'color'
              ? cv.sizes.map(s => ({
                  ...s,
                  sku: s.checked ? generateSku(form.name, value, s.size) : '',
                }))
              : cv.sizes,
          }
        : cv
    ))
  }

  const toggleSize = (cvId: number, size: number) => {
    setColorVariants(prev => prev.map(cv =>
      cv.id === cvId
        ? {
            ...cv,
            sizes: cv.sizes.map(s =>
              s.size === size
                ? {
                    ...s,
                    checked: !s.checked,
                    sku:     !s.checked ? generateSku(form.name, cv.color, size) : '',
                    stock:   !s.checked ? s.stock : '',
                  }
                : s
            ),
          }
        : cv
    ))
  }

  const updateSizeField = (
    cvId: number,
    size: number,
    field: 'stock',
    value: string
  ) => {
    setColorVariants(prev => prev.map(cv =>
      cv.id === cvId
        ? { ...cv, sizes: cv.sizes.map(s => s.size === size ? { ...s, [field]: value } : s) }
        : cv
    ))
  }

  /* ── Image upload ────────────────────────────────────── */
  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors(e => ({ ...e, imageUrl: "L'image ne doit pas dépasser 5 Mo." }))
      return
    }
    setImageFile(file)
    setErrors(e => ({ ...e, imageUrl: '' }))
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  /* ── Validate step 1 ─────────────────────────────────── */
  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())        e.name        = 'Le Nom est requis'
    if (!form.gender)             e.gender      = 'Le sexe est requis'
    if (!form.category)           e.category    = 'La categorie est requise'
    if (!form.price)              e.price       = 'Le prix est requis'
    if (!form.description.trim()) e.description = 'La description est requise'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── Validate step 2 ─────────────────────────────────── */
  const validateStep2 = () => {
    const e: Record<string, string> = {}
    colorVariants.forEach((cv, ci) => {
      if (!cv.color.trim()) e[`color_${ci}`] = 'Le nom du couleur est requis'
      const checkedSizes = cv.sizes.filter(s => s.checked)
      if (checkedSizes.length === 0) e[`sizes_${ci}`] = 'Séléctionner au moins une pointure'
      checkedSizes.forEach(s => {
        if (!s.stock) e[`stock_${ci}_${s.size}`] = 'Obligatoire'
      })
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── Submit ──────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validateStep2()) return
    setLoading(true)

    const variants: Variant[] = colorVariants.flatMap(cv =>
      cv.sizes
        .filter(s => s.checked)
        .map((s, i): Variant => ({
          id:       `v-${Date.now()}-${cv.id}-${i}`,
          size:     s.size,
          color:    cv.color,
          colorHex: cv.colorHex,
          stock:    parseInt(s.stock),
          sku:      s.sku,
        }))
    )

    const formData = new FormData()

    const productPayload = {
      name:           form.name,
      slug:           form.slug,
      description:    form.description,
      price:          Math.round(parseFloat(form.price) * 1000),
      compareAtPrice: form.compareAtPrice
        ? Math.round(parseFloat(form.compareAtPrice) * 1000)
        : null,
      gender:      form.gender,
      category:    form.category,
      isFeatured:  form.isFeatured,
      variants,
    }

    formData.append('product', new Blob([JSON.stringify(productPayload)], {
      type: 'application/json',
    }))

    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      const updated = await productsService.update(Number(product.id), formData)
      onUpdate(updated)
      onClose()
    } catch (err) {
        console.error('Echec de mettre à jour ce produit:', err)

    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="apm-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="apm-header">
          <h2 className="apm-title">Modifier le Produit — {product.name}</h2>
          <button className="apm-close" onClick={onClose}>✕</button>
        </div>

        {/* Steps */}
        <div className="apm-steps">
          <div className={`apm-step${step === 1 ? ' apm-step--active' : ' apm-step--done'}`}>
            <span className="apm-step-num">1</span>
            <span>Info Produit</span>
          </div>
          <div className="apm-step-line" />
          <div className={`apm-step${step === 2 ? ' apm-step--active' : ''}`}>
            <span className="apm-step-num">2</span>
            <span>Image & Variantes</span>
          </div>
        </div>

        {/* ── Step 1 ───────────────────────────────── */}
        {step === 1 && (
          <div className="apm-body">
            <div className="apm-grid">

              <div className={`apm-field apm-field--full${errors.name ? ' apm-field--error' : ''}`}>
                <label className="apm-label">Nom du Produit *</label>
                <input
                  name="name"
                  className="apm-input"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="apm-error">{errors.name}</p>}
              </div>

              <div className="apm-field apm-field--full">
                <label className="apm-label">Slug</label>
                <input
                  name="slug"
                  className="apm-input apm-input--muted"
                  value={form.slug}
                  onChange={handleChange}
                />
              </div>

              <div className={`apm-field${errors.gender ? ' apm-field--error' : ''}`}>
                <label className="apm-label">Sexe *</label>
                <select name="gender" className="apm-select" value={form.gender} onChange={handleChange}>
                  <option value="">Séléctionner le sexe</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.gender && <p className="apm-error">{errors.gender}</p>}
              </div>

              <div className={`apm-field${errors.category ? ' apm-field--error' : ''}`}>
                <label className="apm-label">Categorie *</label>
                <select name="category" className="apm-select" value={form.category} onChange={handleChange}>
                  <option value="">Séléctionner la categorie</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="apm-error">{errors.category}</p>}
              </div>

              <div className={`apm-field${errors.price ? ' apm-field--error' : ''}`}>
                <label className="apm-label">Prix (DT) *</label>
                <input
                  name="price"
                  type="number"
                  step="0.001"
                  className="apm-input"
                  value={form.price}
                  onChange={handleChange}
                />
                {errors.price && <p className="apm-error">{errors.price}</p>}
              </div>

              <div className="apm-field">
                <label className="apm-label">Ancien Prix (DT)</label>
                <input
                  name="compareAtPrice"
                  type="number"
                  step="0.001"
                  className="apm-input"
                  value={form.compareAtPrice}
                  onChange={handleChange}
                />
              </div>

              <div className={`apm-field apm-field--full${errors.description ? ' apm-field--error' : ''}`}>
                <label className="apm-label">Description *</label>
                <textarea
                  name="description"
                  className="apm-textarea"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                />
                {errors.description && <p className="apm-error">{errors.description}</p>}
              </div>

              <div className="apm-field apm-field--full">
                <label className="apm-checkbox">
                  <input
                    name="isFeatured"
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={handleChange}
                  />
                  <span>Afficher ce produit sur la page d'accueil</span>
                </label>
              </div>

            </div>
          </div>
        )}

        {/* ── Step 2 ───────────────────────────────── */}
        {step === 2 && (
          <div className="apm-body">

            {/* Image */}
            <div className="apm-field apm-field--full">
              <label className="apm-label">Image</label>
              <div
                className={`apm-upload-zone${imagePreview ? ' apm-upload-zone--has-img' : ''}`}
                onClick={() => document.getElementById('img-upload-edit')?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file && file.type.startsWith('image/')) handleImageFile(file)
                }}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" className="apm-img-preview" />
                    <div className="apm-img-overlay"><span>Cliquer pour changer</span></div>
                  </>
                ) : (
                  <div className="apm-upload-placeholder">
                    <span className="apm-upload-icon">🖼️</span>
                    <p className="apm-upload-text">Cliquez ou glissez-déposez une image.</p>
                    <p className="apm-upload-hint">PNG, JPG, WEBP — max 5MB</p>
                  </div>
                )}
              </div>
              <input
                id="img-upload-edit"
                type="file"
                accept="image/*"
                className="apm-file-input"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleImageFile(file)
                }}
              />
              {imageFile && <p className="apm-file-name">✓ {imageFile.name}</p>}
              {!imageFile && (
                <p className="apm-hint-keep">
                  Aucune nouvelle image sélectionnée
                </p>
              )}
            </div>

            {/* Color variants */}
            <div className="apm-cv-section">
              <div className="apm-cv-header">
                <label className="apm-label">Couleurs & Pointures *</label>
                <button className="apm-add-color-btn" onClick={addColorVariant}>
                  + Ajouter couleur
                </button>
              </div>

              {colorVariants.map((cv, ci) => (
                <div key={cv.id} className="apm-cv-card">

                  <div className="apm-cv-color-row">
                    <div className="apm-color-pick">
                      <input
                        type="color"
                        className="apm-color-input"
                        value={cv.colorHex}
                        onChange={e => updateColorVariant(cv.id, 'colorHex', e.target.value)}
                      />
                      <input
                        className={`apm-input apm-input--color-name${errors[`color_${ci}`] ? ' apm-input--error' : ''}`}
                        placeholder="Couleur"
                        value={cv.color}
                        onChange={e => updateColorVariant(cv.id, 'color', e.target.value)}
                      />
                    </div>
                    {colorVariants.length > 1 && (
                      <button
                        className="apm-remove-color"
                        onClick={() => removeColorVariant(cv.id)}
                      >
                        ✕ Remove color
                      </button>
                    )}
                  </div>
                  {errors[`color_${ci}`] && (
                    <p className="apm-error">{errors[`color_${ci}`]}</p>
                  )}

                  <div className="apm-sizes-wrap">
                    <p className="apm-sizes-label">Pointures disponibles:</p>
                    {errors[`sizes_${ci}`] && (
                      <p className="apm-error">{errors[`sizes_${ci}`]}</p>
                    )}
                    <div className="apm-sizes-grid">
                      {cv.sizes.map(s => (
                        <div key={s.size} className="apm-size-item">
                          <label className={`apm-size-check${s.checked ? ' apm-size-check--active' : ''}`}>
                            <input
                              type="checkbox"
                              checked={s.checked}
                              onChange={() => toggleSize(cv.id, s.size)}
                            />
                            <span>{s.size}</span>
                          </label>
                          {s.checked && (
                            <div className="apm-size-fields">
                              <input
                                className={`apm-input apm-input--xs${errors[`stock_${ci}_${s.size}`] ? ' apm-input--error' : ''}`}
                                type="number"
                                placeholder="Stock"
                                value={s.stock}
                                onChange={e => updateSizeField(cv.id, s.size, 'stock', e.target.value)}
                              />
                              <p className="apm-sku-preview">{s.sku}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="apm-footer">
          {step === 1 ? (
            <>
              <button className="apm-btn apm-btn--ghost" onClick={onClose}>
                Annuler
              </button>
              <button
                className="apm-btn apm-btn--primary"
                onClick={() => { if (validateStep1()) setStep(2) }}
              >
                Suivant →
              </button>
            </>
          ) : (
            <>
              <button className="apm-btn apm-btn--ghost" onClick={() => setStep(1)}>
                ← Retour
              </button>
              <button
                className="apm-btn apm-btn--primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <span className="apm-spinner" /> : 'Enregistrer'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}