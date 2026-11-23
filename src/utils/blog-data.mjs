import { dateValue, newestFirst } from './content-data.mjs'

export const blogCategories = ['technical', 'essay', 'announcement']
export const queryValue = value => typeof value === 'string' ? value : ''
export const postCategory = post => blogCategories.includes(post.category) ? post.category : 'essay'
export const postYear = post => new Intl.DateTimeFormat('en', { timeZone: 'Asia/Shanghai', year: 'numeric' }).format(dateValue(post.date))

export function filterPosts(posts, { q = '', category = '', year = '' } = {}) {
  const keyword = q.trim().toLocaleLowerCase()
  return newestFirst(posts).filter(post => {
    const text = [post.title, post.summary, post.en?.title, post.en?.summary].join(' ').toLocaleLowerCase()
    return (!keyword || text.includes(keyword)) && (!category || postCategory(post) === category) && (!year || postYear(post) === year)
  })
}

export function resolveTopicItem(item, catalog) {
  const sources = { post: ['posts', 'slug', '/blog/'], project: ['projects', 'id', '/project'], resource: ['resources', 'id', '/resources/'] }
  const source = sources[item.kind]
  const records = source && catalog[source[0]]
  const record = Array.isArray(records) && records.find(record => record?.[source[1]] === item.refId)
  if (!record) return null
  return { ...record, kind: item.kind, to: item.kind === 'project' ? `${source[2]}?project=${encodeURIComponent(item.refId)}` : source[2] + item.refId }
}
