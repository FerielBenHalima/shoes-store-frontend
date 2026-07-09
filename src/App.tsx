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

export default function App() {
  return (
    <BrowserRouter>
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