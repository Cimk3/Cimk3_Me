<template>
  <article class="spark-card">
    <header class="spark-author">
      <img :src="profile.avatar" :alt="profile.name" width="56" height="56" />
      <div class="spark-byline">
        <span class="spark-name">{{ profile.name }}</span>
        <time :datetime="spark.date">{{ formatDate(spark.date, locale) }}</time>
      </div>
    </header>
    <h2 v-if="spark.title" class="spark-title">{{ spark.title }}</h2>
    <el-skeleton v-if="loading" :rows="4" animated />
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <div v-else class="spark-body md-body" v-html="html"></div>
  </article>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { fetchText } from '@/utils/content'
import { formatDate } from '@/utils/content-data.mjs'
import { renderSpark } from '@/utils/sparks-markdown.mjs'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'

const props = defineProps({ spark: { type: Object, required: true }, profile: { type: Object, required: true } })
const { locale } = useI18n()
const { data: html, loading, error, load } = useMountedContent(async () => renderSpark(await fetchText(props.spark.md)), '')
</script>

<style scoped>
.spark-card { min-width: 0; padding: 28px 32px; border: 1px solid var(--border-color); border-radius: 20px; background: var(--content-bg); color: var(--text-color); }
.spark-author { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
.spark-author img { flex-shrink: 0; border-radius: 50%; object-fit: cover; }
.spark-byline { min-width: 0; display: flex; flex-direction: column; gap: 4px; overflow-wrap: anywhere; }
.spark-name { font-size: 18px; font-weight: 600; }
.spark-byline time { font-size: 13px; color: var(--catalog-muted); }
.spark-title { margin: 0 0 22px; font-size: 20px; line-height: 1.6; overflow-wrap: anywhere; }
.spark-body { font-size: 16px; line-height: 1.85; overflow-wrap: anywhere; }
.spark-body :deep(p) { margin: 0 0 1.4em; }
.spark-body :deep(> :last-child) { margin-bottom: 0; }
.spark-body :deep(pre) { max-width: 100%; overflow-x: auto; }
.spark-body :deep(table) { display: block; max-width: 100%; overflow-x: auto; }
@media (max-width: 640px) {
  .spark-card { padding: 22px 20px; border-radius: 16px; }
  .spark-author { margin-bottom: 24px; }
}
</style>
