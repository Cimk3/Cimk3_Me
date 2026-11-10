<template>
  <div class="works">
    <h1 class="content-heading">{{ t('menu.works') }}</h1>
    <div v-if="loading" class="works-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <el-empty v-else-if="!works.length" :description="t('msg.empty')" />
    <div v-else class="works-grid">
      <router-link v-for="w in works" :key="w.id" :to="`/works/${w.id}`" class="work-card">
        <img class="work-cover" :src="w.cover" :alt="workFor(w).title" loading="lazy" />
        <div class="work-info">
          <h3>{{ workFor(w).title }}</h3>
          <p class="work-desc">{{ workFor(w).description }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'
import { localized } from '@/utils/content-data.mjs'
const { t, locale } = useI18n()
const workFor = (work) => localized(work, locale.value)
const { data: works, loading, error, load } = useMountedContent(() => fetchJson('/data/works.json'), [])
</script>

<style scoped>
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(290px, 100%), 1fr));
  gap: 20px;
}

.work-card {
  display: block;
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}

.work-card:hover {
  transform: translateY(-4px);
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.work-cover {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.work-info {
  padding: 16px 20px;
}

.work-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--text-color);
}

.work-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}
</style>
