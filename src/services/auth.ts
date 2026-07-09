import api from './api'

export const authService = {
  async login(email: string, password: string): Promise<string> {
    const { data } = await api.post<{ token: string; email: string }>(
      '/auth/login',
      { email, password }
    )
    localStorage.setItem('admin_token', data.token)
    return data.token
  },

  logout() {
    localStorage.removeItem('admin_token')
  },

  getToken(): string | null {
    return localStorage.getItem('admin_token')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('admin_token')
  },
}