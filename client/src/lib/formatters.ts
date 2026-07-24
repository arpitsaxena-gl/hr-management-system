export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatLakhs(value: number): string {
  if (value >= 10000000) return `\u20b9${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `\u20b9${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `\u20b9${(value / 1000).toFixed(1)}K`
  return formatINR(value)
}
