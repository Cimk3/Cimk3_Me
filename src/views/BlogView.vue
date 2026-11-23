<template>
  <div class="blog catalog-page">
    <header class="catalog-header"><h1>{{ t('menu.blog') }}</h1></header>
    <section class="blog-topics" :aria-label="t('blog.topics')">
      <h2>{{ t('blog.topics') }}</h2>
      <el-skeleton v-if="topicLoading" :rows="2" animated />
      <LoadError v-else-if="topicError" :error="topicError" @retry="loadTopics" />
      <div v-else class="topic-grid">
        <router-link v-for="topic in topics" :key="topic.id" :to="topicLink(topic.id)" class="topic-card">
          <h3>{{ localized(topic, locale).title }}</h3>
          <p>{{ localized(topic, locale).description }}</p>
          <span>{{ t('blog.topicCount', { count: topic.items.length }) }} →</span>
        </router-link>
      </div>
    </section>
    <section :aria-label="t('blog.archive')">
      <h2 class="archive-title">{{ t('blog.archive') }}</h2>
      <div class="blog-filters">
        <label class="search-field"><span>{{ t('blog.search') }}</span><input type="search" v-model="search" :placeholder="t('blog.searchPlaceholder')" /></label>
        <label><span>{{ t('blog.category') }}</span><select v-model="category" :aria-label="t('blog.category')"><option value="">{{ t('blog.allCategories') }}</option><option v-for="kind in blogCategories" :key="kind" :value="kind">{{ t(`blog.categories.${kind}`) }}</option></select></label>
        <label><span>{{ t('blog.year') }}</span><select v-model="year" :aria-label="t('blog.year')"><option value="">{{ t('blog.allYears') }}</option><option v-for="value in years" :key="value" :value="value">{{ value }}</option></select></label>
        <button v-if="hasFilters" type="button" class="clear-filters" @click="reset">{{ t('blog.reset') }}</button>
      </div>
      <el-skeleton v-if="loading" :rows="4" animated />
      <LoadError v-else-if="error" :error="error" @retry="load" />
      <template v-else>
        <p class="result-count" role="status">{{ t('blog.resultCount', { count: filtered.length }) }}</p>
        <el-empty v-if="!filtered.length" :description="t(hasFilters ? 'blog.noResults' : 'msg.empty')" />
        <section v-for="group in groups" :key="group.year" class="year-group" :aria-label="group.year">
          <h3 class="year-heading">{{ group.year }}</h3>
          <router-link v-for="post in group.posts" :key="post.slug" :to="{ path: `/blog/${post.slug}`, query: route.query }" class="post-link">
            <div class="post-meta"><time :datetime="post.date">{{ formatDate(post.date, locale) }}</time><span>{{ t(`blog.categories.${postCategory(post)}`) }}</span></div>
            <h4>{{ localized(post, locale).title }}</h4>
            <p class="catalog-summary">{{ localized(post, locale).summary }}</p>
          </router-link>
        </section>
        <el-pagination v-if="filtered.length > pageSize" class="blog-pagination" background layout="prev, pager, next" :total="filtered.length" :page-size="pageSize" v-model:current-page="page" />
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { useMountedContent } from '@/composables/useContent'
import { localized, formatDate } from '@/utils/content-data.mjs'
import { blogCategories, filterPosts, postYear, postCategory, queryValue } from '@/utils/blog-data.mjs'
import LoadError from '@/components/LoadError.vue'
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { data: posts, loading, error, load } = useMountedContent(() => fetchJson('/data/posts.json'), [])
const { data: topics, loading: topicLoading, error: topicError, load: loadTopics } = useMountedContent(() => fetchJson('/data/topics.json'), [])
function updateQuery(changes) {
  const query = { ...route.query, page: undefined, ...changes }
  router.replace({ query })
}
const search = computed({ get: () => queryValue(route.query.q), set: value => updateQuery({ q: value || undefined }) })
const category = computed({ get: () => blogCategories.includes(route.query.category) ? route.query.category : '', set: value => updateQuery({ category: value || undefined }) })
const years = computed(() => [...new Set(posts.value.map(postYear))].sort().reverse())
const year = computed({ get: () => years.value.includes(route.query.year) ? route.query.year : '', set: value => updateQuery({ year: value || undefined }) })
const filtered = computed(() => filterPosts(posts.value, { q: search.value, category: category.value, year: year.value }))
const pageSize = 5
const page = computed({
  get: () => Math.min(Math.max(1, Math.floor(Number(queryValue(route.query.page))) || 1), Math.max(1, Math.ceil(filtered.value.length / pageSize))),
  set: value => router.push({ query: { ...route.query, page: value > 1 ? String(value) : undefined } })
})
const groups = computed(() => {
  const result = []
  for (const post of filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize)) {
    const value = postYear(post)
    if (result.at(-1)?.year !== value) result.push({ year: value, posts: [] })
    result.at(-1).posts.push(post)
  }
  return result
})
const hasFilters = computed(() => !!(search.value || category.value || year.value))
const reset = () => updateQuery({ q: undefined, category: undefined, year: undefined })
const topicLink = id => ({ path: `/blog/topics/${id}`, query: route.query })
</script>

<style scoped>
.blog-topics { margin-bottom: 36px; }
.blog-topics h2, .archive-title { font-size: 20px; margin-bottom: 16px; }
.topic-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.topic-card, .post-link { display: block; padding: 22px; color: var(--text-color); background: var(--content-bg); border: 1px solid var(--border-color); border-radius: 14px; text-decoration: none; overflow-wrap: anywhere; }
.topic-card:hover, .post-link:hover { border-color: var(--link-color); }
.topic-card h3 { font-size: 18px; }
.topic-card p { margin: 10px 0 16px; color: var(--text-color); line-height: 1.7; }
.topic-card span { color: var(--link-color); font-size: 13px; }
.blog-filters { display: flex; gap: 14px; flex-wrap: wrap; align-items: end; margin-bottom: 18px; }
.blog-filters label { display: flex; flex-direction: column; gap: 7px; font-size: 13px; color: var(--text-color); }
.search-field { flex: 1; min-width: min(240px, 100%); }
.blog-filters input, .blog-filters select { width: 100%; height: 42px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--content-bg); color: var(--text-color); font: inherit; font-size: 15px; }
.clear-filters { height: 42px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--content-bg); color: var(--link-color); cursor: pointer; }
.result-count, .post-meta { font-size: 13px; color: var(--catalog-muted); }
.year-heading { margin: 22px 0 14px; font-size: 22px; }
.post-link { margin-bottom: 14px; }
.post-meta { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
.post-link h4 { font-size: 18px; line-height: 1.6; margin-bottom: 8px; }
.blog-pagination { justify-content: center; margin-top: 24px; }
@media (max-width: 640px) { .topic-grid { grid-template-columns: minmax(0, 1fr); } .blog-filters label { flex: 1; min-width: 0; } .blog-filters .search-field { flex-basis: 100%; } .topic-card, .post-link { padding: 18px; } }
</style>
