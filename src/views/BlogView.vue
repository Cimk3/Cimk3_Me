<template>
  <div class="blog">
    <div v-if="loading" class="blog-loading">
      <el-skeleton :rows="3" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <el-timeline v-else>
      <el-timeline-item
        v-for="post in posts"
        :key="post.slug"
        :timestamp="post.date"
        placement="top"
      >
        <router-link :to="`/blog/${post.slug}`" class="post-link">
          <el-card shadow="hover">
            <h3>{{ post.title }}</h3>
            <p class="post-summary">{{ post.summary }}</p>
          </el-card>
        </router-link>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>
    
<script setup>
import { ref, onMounted } from 'vue'
import { fetchJson } from '@/utils/content'

const posts = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    posts.value = await fetchJson('/data/posts.json')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.post-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.post-summary {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>