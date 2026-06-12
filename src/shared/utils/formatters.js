export function formatNumber(n) {
  if (n === null || n === undefined) return ''
  return new Intl.NumberFormat().format(Number(n))
}

export function formatDate(d) {
  if (!d) return ''
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(d))
}

export function formatPercent(p) {
  if (p === null || p === undefined) return ''
  const v = Number(p)
  return `${v}%`
}

