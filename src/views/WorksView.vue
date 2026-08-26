<template>
  <div class="works">
    <div v-if="loading" class="works-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <div v-else class="works-grid">
      <router-link v-for="w in works" :key="w.id" :to="`/works/${w.id}`" class="work-card">
        <img class="work-cover" :src="w.cover" :alt="w.title" loading="lazy" />
        <div class="work-info">
          <h3>{{ w.title }}</h3>
          <p class="work-desc">{{ w.description }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchJson } from '@/utils/content'

const works = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    works.value = await fetchJson('/data/works.json')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
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
