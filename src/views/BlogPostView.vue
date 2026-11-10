<template>
  <div class="blog-post">
    <router-link to="/blog" class="back-btn">
      <el-icon :size="16"><Icon icon="mdi:arrow-left" /></el-icon>
      <span>{{ t('msg.back') }}</span>
    </router-link>

    <div v-if="loading" class="blog-post-loading">
      <el-skeleton :rows="6" animated />
    </div>
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <template v-else>
      <h1 class="post-title">{{ current.title }}</h1>
      <p class="post-date">{{ formatDate(data.post.date, locale) }}</p>
      <!-- v-html 渲染 marked 解析后的 HTML -->
      <BodyNotice />
      <article class="md-body" lang="zh-CN" v-html="data.html"></article>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { fetchJson, fetchText, ContentError } from '@/utils/content'
import { localized, formatDate } from '@/utils/content-data.mjs'
import { useMountedContent } from '@/composables/useContent'
import { usePageTitle } from '@/composables/usePageTitle'
import LoadError from '@/components/LoadError.vue'
import BodyNotice from '@/components/BodyNotice.vue'
const { t, locale } = useI18n()
const slug = useRoute().params.slug
const { data, loading, error, load } = useMountedContent(async () => {
  const posts = await fetchJson('/data/posts.json')
  const post = posts.find(item => item.slug === slug)
  if (!post) throw new ContentError('notFound')
  return { post, html: marked.parse(await fetchText(post.md)) }
})
const current = computed(() => localized(data.value?.post, locale.value))
usePageTitle(() => error.value ? t('error.title') : loading.value ? t('menu.blog') : current.value.title)
</script>

<style scoped>
.blog-post {
  max-width: 800px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  padding: 6px 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s, background-color 0.2s;
}

.back-btn:hover {
  color: var(--el-color-primary);
  background-color: var(--bg-color);
}

.post-title {
  font-size: 28px;
  color: var(--text-color);
}

.post-date {
  margin: 8px 0 24px;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>