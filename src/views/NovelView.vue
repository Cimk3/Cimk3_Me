<template>
  <div class="novel">
    <div v-if="loading" class="novel-loading">
      <el-skeleton :rows="5" animated />
    </div>
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <template v-else>
      <router-link to="/works" class="back-btn">
        <el-icon :size="16"><Icon icon="mdi:arrow-left" /></el-icon>
        <span>{{ t('msg.back') }}</span>
      </router-link>

      <div class="novel-head">
        <el-image
          v-if="novel.cover"
          class="novel-cover"
          :src="novel.cover"
          :preview-src-list="[novel.cover]"
          preview-teleported
          fit="cover"
          :alt="current.title"
        />
        <div class="novel-meta">
          <h1>{{ current.title }}</h1>
          <p class="novel-desc">{{ current.description }}</p>
        </div>
      </div>

      <section v-if="novel.readingGuide" class="reading-guide" aria-labelledby="reading-guide-title">
        <h2 id="reading-guide-title">{{ t('novel.guide') }}</h2>
        <p class="reading-genre">{{ guide.genre }}</p>
        <dl>
          <dt>{{ t('novel.relation') }}</dt><dd>{{ guide.relation }}</dd>
          <dt>{{ t('novel.order') }}</dt><dd>{{ guide.order }}</dd>
        </dl>
        <p class="reading-status">{{ t('novel.available', { count: storyChapters.length }) }}</p>
        <p v-if="lastStory" class="reading-status">{{ t('novel.latest') }}：{{ chapterFor(lastStory).title }}</p>
        <p class="reading-updated">{{ t('novel.guideUpdated') }} {{ formatDate(guide.updated, locale) }}</p>
        <div class="reading-actions">
          <router-link :to="`/works/${novel.id}/${guide.startChapter}`">{{ t('novel.start') }}</router-link>
          <router-link :to="`/works/${guide.relatedWorkId}`">{{ t('novel.related') }}</router-link>
        </div>
      </section>

      <div class="chapter-list">
        <router-link
          v-for="ch in novel.chapters"
          :key="ch.id"
          :to="`/works/${novel.id}/${ch.id}`"
          class="chapter-item"
        >
          <span class="chapter-title">{{ chapterFor(ch).title }}</span>
          <el-icon :size="16" class="chapter-arrow"><Icon icon="mdi:chevron-right" /></el-icon>
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { localized, formatDate } from '@/utils/content-data.mjs'
import { usePageTitle } from '@/composables/usePageTitle'
const { t, locale } = useI18n()
const novelId = useRoute().params.novelId
const { data: novel, loading, error, load } = useMountedContent(() => fetchJson(`/works/${novelId}.json`))
const current = computed(() => localized(novel.value, locale.value))
const chapterFor = chapter => localized(chapter, locale.value)
const guide = computed(() => localized(novel.value?.readingGuide, locale.value))
const storyChapters = computed(() => (novel.value?.chapters || []).filter(chapter => chapter.kind !== 'reference'))
const lastStory = computed(() => storyChapters.value[storyChapters.value.length - 1])
usePageTitle(() => error.value ? t('error.title') : loading.value ? t('menu.works') : current.value.title)
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

.novel-head {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.novel-cover {
  display: block;
  width: 160px;
  aspect-ratio: 9 / 16;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
  cursor: zoom-in;
}

.novel-meta h1 {
  margin: 0 0 12px;
  font-size: 24px;
  color: var(--text-color);
}

.novel-desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chapter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-color);
  transition: border-color 0.2s, transform 0.2s;
}

.chapter-item:hover {
  border-color: var(--el-color-primary);
  transform: translateX(4px);
}

.chapter-arrow {
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .novel-head {
    flex-direction: column;
  }

  .novel-cover {
    width: 120px;
    aspect-ratio: 9 / 16;
  }
}
</style>

<style scoped>
.reading-guide { margin: 0 0 24px; padding: 24px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--content-bg); color: var(--text-color); }
.reading-guide h2 { font-size: 20px; margin-bottom: 8px; }
.reading-genre { font-size: 14px; color: var(--el-color-primary); margin-bottom: 18px; }
.reading-guide dl { font-size: 15px; line-height: 1.8; }
.reading-guide dt { font-weight: 600; margin-top: 12px; }
.reading-guide dd { color: var(--text-secondary); }
.reading-status { margin-top: 14px; font-size: 14px; line-height: 1.7; }
.reading-updated { margin-top: 8px; font-size: 12px; color: var(--text-secondary); }
.reading-actions { display: flex; flex-wrap: wrap; gap: 12px 20px; margin-top: 20px; }
.reading-actions a { color: var(--el-color-primary); text-underline-offset: 4px; font-size: 14px; line-height: 1.8; }
@media (max-width: 480px) { .reading-guide { padding: 20px; } }
</style>
