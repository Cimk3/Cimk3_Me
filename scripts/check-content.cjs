const fs = require('node:fs/promises')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

async function filesBelow(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => [])
  const nested = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? filesBelow(file) : [file]
  }))
  return nested.flat()
}

async function validateContent(projectRoot) {
  const publicRoot = path.join(projectRoot, 'public')
  const { dateValue } = await import(pathToFileURL(path.join(__dirname, '../src/utils/content-data.mjs')))
  const { validateResources } = await import(pathToFileURL(path.join(__dirname, '../src/utils/resources-data.mjs')))
  const { marked } = await import('marked')
  const errors = []
  const documents = new Map()
  const resources = new Set()
  const report = (source, message) => errors.push(`${source}: ${message}`)
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  const text = value => typeof value === 'string' && value.trim().length > 0
  function requireText(value, source) { if (!text(value)) report(source, '缺少非空文本') }
  function bilingual(item, fields, source, nested = false) {
    const zh = nested ? item.zh : item
    for (const field of fields) {
      requireText(zh?.[field], `${source}.${nested ? 'zh.' : ''}${field}`)
      requireText(item.en?.[field], `${source}.en.${field} (缺译)`)
    }
  }
  function unique(items, field, source) {
    const seen = new Set()
    for (const [index, item] of items.entries()) {
      if (!object(item)) { report(`${source}[${index}]`, '条目必须为对象'); continue }
      const id = item[field]
      if ((!text(id) && !Number.isInteger(id)) || id === '') report(`${source}[${index}].${field}`, '缺少有效标识')
      else if (seen.has(String(id))) report(source, `重复 ${field}: ${id}`)
      else seen.add(String(id))
    }
  }
  function resource(value, source) {
    if (!text(value)) { report(source, '缺少资源路径'); return }
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return
    let decoded
    try { decoded = decodeURIComponent(value.split(/[?#]/)[0]) } catch { report(source, `无效编码路径: ${value}`); return }
    if (!decoded || decoded === '/') return
    const target = path.resolve(publicRoot, decoded.replace(/^\/+/, ''))
    const relative = path.relative(publicRoot, target)
    if (relative.startsWith('..') || path.isAbsolute(relative)) { report(source, `资源路径超出 public: ${value}`); return }
    resources.add(JSON.stringify({ source, value, relative }))
  }
  const publicFiles = await filesBelow(publicRoot)
  for (const file of publicFiles.filter(file => file.endsWith('.json'))) {
    const source = path.relative(publicRoot, file).replaceAll('\\', '/')
    try { documents.set(source, JSON.parse(await fs.readFile(file, 'utf8'))) }
    catch (error) { report(source, `JSON 格式错误: ${error.message}`) }
  }
  const required = ['profile', 'home', 'projects', 'posts', 'inspirations', 'works', 'contacts', 'music', 'resources']
  for (const name of required) {
    const source = `data/${name}.json`
    if (!documents.has(source) && !publicFiles.includes(path.join(publicRoot, source))) report(source, '缺少内容清单')
  }
  for (const [source, data] of documents) {
    if (source === 'data/resources.json') {
      validateResources(data).forEach(message => report(source, message))
      if (Array.isArray(data?.collections)) data.collections.forEach((collection, index) => {
        if (typeof collection?.cover === 'string' && collection.cover) resource(collection.cover, `${source}.collections[${index}].cover`)
      })
    } else if (source === 'data/profile.json') {
      if (!object(data)) { report(source, '资料必须为对象'); continue }
      requireText(data.name, `${source}.name`)
      bilingual(data, ['slogan', 'desc'], source, true)
      resource(data.avatar, `${source}.avatar`)
    } else if (source === 'data/home.json') {
      if (!object(data)) { report(source, '首页配置必须为对象'); continue }
      if (!Array.isArray(data.featured) || !Array.isArray(data.updates)) { report(source, '首页需要 featured 与 updates 数组'); continue }
      unique(data.featured, 'kind', `${source}.featured`)
      unique(data.updates, 'id', `${source}.updates`)
      for (const [index, entry] of data.featured.entries()) {
        if (!object(entry)) continue
        const at = `${source}.featured[${index}]`
        bilingual(entry, ['reason'], at)
        const lookup = { project: ['projects', 'id'], post: ['posts', 'slug'], work: ['works', 'id'] }[entry.kind]
        const records = lookup && documents.get(`data/${lookup[0]}.json`)
        if (!lookup || !Array.isArray(records) || !records.some(item => item?.[lookup[1]] === entry.refId)) report(at, `推荐入口不存在: ${entry.kind}/${entry.refId}`)
      }
      const routes = new Set(['/', '/project', '/blog', '/inspiration', '/works', '/resources', '/connect'])
      const collections = documents.get('data/resources.json')?.collections
      if (Array.isArray(collections)) collections.forEach(collection => { if (collection?.id) routes.add(`/resources/${collection.id}`) })
      const posts = documents.get('data/posts.json')
      const works = documents.get('data/works.json')
      if (Array.isArray(posts)) posts.forEach(post => { if (post?.slug) routes.add(`/blog/${post.slug}`) })
      if (Array.isArray(works)) works.forEach(work => { if (work?.id) routes.add(`/works/${work.id}`) })
      for (const [index, entry] of data.updates.entries()) {
        if (!object(entry)) continue
        const at = `${source}.updates[${index}]`
        bilingual(entry, ['title', 'description'], at)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !Number.isFinite(dateValue(entry.date))) report(at, '无效近况日期')
        if (!routes.has(entry.to)) report(at, `近况入口不存在: ${entry.to}`)
      }
    } else if (source.startsWith('data/')) {
      if (!Array.isArray(data)) { report(source, '内容清单必须为数组'); continue }
      const name = path.basename(source, '.json')
      const identity = { projects: 'id', posts: 'slug', inspirations: 'id', works: 'id', contacts: 'value', music: 'src' }[name]
      if (identity) unique(data, identity, source)
      for (const [index, item] of data.entries()) {
        if (!object(item)) continue
        const at = `${source}[${index}]`
        if (name === 'projects') {
          bilingual(item, ['title', 'description'], at, true)
          for (const language of ['zh', 'en']) {
            for (const field of ['tags', 'highlights']) {
              if (!Array.isArray(item[language]?.[field]) || !item[language][field].length || !item[language][field].every(text)) report(`${at}.${language}.${field}`, '必须为非空文本数组')
            }
          }
          if (item.zh?.approach || item.en?.approach) bilingual(item, ['approach'], at, true)
          if (item.zh?.caseStudy || item.en?.caseStudy) {
            for (const language of ['zh', 'en']) {
              for (const field of ['scenario', 'experience', 'tradeoff']) requireText(item[language]?.caseStudy?.[field], `${at}.${language}.caseStudy.${field}`)
            }
          }
          if (!Array.isArray(item.links) || !item.links.length) report(`${at}.links`, '缺少项目入口')
          else for (const link of item.links) {
            if (!object(link) || !['source', 'website', 'demo', 'updates'].includes(link.kind)) report(`${at}.links`, '无效入口类型')
            try { const url = new URL(link?.href); if (!['https:', 'http:'].includes(url.protocol)) throw new Error() } catch { report(`${at}.links`, '入口必须为 HTTP/HTTPS 网址') }
          }
        }
        if (name === 'posts') {
          bilingual(item, ['title', 'summary'], at)
          if (!Number.isFinite(dateValue(item.date)) || !item.date.includes('T')) report(`${at}.date`, '无效文章日期，应为含时区的 ISO 时间')
          resource(item.md, `${at}.md`)
        }
        if (name === 'inspirations') {
          bilingual(item, ['title'], at)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(item.time) || !Number.isFinite(dateValue(item.time))) report(`${at}.time`, '无效日期，应为 YYYY-MM-DD')
          resource(item.md, `${at}.md`)
          resource(item.image, `${at}.image`)
        }
        if (name === 'works') {
          bilingual(item, ['title', 'description'], at)
          resource(item.cover, `${at}.cover`)
          resource(`/works/${item.id}.json`, `${at}.id`)
          const detail = documents.get(`works/${item.id}.json`)
          if (detail && detail.id !== item.id) report(at, '列表与作品详情的 ID 不一致')
        }
        if (name === 'music') { requireText(item.title, `${at}.title`); resource(item.src, `${at}.src`) }
        if (name === 'contacts') {
          if (!['email', 'qq', 'wechat', 'xiaohongshu', 'github', 'gitee'].includes(item.key)) report(`${at}.key`, '联系渠道缺少双语标签')
          requireText(item.icon, `${at}.icon`)
          if (!item.copyable) {
            try { if (!['https:', 'http:'].includes(new URL(item.value).protocol)) throw new Error() } catch { report(`${at}.value`, '联系链接必须为 HTTP/HTTPS 网址') }
          }
        }
      }
    } else if (source.startsWith('works/')) {
      if (!object(data)) { report(source, '作品详情必须为对象'); continue }
      requireText(data.id, `${source}.id`)
      if (data.id !== path.basename(source, '.json')) report(source, '作品 ID 必须与文件名一致')
      bilingual(data, ['title', 'description'], source)
      resource(data.cover, `${source}.cover`)
      if (!Array.isArray(data.chapters)) { report(source, '缺少章节数组'); continue }
      unique(data.chapters, 'id', `${source}.chapters`)
      data.chapters.forEach((chapter, index) => {
        if (!object(chapter)) return
        bilingual(chapter, ['title'], `${source}.chapters[${index}]`)
        if (chapter.kind && !['story', 'reference'].includes(chapter.kind)) report(`${source}.chapters[${index}]`, '无效章节类型')
        resource(`/chapters/${data.id}/${chapter.id}.md`, `${source}.chapters[${index}]`)
      })
      if (data.readingGuide) {
        const guide = data.readingGuide
        const at = `${source}.readingGuide`
        bilingual(guide, ['genre', 'relation', 'order'], at)
        if (!data.chapters.some(chapter => chapter?.id === guide.startChapter && chapter.kind !== 'reference')) report(at, '正文入口章节不存在')
        if (guide.relatedWorkId === data.id || !documents.has(`works/${guide.relatedWorkId}.json`)) report(at, '关联作品不存在或指向自身')
        if (!/^\d{4}-\d{2}-\d{2}$/.test(guide.updated) || !Number.isFinite(dateValue(guide.updated))) report(at, '无效阅读说明日期')
      }
    }
  }
  // Check all Markdown, including currently unlisted drafts, without network access.
  for (const file of publicFiles.filter(file => file.endsWith('.md'))) {
    const source = path.relative(publicRoot, file)
    const md = await fs.readFile(file, 'utf8')
    marked.walkTokens(marked.lexer(md), token => {
      if (token.type === 'image' || token.type === 'link') resource(token.href, source)
      if (token.type === 'html') scanStatic(token.raw, source)
    })
  }
  function scanStatic(contents, source) {
    for (const match of contents.matchAll(/(?<![:\w-])(?:src|href)=["']([^"']+)["']/g)) {
      const value = match[1].replace('<%= BASE_URL %>', '/')
      if (!/[{}<>]/.test(value)) resource(value, source)
    }
    for (const match of contents.matchAll(/url\(["']?(\/[^\s)"']+)/g)) resource(match[1], source)
  }
  for (const file of [...await filesBelow(path.join(projectRoot, 'src')), path.join(publicRoot, 'index.html')]) {
    if (/\.(vue|css|js|html)$/.test(file)) {
      try { scanStatic(await fs.readFile(file, 'utf8'), path.relative(projectRoot, file)) } catch { /* Optional in test fixtures. */ }
    }
  }
  for (const reference of resources) {
    const { source, value, relative } = JSON.parse(reference)
    let directory = publicRoot
    let found = true
    for (const segment of relative.split(path.sep)) {
      const names = await fs.readdir(directory).catch(() => [])
      if (!names.includes(segment)) {
        report(source, `${names.some(name => name.toLowerCase() === segment.toLowerCase()) ? '资源大小写不匹配' : '资源缺失'}: ${value}`)
        found = false
        break
      }
      directory = path.join(directory, segment)
    }
    if (found && !(await fs.stat(directory)).isFile()) report(source, `资源不是文件: ${value}`)
  }
  return { errors, jsonCount: documents.size, resourceCount: resources.size }
}

module.exports = { validateContent }
if (require.main === module) {
  validateContent(path.resolve(__dirname, '..')).then(result => {
    if (result.errors.length) { console.error(result.errors.join('\n')); process.exitCode = 1 }
    else console.log(`内容检查通过：${result.jsonCount} 个 JSON，${result.resourceCount} 处资源引用。`)
  }).catch(error => { console.error(error); process.exitCode = 1 })
}
