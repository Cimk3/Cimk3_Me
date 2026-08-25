<template>
  <div class="project">
    <div v-if="loading" class="project-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <template v-else>
      <div class="project-list">
        <div v-for="p in pagedProjects" :key="p.title" class="project-card">
          <div class="card-top">
            <h3>{{ p.title }}</h3>
            <a class="card-link" :href="p.link" target="_blank" rel="noopener" title="在浏览器中打开">
              <el-icon :size="20"><EmojiWebIcon height="1em" /></el-icon>
            </a>
          </div>
          <p class="card-desc">{{ p.description }}</p>
          <div class="card-tags">
            <el-tag v-for="t in p.tags" :key="t" size="small" effect="light">{{ t }}</el-tag>
          </div>
        </div>
      </div>

      <div class="project-pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="projects.length"
          :page-size="pageSize"
          v-model:current-page="currentPage"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchJson } from '@/utils/content'
import EmojiWebIcon from '@iconify-vue/arcticons/emoji-web'
const projects = ref([])
const loading = ref(true)
const error = ref('')

const pageSize = 6
const currentPage = ref(1)
const pagedProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return projects.value.slice(start, start + pageSize)
})

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
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.project-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.project-pagination {
    margin-top: auto;
    padding-top: 24px;
    display: flex;
    justify-content: center;
}

.project-card {
    background: var(--content-bg);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 32px 36px;
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
    margin-bottom: 12px;
}

.card-top h3 {
    font-size: 22px;
    color: var(--text-color);
}

.card-link {
    color: var(--text-secondary);
    display: inline-flex;
    padding: 8px;
    border-radius: 8px;
    transition: color 0.2s, background-color 0.2s;
}

.card-link:hover {
    color: var(--el-color-primary);
    background-color: var(--bg-color);
}

.card-desc {
    color: var(--text-secondary);
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 20px;
}

.card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>