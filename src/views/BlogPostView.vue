<template>
  <div class="blog-post">
    <div v-if="loading" class="blog-post-loading">
      <el-skeleton :rows="6" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <template v-else>
      <h1 class="post-title">{{ post.title }}</h1>
      <p class="post-date">{{ post.date }}</p>
      <!-- v-html 渲染 marked 解析后的 HTML -->
      <article class="md-body" v-html="html"></article>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import { fetchJson, fetchText } from '@/utils/content'

const route = useRoute()
const post = ref(null)
const html = ref('')
const loading = ref(true)
const error = ref('')

async function load() {
  try {
    // 1. 先读目录清单，根据 slug 找到对应文章
    const posts = await fetchJson('data/posts.json')
    const found = posts.find((p) => p.slug === route.params.slug)
    if (!found) throw new Error('文章不存在')
    post.value = found
    // 2. 再抓取 Markdown 正文并解析
    const md = await fetchText(found.md)
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
.blog-post {
  max-width: 800px;
}

.post-title {
  font-size: 28px;
  color: var(--text-color);
}

.post-date {
  margin: 8px 0 24px;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>