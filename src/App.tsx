import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home/Home'
import Men from './pages/Men/Men'
import Women from './pages/Women/Women'
import Kids from './pages/Kids/Kids'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import Cart from '@/pages/Cart/Cart'
import Checkout from './pages/Checkout/Checkout'
import OrderConfirmed from './pages/OrderConfirmed/OrderConfirmed'
import AdminLogin from './pages/Admin/Login/AdminLogin'
import AdminRoute from './router/AdminRoute'
import Dashboard from './pages/Admin/Dashboard/Dashboard'
import AdminProducts from './pages/Admin/Products/AdminProducts'
import AdminOrders from './pages/Admin/Orders/AdminOrders'
import { useCartStore } from './store/cartStore'
import { useEffect } from 'react'
import { productsService } from './services/products'
import toast, { Toaster } from 'react-hot-toast'


function CartValidator() {
  const validateCart = useCartStore(s => s.validateCart)

  useEffect(() => {
    // Run immediately on load
    const validate = async () => {
    const currentItems = useCartStore.getState().items


      if (currentItems.length === 0) {

        return
      }
      try {
        const products   = await productsService.getAll()

        const countBefore = useCartStore.getState().items.length
        validateCart(products)
        const countAfter  = useCartStore.getState().items.length

        // Notify user if something was removed
        if (countAfter < countBefore) {
          const removed = countBefore - countAfter
          toast.error(
            `${removed} article${removed > 1 ? 's' : ''} retiré${removed > 1 ? 's' : ''} de votre panier — produit non disponible.`,
            { duration: 5000 }
          )
        }
      } catch (err) {
        console.error('Cart validation error:', err)
      }
    }

    // Run once immediately
    validate()

    // Then run every 30 seconds
    const interval = setInterval(validate, 10_000)

    return () => clearInterval(interval)
  }, []) // empty deps — runs once, interval handles the rest

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <CartValidator />
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homme"   element={<Men />}   />
        <Route path="/femme" element={<Women />} />
        <Route path="/enfant"  element={<Kids />}  />
        <Route path="/shop/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />}          />
        <Route path="/checkout"   element={<Checkout />}      />
        <Route path="/order/confirmed" element={<OrderConfirmed />} />
        {/* ── Admin ────────────────────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin"          element={<Dashboard />}      />
          <Route path="/admin/products" element={<AdminProducts />}  />
          <Route path="/admin/orders"   element={<AdminOrders />}    />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}