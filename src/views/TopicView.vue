<template>
  <div class="catalog-page topic-page">
    <router-link class="topic-back" :to="{ path: '/blog', query: route.query }">← {{ t('blog.back') }}</router-link>
    <el-skeleton v-if="loading" :rows="5" animated />
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <template v-else-if="topic">
      <header class="catalog-header"><h1>{{ current.title }}</h1><p class="catalog-summary">{{ current.description }}</p></header>
      <el-empty v-if="!entries.length" :description="t('msg.empty')" />
      <ol class="topic-entries">
        <li v-for="entry in entries" :key="`${entry.kind}/${entry.id || entry.slug}`">
          <span class="entry-kind">{{ t(`blog.kinds.${entry.kind}`) }}</span>
          <router-link :to="entry.kind === 'post' ? { path: entry.to, query: route.query } : entry.to"><h2>{{ localized(entry, locale).title }}</h2></router-link>
          <p class="catalog-summary">{{ localized(entry, locale).summary || localized(entry, locale).description }}</p>
        </li>
      </ol>
    </template>
    <el-empty v-else :description="t('blog.topicMissing')" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { localized } from '@/utils/content-data.mjs'
import { resolveTopicItem } from '@/utils/blog-data.mjs'
import { useMountedContent } from '@/composables/useContent'
import { usePageTitle } from '@/composables/usePageTitle'
import LoadError from '@/components/LoadError.vue'
const route = useRoute()
const { t, locale } = useI18n()
const { data, loading, error, load } = useMountedContent(async () => {
  const [topics, posts, projects, resources] = await Promise.all(['topics', 'posts', 'projects', 'resources'].map(name => fetchJson(`/data/${name}.json`)))
  return { topics, catalog: { posts, projects, resources: resources.collections } }
})
const topic = computed(() => data.value?.topics.find(item => item.id === route.params.topicId))
const current = computed(() => localized(topic.value, locale.value))
const entries = computed(() => (topic.value?.items || []).map(item => resolveTopicItem(item, data.value.catalog)).filter(Boolean))
usePageTitle(() => current.value.title ? `${current.value.title} | ${t('blog.topics')}` : t('blog.topics'))
</script>

<style scoped>
.topic-page { max-width: 800px; }
.topic-back { display: inline-block; margin-bottom: 24px; color: var(--link-color); text-decoration: none; }
.topic-entries { list-style: none; }
.topic-entries li { padding: 22px 0; border-bottom: 1px solid var(--border-color); }
.entry-kind { font-size: 13px; color: var(--catalog-muted); }
.topic-entries a { color: var(--link-color); text-decoration: none; }
.topic-entries h2 { margin: 8px 0; font-size: 20px; line-height: 1.6; overflow-wrap: anywhere; }
</style>
