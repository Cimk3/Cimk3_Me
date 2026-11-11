const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

function fixture() {
  const item = (id, title, enTitle) => ({ id, title, description: `${title}的使用说明`, url: `https://example.com/${id}`, type: 'documentation', languages: ['zh', 'en'], en: { title: enTitle, description: `Read about ${enTitle}` } })
  const collection = (id, category, title, enTitle, items) => ({ id, category, title, description: `${title}资料`, cover: `/images/${id}.webp`, updated: '2026-11-11', en: { title: enTitle, description: `Guides to ${enTitle}` }, items })
  return { collections: [
    collection('frontend', 'study', '前端学习', 'Frontend Learning', [item('vue', 'Vue 指南', 'Vue Guide'), item('mdn', '基础教程', 'MDN Basics')]),
    collection('minecraft', 'game', '游戏创作', 'Minecraft Creation', [item('creator', '创作者文档', 'Creator Documentation')])
  ] }
}

test('resource search matches either language, ignores case and surrounding space', async () => {
  const { searchResources } = await import('../src/utils/resources-data.mjs')
  const { collections } = fixture()
  assert.equal(searchResources(collections, { q: '  vUe  ' })[0].item.id, 'vue')
  assert.equal(searchResources(collections, { q: '基础' })[0].item.id, 'mdn')
  assert.equal(searchResources(collections, { q: 'Read about MDN' })[0].item.id, 'mdn')
  assert.equal(searchResources(collections, { q: 'not-present' }).length, 0)
})

test('a topic match includes all its resources and filters combine with search', async () => {
  const { searchResources, filterResourceCollections } = await import('../src/utils/resources-data.mjs')
  const { collections } = fixture()
  assert.deepEqual(searchResources(collections, { q: 'Frontend' }).map(entry => entry.item.id), ['vue', 'mdn'])
  assert.equal(searchResources(collections, { q: '前端', category: 'game' }).length, 0)
  assert.deepEqual(filterResourceCollections(collections, 'study').map(collection => collection.id), ['frontend'])
  assert.equal(searchResources(collections, { q: '   ' }).length, 3)
  assert.equal(searchResources(collections, { category: 'game' }).length, 1)
})

test('query parsing tolerates unknown categories and repeated parameters', async () => {
  const { queryText, resourceCategory } = await import('../src/utils/resources-data.mjs')
  assert.equal(queryText(['Vue', 'MDN']), '')
  assert.equal(queryText(null), '')
  assert.equal(resourceCategory('unknown'), 'all')
  assert.equal(resourceCategory(['study', 'game']), 'all')
  assert.equal(resourceCategory('game'), 'game')
})

test('empty data and empty collections remain valid for the UI empty states', async () => {
  const { validateResources } = await import('../src/utils/resources-data.mjs')
  assert.deepEqual(validateResources({ collections: [] }), [])
  const data = fixture()
  data.collections[0].items = []
  assert.deepEqual(validateResources(data), [])
})

test('rejects duplicate collection IDs, resource IDs, and equivalent URLs', async () => {
  const { validateResources } = await import('../src/utils/resources-data.mjs')
  const data = fixture()
  data.collections.push(structuredClone(data.collections[0]))
  data.collections[0].items.push(structuredClone(data.collections[0].items[0]))
  data.collections[0].items[0].url = 'https://example.com'
  data.collections[0].items[1].url = 'https://example.com/'
  const errors = validateResources(data).join('\n')
  assert.match(errors, /重复 ID: frontend/)
  assert.match(errors, /重复 ID: vue/)
  assert.match(errors, /重复链接/)
})

test('the same resource ID or URL can belong to different collections', async () => {
  const { validateResources } = await import('../src/utils/resources-data.mjs')
  const data = fixture()
  data.collections[1].items = [structuredClone(data.collections[0].items[0])]
  assert.deepEqual(validateResources(data), [])
})

test('rejects bad dates, missing translations, invalid categories and protocols', async () => {
  const { validateResources } = await import('../src/utils/resources-data.mjs')
  const data = fixture()
  const collection = data.collections[0]
  collection.updated = '2026-02-30'
  collection.category = 'other'
  collection.en.title = ''
  collection.items[0].url = 'javascript:alert(1)'
  collection.items[0].languages = '中文'
  collection.items[0].edition = 'all'
  collection.items[0].en = null
  const errors = validateResources(data).join('\n')
  for (const pattern of [/整理日期/, /study\/game/, /英文翻译/, /HTTP\/HTTPS/, /非空的 zh\/en/, /bedrock\/java/]) assert.match(errors, pattern)
})

test('malformed resource payloads are reported without throwing', async () => {
  const { validateResources } = await import('../src/utils/resources-data.mjs')
  for (const data of [null, [], {}, { collections: [null, 42, {}, { items: [null] }] }]) {
    assert.ok(validateResources(data).length > 0)
  }
})

test('the shipped catalogue contains four collections and eight bilingual resources', async () => {
  const { validateResources } = await import('../src/utils/resources-data.mjs')
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/resources.json'), 'utf8'))
  assert.deepEqual(validateResources(data), [])
  assert.equal(data.collections.length, 4)
  assert.equal(data.collections.flatMap(collection => collection.items).length, 8)
  assert.equal(data.collections[2].items.every(item => item.edition === 'bedrock'), true)
  assert.equal(data.collections[3].items.every(item => item.edition === 'java'), true)
})
