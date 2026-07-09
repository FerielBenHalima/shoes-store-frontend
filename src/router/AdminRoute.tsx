import { Navigate, Outlet } from 'react-router-dom'
import { useAdminStore } from '@/store/adminStore'

export default function AdminRoute() {
  const isAuthenticated = useAdminStore(s => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}