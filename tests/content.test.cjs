const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { validateContent } = require('../scripts/check-content.cjs')

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cimk3-content-'))
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  async function write(file, data) {
    const target = path.join(root, 'public', file)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, typeof data === 'string' ? data : JSON.stringify(data))
  }
  const post = { slug: 'hello', title: '你好', summary: '摘要', date: '2026-11-10T08:00:00+08:00', md: '/blog/hello.md', en: { title: 'Hello', summary: 'Summary' } }
  await write('data/profile.json', { name: 'Test', avatar: '/images/avatar.png', zh: { slogan: '你好', desc: '简介' }, en: { slogan: 'Hi', desc: 'About' } })
  for (const list of ['projects', 'inspirations', 'works', 'contacts', 'music']) await write(`data/${list}.json`, [])
  await write('data/posts.json', [post])
  await write('blog/hello.md', '# Hello\n\n![image](/images/avatar.png)')
  await write('images/avatar.png', 'fixture')
  return { root, write, post, check: () => validateContent(root) }
}

test('valid static content and external Markdown links pass', async t => {
  const f = await fixture(t)
  await f.write('blog/hello.md', '[external](https://example.com/a.png)\n![image](/images/avatar.png)')
  assert.deepEqual((await f.check()).errors, [])
})

test('reports invalid JSON and continues collecting other errors', async t => {
  const f = await fixture(t)
  await f.write('data/posts.json', '{invalid')
  await f.write('data/music.json', [{ title: 'Missing', src: '/music/missing.mp3' }])
  const errors = (await f.check()).errors.join('\n')
  assert.match(errors, /JSON 格式错误/)
  assert.match(errors, /资源缺失.*missing.mp3/)
})

test('reports duplicate slug and project ID', async t => {
  const f = await fixture(t)
  await f.write('data/posts.json', [f.post, f.post])
  await f.write('data/projects.json', [{ id: 'same' }, { id: 'same' }])
  const errors = (await f.check()).errors.join('\n')
  assert.match(errors, /重复 slug: hello/)
  assert.match(errors, /重复 id: same/)
})

test('rejects impossible dates and missing translations', async t => {
  const f = await fixture(t)
  await f.write('data/posts.json', [{ ...f.post, date: '2026-02-30T08:00:00+08:00', en: {} }])
  const errors = (await f.check()).errors.join('\n')
  assert.match(errors, /无效文章日期/)
  assert.match(errors, /en.title.*缺译/)
  assert.match(errors, /en.summary.*缺译/)
})

test('detects case-sensitive paths even on Windows', async t => {
  const f = await fixture(t)
  await f.write('blog/hello.md', '![image](/images/Avatar.png)')
  assert.match((await f.check()).errors.join('\n'), /资源大小写不匹配/)
})

test('checks missing Markdown, HTML media and fixed template assets', async t => {
  const f = await fixture(t)
  await f.write('data/posts.json', [{ ...f.post, md: '/blog/missing.md' }])
  await f.write('blog/hello.md', '<img src="/images/missing.png">')
  await fs.mkdir(path.join(f.root, 'src'))
  await fs.writeFile(path.join(f.root, 'src', 'App.vue'), '<video src="/videos/missing.mp4"></video><div :src="dynamic"></div>')
  const errors = (await f.check()).errors.join('\n')
  for (const name of ['missing.md', 'missing.png', 'missing.mp4']) assert.ok(errors.includes(name))
  assert.ok(!errors.includes('dynamic'))
})

test('chapter IDs are scoped to their work; duplicates within a work fail', async t => {
  const f = await fixture(t)
  const novel = id => ({ id, title: id, description: '介绍', en: { title: id, description: 'About' }, cover: '/images/avatar.png', chapters: [{ id: '1', title: '第一章', en: { title: 'Chapter 1' } }] })
  for (const id of ['one', 'two']) {
    await f.write(`works/${id}.json`, novel(id))
    await f.write(`chapters/${id}/1.md`, '# Chapter')
  }
  assert.deepEqual((await f.check()).errors, [])
  const data = novel('one')
  data.chapters.push(data.chapters[0])
  await f.write('works/one.json', data)
  assert.match((await f.check()).errors.join('\n'), /重复 id: 1/)
})

test('checks work-index/detail identity and prevents public path escape', async t => {
  const f = await fixture(t)
  await f.write('data/works.json', [{ id: 'one', title: '作品', description: '简介', en: { title: 'Work', description: 'About' }, cover: '/../outside.png' }])
  await f.write('works/one.json', { id: 'wrong', title: '作品', description: '简介', en: { title: 'Work', description: 'About' }, cover: '/images/avatar.png', chapters: [] })
  const errors = (await f.check()).errors.join('\n')
  assert.match(errors, /ID 不一致/)
  assert.match(errors, /超出 public/)
})

test('handles malformed shapes without crashing', async t => {
  const f = await fixture(t)
  await f.write('data/posts.json', [null, 42, {}])
  await f.write('data/works.json', {})
  assert.ok((await f.check()).errors.length >= 3)
})

test('sort is newest first, stable for ties, and does not mutate the list', async () => {
  const { newestFirst, dateValue, formatDate } = await import('../src/utils/content-data.mjs')
  const items = [{ id: 'old', date: '2026-01-01' }, { id: 'a', date: '2026-11-10' }, { id: 'b', date: '2026-11-10' }]
  assert.deepEqual(newestFirst(items).map(item => item.id), ['a', 'b', 'old'])
  assert.equal(items[0].id, 'old')
  assert.ok(Number.isNaN(dateValue('2026-02-30')))
  assert.ok(Number.isNaN(dateValue('2026-11-10 08:00')))
  assert.ok(Number.isNaN(dateValue('2026-11-10T24:00:00+08:00')))
  assert.equal(dateValue('2026-11-10T08:00:00+08:00'), Date.parse('2026-11-10T00:00:00Z'))
  assert.match(formatDate('2026-11-10', 'en'), /Nov 10, 2026/)
})

test('localization falls back per field for old content and partial translations', async () => {
  const { localized } = await import('../src/utils/content-data.mjs')
  assert.equal(localized({ title: '中文' }, 'en').title, '中文')
  assert.deepEqual(localized({ title: '中文', description: '简介', en: { title: 'English', description: '' } }, 'en').description, '简介')
  assert.equal(localized({ zh: { title: '中文' }, en: { title: 'English' } }, 'zh').title, '中文')
})

test('copy waits for success and propagates rejection or missing API', async () => {
  const { copyText } = await import('../src/utils/clipboard.mjs')
  let complete
  let copied = false
  const pending = copyText('contact', { writeText: () => new Promise(resolve => { complete = resolve }) }).then(() => { copied = true })
  await Promise.resolve()
  assert.equal(copied, false)
  complete()
  await pending
  assert.equal(copied, true)
  await assert.rejects(copyText('contact', { writeText: async () => { throw new Error('denied') } }), /denied/)
  await assert.rejects(copyText('contact', null), /unavailable/)
})
