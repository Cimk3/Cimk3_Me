<template>
  <div class="sparks catalog-page">
    <header class="catalog-header"><h1>{{ t('menu.sparks') }}</h1></header>
    <el-skeleton v-if="loading" :rows="5" animated />
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <el-empty v-else-if="!data.sparks.length" :description="t('sparks.empty')" />
    <div v-else class="sparks-list">
      <SparkCard v-for="spark in sortedSparks" :key="spark.id" :spark="spark" :profile="data.profile" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ContentError, fetchJson } from '@/utils/content'
import { newestFirst } from '@/utils/content-data.mjs'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'
import SparkCard from '@/components/SparkCard.vue'

const { t } = useI18n()
const { data, loading, error, load } = useMountedContent(async () => {
  const [sparks, profile] = await Promise.all([fetchJson('/data/sparks.json'), fetchJson('/data/profile.json')])
  if (!Array.isArray(sparks) || !sparks.every(item => item && typeof item.id === 'string' && typeof item.md === 'string' && typeof item.date === 'string')) throw new ContentError('json')
  return { sparks, profile }
})
const sortedSparks = computed(() => newestFirst(data.value?.sparks || []))
</script>

<style scoped>
.sparks { max-width: 800px; }
.sparks-list { display: flex; flex-direction: column; gap: 24px; }
</style>
