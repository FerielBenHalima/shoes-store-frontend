export function formatPrice(millimes: number): string {
  return (millimes / 1000).toLocaleString('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }) + ' DT'
}