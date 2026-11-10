export class ContentError extends Error {
  constructor(code, details = {}) {
    super(code)
    this.code = code
    this.details = details
  }
}

async function request(url, type) {
  let response
  try { response = await fetch(url) } catch { throw new ContentError('network') }
  if (!response.ok) throw new ContentError(response.status === 404 ? 'notFound' : 'http', { status: response.status })
  try { return await response[type]() } catch { throw new ContentError(type === 'json' ? 'json' : 'network') }
}

export const fetchJson = (url) => request(url, 'json')
export const fetchText = (url) => request(url, 'text')
export const errorMessage = (error, t) => t(`error.${['network', 'notFound', 'http', 'json'].includes(error?.code) ? error.code : 'unknown'}`, error?.details || {})
