export function resolveFeatured(featured, collections) {
  const targets = {
    project: { records: collections.projects, key: 'id', href: () => '/project' },
    post: { records: collections.posts, key: 'slug', href: record => `/blog/${record.slug}` },
    work: { records: collections.works, key: 'id', href: record => `/works/${record.id}` }
  }
  return featured.map(entry => {
    const target = targets[entry.kind]
    const record = target?.records?.find(item => item[target.key] === entry.refId)
    if (!record) throw new Error(`Unknown featured reference: ${entry.kind}/${entry.refId}`)
    return { ...entry, record, to: target.href(record) }
  })
}
