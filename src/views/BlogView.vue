<template>
  <div class="blog">
    <div v-if="loading" class="blog-loading">
      <el-skeleton :rows="3" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <template v-else>
      <el-timeline>
        <el-timeline-item
          v-for="post in pagedPosts"
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

      <div class="blog-pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="posts.length"
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

const posts = ref([])
const loading = ref(true)
const error = ref('')

const pageSize = 5
const currentPage = ref(1)
const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return posts.value.slice(start, start + pageSize)
})

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
.blog {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

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

.blog-pagination {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: center;
}
</style>