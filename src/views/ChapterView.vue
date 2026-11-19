<template>
  <div class="chapter">
    <div v-if="loading" class="chapter-loading">
      <el-skeleton :rows="6" animated />
    </div>
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <div v-else class="chapter-sheet">
      <header class="chapter-header">
        <router-link :to="`/works/${novelId}`" class="back-btn">
          <el-icon aria-hidden="true"><ArrowLeft /></el-icon>
          {{ t('chapter.directory') }}
        </router-link>
        <p class="chapter-book">{{ bookTitle }}</p>
        <h1>{{ current.title }}</h1>
        <BodyNotice />
      </header>
      <article class="md-body chapter-content" lang="zh-CN" v-html="data.html"></article>

      <nav class="chapter-nav" :aria-label="t('chapter.navigation')">
        <template v-for="item in chapterLinks" :key="item.direction">
          <router-link v-if="item.chapter" :to="`/works/${novelId}/${item.chapter.id}`" class="nav-btn">
            <span class="nav-label">{{ t(`chapter.${item.direction}`) }}</span>
            <span>{{ chapterFor(item.chapter).title }}</span>
          </router-link>
          <div v-else class="nav-btn nav-end">
            <span class="nav-label">{{ t(`chapter.${item.direction}`) }}</span>
            <span>{{ t(item.endMessage) }}</span>
          </div>
        </template>
      </nav>
    </div>
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
  const markdown = await fetchText(`/chapters/${novelId}/${chapterId}.md`)
  const tokens = marked.lexer(markdown)
  // The header already renders the book and chapter names. Keep all other headings.
  const headingText = token => token?.type === 'heading' ? token.text.replace(/<br\s*\/?>\s*$/i, '').trim() : ''
  let chapterHeading = tokens.findIndex(token => token.type !== 'space')
  if (headingText(tokens[chapterHeading]) === `《${novel.title}》`) {
    chapterHeading = tokens.findIndex((token, position) => position > chapterHeading && token.type !== 'space')
  }
  if (chapterHeading >= 0 && headingText(tokens[chapterHeading]) === chapters[index].title) {
    tokens.splice(0, chapterHeading + 1)
  }
  const html = marked.parser(tokens)
  return { novel, chapters, index, html }
})
const chapterFor = chapter => localized(chapter, locale.value)
const current = computed(() => chapterFor(data.value?.chapters[data.value.index]))
const bookTitle = computed(() => localized(data.value?.novel, locale.value).title)
const chapterLinks = computed(() => [
  { direction: 'previous', chapter: data.value?.chapters[data.value.index - 1], endMessage: 'msg.noPrev' },
  { direction: 'next', chapter: data.value?.chapters[data.value.index + 1], endMessage: 'msg.noNext' }
])
usePageTitle(() => error.value ? t('error.title') : loading.value ? t('menu.works') : `${current.value.title} | ${bookTitle.value}`)
</script>

<style scoped>
.chapter {
  max-width: 800px;
  margin-inline: auto;
}

.chapter-sheet {
  padding: clamp(18px, 5vw, 48px);
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  color: var(--text-color);
}

.chapter-header {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  margin-bottom: 18px;
  color: var(--link-color);
  text-decoration: none;
  font-size: 14px;
}

.back-btn:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.chapter-book {
  margin-bottom: 6px;
  color: var(--link-color);
  font-size: 14px;
  line-height: 1.6;
}

.chapter-header h1 {
  font-family: "宋体", SimSun, serif;
  font-size: clamp(26px, 4vw, 34px);
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.chapter-content :deep(p) {
  font-family: "宋体", SimSun, serif;
}

.chapter-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.nav-btn {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-color);
  text-decoration: none;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

a.nav-btn:hover {
  border-color: var(--link-color);
  color: var(--link-color);
}

.nav-label { color: var(--link-color); font-size: 13px; }
.nav-end, .nav-end .nav-label { color: var(--text-secondary); }

@media (max-width: 640px) {
  .chapter-nav { grid-template-columns: minmax(0, 1fr); }
}
</style>
