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
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { fetchText } from '@/utils/content'

const { t } = useI18n()
const route = useRoute()
const html = ref('')
const loading = ref(true)
const error = ref('')

async function load() {
  try {
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

@media (max-width: 640px) {
  .chapter-content {
    padding: 20px;
  }
}
</style>
