import { authService } from '@/services/auth'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminStore {
  email: string
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: '',

      login: async (email, password) => {
        try {
          await authService.login(email, password)
          set({ isAuthenticated: true, email })
          return true
        } catch {
          return false
        }
      },

      logout: () => { 
       authService.logout()
        set({ isAuthenticated: false, email: '' })
      },
    }),
    { name: 'admin-auth' }
  )
)