import { dateValue } from './content-data.mjs'

export function queryText(value) {
  return typeof value === 'string' ? value : ''
}

export function resourceCategory(value) {
  return value === 'study' || value === 'game' ? value : 'all'
}

function contains(record, query) {
  return [record.title, record.description, record.en?.title, record.en?.description]
    .some(value => typeof value === 'string' && value.toLocaleLowerCase().includes(query))
}

export function filterResourceCollections(collections, category) {
  const selected = resourceCategory(category)
  return collections.filter(collection => selected === 'all' || collection.category === selected)
}

export function searchResources(collections, { q = '', category = 'all' } = {}) {
  const query = queryText(q).trim().toLocaleLowerCase()
  return filterResourceCollections(collections, category).flatMap(collection => {
    const topicMatches = query === '' || contains(collection, query)
    return collection.items.filter(item => topicMatches || contains(item, query))
      .map(item => ({ collection, item }))
  })
}

// Shared by the browser loader and the build-time checker.
export function validateResources(data) {
  const errors = []
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  const text = value => typeof value === 'string' && value.trim().length > 0
  const fail = (at, message) => errors.push(`${at}: ${message}`)
  if (!object(data) || !Array.isArray(data.collections)) return ['collections: 必须为数组']
  const seenCollections = new Set()
  function id(value, seen, at) {
    if (!text(value) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) fail(at, 'ID 必须为小写字母、数字及连字符')
    else if (seen.has(value)) fail(at, `重复 ID: ${value}`)
    else seen.add(value)
  }
  function bilingual(value, at) {
    for (const field of ['title', 'description']) {
      if (!text(value[field])) fail(`${at}.${field}`, '缺少非空文本')
      if (!object(value.en) || !text(value.en[field])) fail(`${at}.en.${field}`, '缺少英文翻译')
    }
  }
  data.collections.forEach((collection, index) => {
    const at = `collections[${index}]`
    if (!object(collection)) { fail(at, '合集必须为对象'); return }
    id(collection.id, seenCollections, `${at}.id`)
    bilingual(collection, at)
    if (!['study', 'game'].includes(collection.category)) fail(`${at}.category`, '分类必须为 study/game')
    if (!text(collection.cover) || !collection.cover.startsWith('/') || collection.cover.startsWith('//')) fail(`${at}.cover`, '封面必须为站内绝对路径')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(collection.updated) || !Number.isFinite(dateValue(collection.updated))) fail(`${at}.updated`, '无效整理日期')
    if (!Array.isArray(collection.items)) { fail(`${at}.items`, '资源条目必须为数组'); return }
    const seenItems = new Set()
    const seenUrls = new Set()
    collection.items.forEach((item, itemIndex) => {
      const itemAt = `${at}.items[${itemIndex}]`
      if (!object(item)) { fail(itemAt, '资源必须为对象'); return }
      id(item.id, seenItems, `${itemAt}.id`)
      bilingual(item, itemAt)
      try {
        if (!text(item.url)) throw new Error('empty')
        const url = new URL(item.url)
        if (!['https:', 'http:'].includes(url.protocol)) throw new Error('protocol')
        if (seenUrls.has(url.href)) fail(`${itemAt}.url`, '同一合集内重复链接')
        seenUrls.add(url.href)
      } catch { fail(`${itemAt}.url`, '资源地址必须为 HTTP/HTTPS 网址') }
      if (!['documentation', 'tool', 'sample'].includes(item.type)) fail(`${itemAt}.type`, '无效资源类型')
      if (!Array.isArray(item.languages) || !item.languages.length || item.languages.some(language => !['zh', 'en'].includes(language))) fail(`${itemAt}.languages`, '资源语言必须为非空的 zh/en 数组')
      if (item.edition != null && !['bedrock', 'java'].includes(item.edition)) fail(`${itemAt}.edition`, '游戏版本必须为 bedrock/java')
    })
  })
  return errors
}
