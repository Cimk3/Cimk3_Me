<template>
  <div class="resources-page">
    <router-link v-if="isDetail" class="resources-back" :to="{ name: 'resources', query: route.query }">
      <el-icon aria-hidden="true"><ArrowLeft /></el-icon>{{ t('resources.back') }}
    </router-link>
    <header class="resources-header">
      <h1>{{ heading }}</h1>
      <p v-if="!isDetail">{{ t('resources.intro') }}</p>
      <p v-else-if="currentCollection">{{ localized(currentCollection, locale).description }}</p>
    </header>

    <el-skeleton v-if="loading" :rows="7" animated />
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <el-empty v-else-if="isDetail && !currentCollection" :description="t('resources.notFoundText')">
      <router-link class="resource-text-action" :to="{ name: 'resources' }">{{ t('resources.back') }}</router-link>
    </el-empty>
    <template v-else>
      <div class="resources-toolbar">
        <div class="resource-search">
          <el-icon aria-hidden="true"><Search /></el-icon>
          <input v-model="search" type="search" :aria-label="t(isDetail ? 'resources.searchInside' : 'resources.search')" :placeholder="t(isDetail ? 'resources.searchInside' : 'resources.search')" />
          <button v-if="search" type="button" :aria-label="t('resources.clear')" @click="search = ''"><el-icon aria-hidden="true"><Close /></el-icon></button>
        </div>
        <div v-if="!isDetail" class="resource-categories" role="group" :aria-label="t('menu.resources')">
          <button v-for="value in ['all', 'study', 'game']" :key="value" type="button" :class="{ selected: category === value }" :aria-pressed="category === value" @click="category = value">{{ t(`resources.${value}`) }}</button>
        </div>
      </div>

      <div v-if="isDetail && currentCollection" class="detail-summary">
        <span>{{ t('resources.count', { count: currentCollection.items.length }) }}</span>
        <span>{{ t('resources.updated', { date: formatDate(currentCollection.updated, locale) }) }}</span>
      </div>

      <template v-if="!isDetail && !hasSearch">
        <el-empty v-if="!visibleCollections.length" :description="t('resources.noCollections')" />
        <div v-else class="resource-collections">
          <article v-for="collection in visibleCollections" :key="collection.id" class="collection-card">
            <router-link class="collection-cover-link" :to="collectionLink(collection)" :aria-label="`${t('resources.view')}: ${localized(collection, locale).title}`" tabindex="-1" aria-hidden="true">
              <img :src="collection.cover" alt="" class="collection-cover" width="960" height="320" />
            </router-link>
            <div class="collection-copy">
              <h2><router-link :to="collectionLink(collection)">{{ localized(collection, locale).title }}</router-link></h2>
              <p>{{ localized(collection, locale).description }}</p>
              <div class="collection-footer">
                <div class="collection-meta"><span>{{ t('resources.count', { count: collection.items.length }) }}</span><span>{{ t('resources.updated', { date: formatDate(collection.updated, locale) }) }}</span></div>
                <router-link class="resource-text-action" :to="collectionLink(collection)">{{ t('resources.view') }}<el-icon aria-hidden="true"><Right /></el-icon></router-link>
              </div>
            </div>
          </article>
        </div>
      </template>
      <template v-else>
        <p v-if="hasSearch && entries.length" class="search-count" role="status">{{ t('resources.searchResults', { count: entries.length }) }}</p>
        <el-empty v-if="!entries.length" :description="t(hasSearch ? 'resources.noResults' : 'resources.empty')">
          <el-button v-if="hasSearch" @click="resetSearch">{{ t(isDetail ? 'resources.clear' : 'resources.reset') }}</el-button>
        </el-empty>
        <ResourceList v-else :entries="entries" :show-collection="!isDetail" />
      </template>
      <p class="resources-footnote">{{ t('resources.external') }}</p>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchJson, ContentError } from '@/utils/content'
import { localized, formatDate } from '@/utils/content-data.mjs'
import { queryText, resourceCategory, filterResourceCollections, searchResources, validateResources } from '@/utils/resources-data.mjs'
import { useMountedContent } from '@/composables/useContent'
import { usePageTitle } from '@/composables/usePageTitle'
import LoadError from '@/components/LoadError.vue'
import ResourceList from '@/components/ResourceList.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { data: collections, loading, error, load } = useMountedContent(async () => {
  const data = await fetchJson('/data/resources.json')
  if (validateResources(data).length) throw new ContentError('json')
  return data.collections
}, [])
const isDetail = computed(() => typeof route.params.collectionId === 'string')
const currentCollection = computed(() => collections.value.find(collection => collection.id === route.params.collectionId))
function updateQuery(values) {
  router.replace({ path: route.path, query: { ...route.query, ...values } })
}
const search = computed({ get: () => queryText(route.query.q), set: value => updateQuery({ q: value || undefined }) })
const category = computed({ get: () => resourceCategory(route.query.category), set: value => updateQuery({ category: value === 'all' ? undefined : value }) })
const hasSearch = computed(() => search.value.trim().length > 0)
const visibleCollections = computed(() => filterResourceCollections(collections.value, category.value))
const entries = computed(() => searchResources(isDetail.value ? (currentCollection.value ? [currentCollection.value] : []) : collections.value, { q: search.value, category: isDetail.value ? 'all' : category.value }))
const collectionLink = collection => ({ name: 'resource-collection', params: { collectionId: collection.id }, query: route.query })
function resetSearch() { updateQuery({ q: undefined, ...(isDetail.value ? {} : { category: undefined }) }) }
const heading = computed(() => {
  if (!isDetail.value || loading.value || error.value) return t('menu.resources')
  return currentCollection.value ? localized(currentCollection.value, locale.value).title : t('resources.notFound')
})
usePageTitle(() => error.value ? t('error.title') : isDetail.value && currentCollection.value ? `${localized(currentCollection.value, locale.value).title} | ${t('menu.resources')}` : heading.value)
</script>

<style scoped>
.resources-page {
  --resource-secondary: #717784;
  font-family: "Microsoft YaHei", "Noto Sans SC", "Noto Sans CJK SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 8px 4px;
  color: var(--text-color);
}
html.dark .resources-page { --resource-secondary: #a3a6ad; }
.resources-header { margin-bottom: 40px; }
.resources-header h1 { font-size: 42px; line-height: 1.4; margin-bottom: 12px; overflow-wrap: anywhere; }
.resources-header p { font-size: 18px; line-height: 1.8; color: var(--resource-secondary); max-width: 800px; }
.resources-toolbar { display: flex; align-items: center; gap: 26px; margin-bottom: 32px; }
.resource-search { display: flex; align-items: center; gap: 12px; width: min(100%, 540px); min-width: 0; padding: 0 16px; height: 46px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--content-bg); color: var(--resource-secondary); }
.resource-search:focus-within { border-color: var(--link-color); box-shadow: 0 0 0 2px var(--el-color-primary-light-9); }
.resource-search input { flex: 1; width: 100%; min-width: 0; border: 0; outline: none; font: inherit; font-size: 15px; color: var(--text-color); background: transparent; }
.resource-search input::placeholder { color: var(--resource-secondary); }
.resource-search input::-webkit-search-cancel-button { -webkit-appearance: none; }
.resource-search button { display: inline-flex; border: 0; background: transparent; color: var(--resource-secondary); cursor: pointer; padding: 6px; }
.resource-categories { display: flex; gap: 10px; flex-shrink: 0; }
.resource-categories button { min-width: 88px; padding: 9px 18px; border: 1px solid var(--border-color); border-radius: 22px; background: var(--content-bg); color: var(--text-color); font: inherit; font-size: 15px; cursor: pointer; }
.resource-categories button.selected { color: white; border-color: #1269bd; background: #1269bd; }
.resource-collections { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.collection-card { min-width: 0; overflow: hidden; background: var(--content-bg); border: 1px solid var(--border-color); border-radius: 14px; padding: 12px 12px 0; }
.collection-cover-link { display: block; overflow: hidden; border-radius: 9px; }
.collection-cover { display: block; width: 100%; height: auto; aspect-ratio: 3.5 / 1; object-fit: cover; }
.collection-copy { padding: 16px 6px 20px; }
.collection-copy h2 { font-size: 22px; line-height: 1.5; margin-bottom: 8px; overflow-wrap: anywhere; }
.collection-copy h2 a { color: inherit; text-decoration: none; }
.collection-copy h2 a:hover { color: var(--link-color); }
.collection-copy p { min-height: 3.4em; font-size: 16px; line-height: 1.7; color: var(--text-color); overflow-wrap: anywhere; }
.collection-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
.collection-meta, .detail-summary { display: flex; flex-wrap: wrap; gap: 6px 14px; color: var(--resource-secondary); font-size: 13px; line-height: 1.7; }
.resource-text-action { display: inline-flex; align-items: center; gap: 6px; color: var(--link-color); text-decoration: none; white-space: nowrap; font-size: 14px; }
.resource-text-action:hover { text-decoration: underline; text-underline-offset: 4px; }
.resources-footnote { margin-top: 26px; text-align: right; font-size: 12px; line-height: 1.8; color: var(--resource-secondary); }
.resources-back { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 20px; font-size: 14px; color: var(--resource-secondary); text-decoration: none; }
.resources-back:hover { color: var(--link-color); }
.detail-summary { margin-bottom: 4px; }
.search-count { color: var(--resource-secondary); font-size: 14px; margin-bottom: 4px; }
@media (max-width: 1100px) { .resources-toolbar { gap: 16px; } .resource-categories button { min-width: 60px; padding: 9px 14px; } }
@media (max-width: 900px) { .resources-header { margin-bottom: 26px; } .resources-header h1 { font-size: 34px; } .resource-collections { grid-template-columns: minmax(0, 1fr); } .resources-toolbar { align-items: stretch; flex-direction: column; } .resource-search { width: 100%; } }
@media (max-width: 480px) { .resources-page { padding: 8px 0; } .resources-header h1 { font-size: 28px; } .resources-header p { font-size: 15px; } .collection-copy h2 { font-size: 20px; } .collection-copy { padding: 14px 4px 18px; } .resources-footnote { text-align: left; } }
</style>
