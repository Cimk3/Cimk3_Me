// 统一的 fetch 封装：失败时抛出带状态码的错误信息
// process.env.BASE_URL 来自 vue.config.js 的 publicPath，用于子路径部署
const base = process.env.BASE_URL || '/'

function toUrl(url) {
  return base + String(url).replace(/^\//, '')
}

export async function fetchJson(url) {
  const res = await fetch(toUrl(url))
  if (!res.ok) throw new Error(`加载 ${url} 失败：HTTP ${res.status}`)
  return res.json()
}

export async function fetchText(url) {
  const res = await fetch(toUrl(url))
  if (!res.ok) throw new Error(`加载 ${url} 失败：HTTP ${res.status}`)
  return res.text()
}