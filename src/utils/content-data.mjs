// Existing root-level Chinese fields remain valid alongside zh/en objects.
export function localized(item, locale) {
  if (!item) return {}
  const base = { ...item, ...(item.zh || {}) }
  if (locale !== 'en' || !item.en) return base
  return { ...base, ...Object.fromEntries(Object.entries(item.en).filter(([, value]) => value !== '' && value != null)) }
}

export function dateValue(value) {
  if (typeof value !== 'string') return NaN
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  if (!dateOnly && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return NaN
  const datePart = value.slice(0, 10)
  const utc = new Date(`${datePart}T00:00:00Z`)
  if (!Number.isFinite(utc.getTime()) || utc.toISOString().slice(0, 10) !== datePart) return NaN
  if (!dateOnly && (Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59 || Number(value.slice(17, 19)) > 59)) return NaN
  return Date.parse(dateOnly ? `${value}T00:00:00+08:00` : value)
}

export function newestFirst(items, field = 'date') {
  return items.map((item, index) => ({ item, index, date: dateValue(item[field]) }))
    .sort((a, b) => (Number.isFinite(b.date) ? b.date : -Infinity) - (Number.isFinite(a.date) ? a.date : -Infinity) || a.index - b.index)
    .map(({ item }) => item)
}

export function formatDate(value, locale) {
  const timestamp = dateValue(value)
  if (!Number.isFinite(timestamp)) return value || ''
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: 'short', day: 'numeric',
    ...(value.length > 10 ? { hour: '2-digit', minute: '2-digit', hour12: false } : {})
  }).format(timestamp)
}
