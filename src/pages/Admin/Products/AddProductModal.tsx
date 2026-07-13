import { useState } from 'react'
import type { Product, Variant, ProductForm, ColorVariant } from '@/types'
import './AddProductModal.css'
import { ALL_SIZES, CATEGORIES, EMPTY_FORM, GENDERS, KIDS_SIZES, MEN_SIZES, WOMEN_SIZES } from '@/utils/constants'
import { productsService } from '@/services/products'


function getSizes(gender: string) {
  if (gender === 'homme')    return MEN_SIZES
  if (gender === 'femme')  return WOMEN_SIZES
  if (gender === 'enfant')   return KIDS_SIZES
  return ALL_SIZES
}

function makeColorVariant(id: number, gender: string): ColorVariant {
  return {
    id,
    color:    '',
    colorHex: '#c8975a',
    sizes: getSizes(gender).map(size => ({
      size, stock: '', checked: false,
    })),
  }
}
/* ─── Helpers ────────────────────────────────────────────── */
function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}


/* ─── Props ──────────────────────────────────────────────── */
interface Props {
  onClose: () => void
  onAdd:   (p: Product) => void
}

/* ─── Component ──────────────────────────────────────────── */
export default function AddProductModal({ onClose, onAdd }: Props) {
  const [form, setForm]             = useState<ProductForm>(EMPTY_FORM)
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([makeColorVariant(1, '')])
  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [step, setStep]             = useState<1 | 2>(1)

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

    // When gender changes, reset sizes in all color variants
    if (name === 'gender') {
      setColorVariants(prev => prev.map(cv => ({
        ...cv,
        sizes: getSizes(value).map(size => ({
          size, stock: '', checked: false,
        })),
      })))
    }

    setErrors(e => ({ ...e, [name]: '' }))
  }

  /* ── Color variant helpers ───────────────────────────── */
  const addColorVariant = () => {
    setColorVariants(prev => [
      ...prev,
      makeColorVariant(Date.now(), form.gender),
    ])
  }

  const removeColorVariant = (id: number) => {
    setColorVariants(prev => prev.filter(cv => cv.id !== id))
  }

  const updateColorVariant = (id: number, field: 'color' | 'colorHex', value: string) => {
  setColorVariants(prev => prev.map(cv =>
    cv.id === id
      ? {
          ...cv,
          [field]: value,
            
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
        ? {
            ...cv,
            sizes: cv.sizes.map(s =>
              s.size === size ? { ...s, [field]: value } : s
            ),
          }
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
  if (!imageFile) e.imageUrl = 'Veuillez importer une image du produit.'

  colorVariants.forEach((cv, ci) => {
    if (!cv.color.trim()) e[`color_${ci}`] = 'Le nom du couleur est requis'
    const checkedSizes = cv.sizes.filter(s => s.checked)
    if (checkedSizes.length === 0) e[`sizes_${ci}`] = 'Séléctionner au moins une pointure'
    checkedSizes.forEach(s => {
      if (!s.stock) e[`stock_${ci}_${s.size}`] = 'Requis'
    })
  })

  setErrors(e)
  return Object.keys(e).length === 0
}
  /* ── Submit ──────────────────────────────────────────── */
  const handleSubmit = async () => {
  if (!validateStep2()) return

  const variants: Variant[] = colorVariants.flatMap(cv =>
    cv.sizes
      .filter(s => s.checked)
      .map((s, i): Variant => ({
        id:       `v-${Date.now()}-${cv.id}-${i}`,
        size:     parseInt(s.size.toString()),
        color:    cv.color,
        colorHex: cv.colorHex,
        stock:    parseInt(s.stock),
      }))
  )

  // Build FormData for multipart upload
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
  console.log(productPayload);
  formData.append('product', new Blob([JSON.stringify(productPayload)], {
    type: 'application/json',
  }))

  if (imageFile) {
    formData.append('image', imageFile)
  }

  try {
    const newProduct = await productsService.create(formData)
    onAdd(newProduct)
    onClose()
  } catch (err) {
    console.error("Echec d'ajouter un produit:", err)
  }
}
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="apm-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="apm-header">
          <h2 className="apm-title">Ajouter Nouveau Produit</h2>
          <button className="apm-close" onClick={onClose}>✕</button>
        </div>

        {/* Steps */}
        <div className="apm-steps">
          <div className={`apm-step${step === 1 ? ' apm-step--active' : ' apm-step--done'}`}>
            <span className="apm-step-num">1</span>
            <span> Info du produit</span>
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
                <label className="apm-label">Nom du produit *</label>
                <input
                  name="name"
                  className="apm-input"
                  placeholder="e.g. Oxford Cognac"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="apm-error">{errors.name}</p>}
              </div>

              <div className="apm-field apm-field--full">
                <label className="apm-label">Slug (auto-generated)</label>
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
                  <option value="">Séléctionner sexe</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.gender && <p className="apm-error">{errors.gender}</p>}
              </div>

              <div className={`apm-field${errors.category ? ' apm-field--error' : ''}`}>
                <label className="apm-label">Categorie *</label>
                <select name="category" className="apm-select" value={form.category} onChange={handleChange}>
                  <option value="">Séléctionner categorie</option>
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
                  placeholder="e.g. 129.000"
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
                  placeholder="e.g. 160.000 (optionel)"
                  value={form.compareAtPrice}
                  onChange={handleChange}
                />
              </div>

              <div className={`apm-field apm-field--full${errors.description ? ' apm-field--error' : ''}`}>
                <label className="apm-label">Description *</label>
                <textarea
                  name="description"
                  className="apm-textarea"
                  placeholder="Decrire le produit..."
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

            {/* Image upload */}
            <div className={`apm-field apm-field--full${errors.imageUrl ? ' apm-field--error' : ''}`}>
              <label className="apm-label">Image *</label>
              <div
                className={`apm-upload-zone${imagePreview ? ' apm-upload-zone--has-img' : ''}`}
                onClick={() => document.getElementById('img-upload')?.click()}
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
                id="img-upload"
                type="file"
                accept="image/*"
                className="apm-file-input"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleImageFile(file)
                }}
              />
              {imageFile && <p className="apm-file-name">✓ {imageFile.name}</p>}
              {errors.imageUrl && <p className="apm-error">{errors.imageUrl}</p>}
            </div>

            {/* Color variants */}
            <div className="apm-cv-section">
              <div className="apm-cv-header">
                <label className="apm-label">Couleurs & Pointures *</label>
                <button className="apm-add-color-btn" onClick={addColorVariant}>
                  + Ajouter couleur
                </button>
              </div>

              {!form.gender && (
                <p className="apm-cv-hint">⚠ Veuillez sélectionner un sexe à l'étape 1 pour afficher les pointures disponibles.</p>
              )}

              {colorVariants.map((cv, ci) => (
                <div key={cv.id} className="apm-cv-card">

                  {/* Color row */}
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
                      >✕ Effacer le couleur</button>
                    )}
                  </div>
                  {errors[`color_${ci}`] && (
                    <p className="apm-error">{errors[`color_${ci}`]}</p>
                  )}

                  {/* Sizes */}
                  <div className="apm-sizes-wrap">
                    <p className="apm-sizes-label">Sélectionnez les pointures disponibles:</p>
                    {errors[`sizes_${ci}`] && (
                      <p className="apm-error">{errors[`sizes_${ci}`]}</p>
                    )}
                    <div className="apm-sizes-grid">
                      {cv.sizes.map(s => (
                        <div key={s.size} className="apm-size-item">
                          {/* Size checkbox */}
                          <label className={`apm-size-check${s.checked ? ' apm-size-check--active' : ''}`}>
                            <input
                              type="checkbox"
                              checked={s.checked}
                              onChange={() => toggleSize(cv.id, s.size)}
                            />
                            <span>{s.size}</span>
                          </label>

                          {/* Stock inputs — only show when checked */}
                          {s.checked && (
                            <div className="apm-size-fields">
                              <input
                                className={`apm-input apm-input--xs${errors[`stock_${ci}_${s.size}`] ? ' apm-input--error' : ''}`}
                                type="number"
                                placeholder="Stock"
                                value={s.stock}
                                onChange={e => updateSizeField(cv.id, s.size, 'stock', e.target.value)}
                              />

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
              <button className="apm-btn apm-btn--ghost" onClick={onClose}>Cancel</button>
              <button
                className="apm-btn apm-btn--primary"
                onClick={() => { if (validateStep1()) setStep(2) }}
              >
                Suivant →
              </button>
            </>
          ) : (
            <>
              <button className="apm-btn apm-btn--ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="apm-btn apm-btn--primary" onClick={handleSubmit}>
                Ajouter Produit
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}