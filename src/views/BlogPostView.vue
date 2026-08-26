<template>
  <div class="blog-post">
    <router-link to="/blog" class="back-btn">
      <el-icon :size="16"><Icon icon="mdi:arrow-left" /></el-icon>
      <span>{{ t('msg.back') }}</span>
    </router-link>

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
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { fetchJson, fetchText } from '@/utils/content'

const { t } = useI18n()
const route = useRoute()
const post = ref(null)
const html = ref('')
const loading = ref(true)
const error = ref('')

async function load() {
  try {
    // 1. 先读目录清单，根据 slug 找到对应文章
    const posts = await fetchJson('/data/posts.json')
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