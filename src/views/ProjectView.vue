<template>
  <div class="project">
    <div v-if="loading" class="project-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <template v-else>
      <div v-for="p in projects" :key="p.title" class="project-card">
        <div class="card-top">
          <h3>{{ p.title }}</h3>
          <a class="card-link" :href="p.link" target="_blank" rel="noopener" title="在浏览器中打开">
            <el-icon :size="18"><Monitor /></el-icon>
          </a>
        </div>
        <p class="card-desc">{{ p.description }}</p>
        <div class="card-tags">
          <el-tag v-for="t in p.tags" :key="t" size="small" effect="light">{{ t }}</el-tag>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchJson } from '@/utils/content'

const projects = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    projects.value = await fetchJson('/data/projects.json')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.project {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.project-card {
    background: var(--content-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}

.project-card:hover {
    transform: translateY(-4px);
    border-color: var(--el-color-primary);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.card-top h3 {
    font-size: 18px;
    color: var(--text-color);
}

.card-link {
    color: var(--text-secondary);
    display: inline-flex;
    padding: 6px;
    border-radius: 8px;
    transition: color 0.2s, background-color 0.2s;
}

.card-link:hover {
    color: var(--el-color-primary);
    background-color: var(--bg-color);
}

.card-desc {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
}

.card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>