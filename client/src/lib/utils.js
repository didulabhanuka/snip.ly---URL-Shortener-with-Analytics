export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function truncate(str, max = 50) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
}

export function sortObjectByValue(obj) {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
}