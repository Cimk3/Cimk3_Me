<template>
  <div class="blog">
    <h1 class="content-heading">{{ t('menu.blog') }}</h1>
    <div v-if="loading" class="blog-loading">
      <el-skeleton :rows="3" animated />
    </div>
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <el-empty v-else-if="!posts.length" :description="t('msg.empty')" />
    <template v-else>
      <el-timeline>
        <el-timeline-item
          v-for="post in pagedPosts"
          :key="post.slug"
          :timestamp="formatDate(post.date, locale)"
          placement="top"
        >
          <router-link :to="`/blog/${post.slug}`" class="post-link">
            <el-card shadow="hover">
              <h3>{{ postFor(post).title }}</h3>
              <p class="post-summary">{{ postFor(post).summary }}</p>
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
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'
import { ref, computed } from 'vue'
import { localized, newestFirst, formatDate } from '@/utils/content-data.mjs'
const { t, locale } = useI18n()
const postFor = (post) => localized(post, locale.value)
const { data: posts, loading, error, load } = useMountedContent(() => fetchJson('/data/posts.json'), [])
const pageSize = 5
const currentPage = ref(1)
const pagedPosts = computed(() => newestFirst(posts.value).slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
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