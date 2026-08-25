// 统一的 fetch 封装：失败时抛出带状态码的错误信息
export async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`加载 ${url} 失败：HTTP ${res.status}`)
  return res.json()
}

export async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`加载 ${url} 失败：HTTP ${res.status}`)
  return res.text()
}