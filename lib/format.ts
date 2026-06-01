export function formatDate(s: string) {
  if (!s) return '-'
  const raw = s.replace(/-/g, '')
  if (raw.length < 8) return s
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

export function formatMonth(s: string) {
  if (!s) return '-'
  const raw = s.replace(/-/g, '')
  if (raw.length < 6) return s
  return `${raw.slice(0, 4)}.${raw.slice(4, 6)}`
}
