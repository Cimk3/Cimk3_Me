<template>
  <div class="chapter">
    <div v-if="loading" class="chapter-loading">
      <el-skeleton :rows="6" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <template v-else>
      <router-link :to="`/works/${route.params.novelId}`" class="back-btn">
        <el-icon :size="16"><Icon icon="mdi:arrow-left" /></el-icon>
        <span>{{ t('msg.back') }}</span>
      </router-link>
      <article class="md-body chapter-content" v-html="html"></article>

      <div class="chapter-nav">
        <router-link
          v-if="prevChapter"
          :to="`/works/${route.params.novelId}/${prevChapter.id}`"
          class="nav-btn"
        >
          <el-icon :size="18"><Icon icon="mdi:chevron-left" /></el-icon>
          <span class="nav-text">{{ prevChapter.title }}</span>
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
          <span class="nav-text">{{ nextChapter.title }}</span>
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { fetchJson, fetchText } from '@/utils/content'

const { t } = useI18n()
const route = useRoute()
const html = ref('')
const chapters = ref([])
const loading = ref(true)
const error = ref('')

const currentIndex = computed(() =>
  chapters.value.findIndex((c) => c.id === route.params.chapterId)
)

const prevChapter = computed(() =>
  currentIndex.value > 0 ? chapters.value[currentIndex.value - 1] : null
)

const nextChapter = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < chapters.value.length - 1
    ? chapters.value[currentIndex.value + 1]
    : null
)

async function load() {
  try {
    const novel = await fetchJson(`/works/${route.params.novelId}.json`)
    chapters.value = novel.chapters || []
    const md = await fetchText(`chapters/${route.params.novelId}/${route.params.chapterId}.md`)
    html.value = marked.parse(md)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

load()
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
