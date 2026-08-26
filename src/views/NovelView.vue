<template>
  <div class="novel">
    <div v-if="loading" class="novel-loading">
      <el-skeleton :rows="5" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
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
          :alt="novel.title"
        />
        <div class="novel-meta">
          <h1>{{ novel.title }}</h1>
          <p class="novel-desc">{{ novel.description }}</p>
        </div>
      </div>

      <div class="chapter-list">
        <router-link
          v-for="ch in novel.chapters"
          :key="ch.id"
          :to="`/works/${novel.id}/${ch.id}`"
          class="chapter-item"
        >
          <span class="chapter-title">{{ ch.title }}</span>
          <el-icon :size="16" class="chapter-arrow"><Icon icon="mdi:chevron-right" /></el-icon>
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'

const { t } = useI18n()
const route = useRoute()
const novel = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    novel.value = await fetchJson(`/works/${route.params.novelId}.json`)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
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
