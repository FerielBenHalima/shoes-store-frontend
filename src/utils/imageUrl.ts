const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

export function imageUrl(url: string): string {
  if (!url) return ''
  // If already a full URL (http/https or base64), return as-is
  if (url.startsWith('http') || url.startsWith('data:')) return url
  // Otherwise prepend the backend URL
  return `${BACKEND_URL}${url}`
}