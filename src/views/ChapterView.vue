<template>
  <div class="chapter">
    <div v-if="loading" class="chapter-loading">
      <el-skeleton :rows="6" animated />
    </div>
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <template v-else>
      <router-link :to="`/works/${route.params.novelId}`" class="back-btn">
        <el-icon :size="16"><Icon icon="mdi:arrow-left" /></el-icon>
        <span>{{ t('msg.back') }}</span>
      </router-link>
      <h1 class="content-heading">{{ current.title }}</h1>
      <BodyNotice />
      <article class="md-body chapter-content" lang="zh-CN" v-html="data.html"></article>

      <div class="chapter-nav">
        <router-link
          v-if="prevChapter"
          :to="`/works/${route.params.novelId}/${prevChapter.id}`"
          class="nav-btn"
        >
          <el-icon :size="18"><Icon icon="mdi:chevron-left" /></el-icon>
          <span class="nav-text">{{ chapterFor(prevChapter).title }}</span>
        </router-link>
        <span v-else class="nav-btn disabled">
          <el-icon :size="18"><Icon icon="mdi:chevron-left" /></el-icon>
          <span class="nav-text">{{ t('msg.noPrev') }}</span>
        </span>

        <router-link
          v-if="nextChapter"
          :to="`/works/${route.params.novelId}/${nextChapter.id}`"
          class="nav-btn"
        >
          <span class="nav-text">{{ chapterFor(nextChapter).title }}</span>
          <el-icon :size="18"><Icon icon="mdi:chevron-right" /></el-icon>
        </router-link>
        <span v-else class="nav-btn disabled">
          <span class="nav-text">{{ t('msg.noNext') }}</span>
          <el-icon :size="18"><Icon icon="mdi:chevron-right" /></el-icon>
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { fetchJson, fetchText, ContentError } from '@/utils/content'
import { localized } from '@/utils/content-data.mjs'
import { useMountedContent } from '@/composables/useContent'
import { usePageTitle } from '@/composables/usePageTitle'
import LoadError from '@/components/LoadError.vue'
import BodyNotice from '@/components/BodyNotice.vue'
const { t, locale } = useI18n()
const route = useRoute()
const { novelId, chapterId } = route.params
const { data, loading, error, load } = useMountedContent(async () => {
  const novel = await fetchJson(`/works/${novelId}.json`)
  const chapters = novel.chapters || []
  const index = chapters.findIndex(chapter => chapter.id === chapterId)
  if (index < 0) throw new ContentError('notFound')
  const html = marked.parse(await fetchText(`/chapters/${novelId}/${chapterId}.md`))
  return { novel, chapters, index, html }
})
const chapterFor = chapter => localized(chapter, locale.value)
const current = computed(() => chapterFor(data.value?.chapters[data.value.index]))
const prevChapter = computed(() => data.value?.chapters[data.value.index - 1])
const nextChapter = computed(() => data.value?.chapters[data.value.index + 1])
usePageTitle(() => error.value ? t('error.title') : loading.value ? t('menu.works') : `${current.value.title} | ${localized(data.value.novel, locale.value).title}`)
</script>

<style scoped>
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

.chapter-content {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 36px;
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
}

.chapter-nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  max-width: 760px;
  margin: 20px auto 0;
}

.nav-btn {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-color);
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}

.nav-btn:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.nav-btn.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.nav-btn.disabled:hover {
  border-color: var(--border-color);
  color: var(--text-color);
}

.nav-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .chapter-content {
    padding: 20px;
  }

  .chapter-nav {
    flex-direction: column;
  }
}
</style>
