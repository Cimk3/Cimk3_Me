<template>
  <ul class="resource-list">
    <li v-for="entry in entries" :key="`${entry.collection.id}/${entry.item.id}`" class="resource-row">
      <div class="resource-icon" aria-hidden="true"><el-icon :size="22"><component :is="entry.item.type === 'sample' ? 'Files' : entry.item.type === 'tool' ? 'Tools' : 'Document'" /></el-icon></div>
      <div class="resource-description">
        <h2><a :href="entry.item.url" target="_blank" rel="noopener noreferrer">{{ localized(entry.item, locale).title }}</a></h2>
        <p>{{ localized(entry.item, locale).description }}</p>
        <div class="resource-meta">
          <span>{{ t(`resources.types.${entry.item.type}`) }}</span>
          <span>{{ entry.item.languages.map(language => t(`resources.languages.${language}`)).join(' / ') }}</span>
          <span v-if="entry.item.edition">{{ t(`resources.editions.${entry.item.edition}`) }}</span>
        </div>
        <router-link v-if="showCollection" class="collection-origin" :to="{ name: 'resource-collection', params: { collectionId: entry.collection.id }, query: route.query }">
          {{ t('resources.belongsTo') }}: {{ localized(entry.collection, locale).title }}
        </router-link>
      </div>
      <a class="resource-open" :href="entry.item.url" target="_blank" rel="noopener noreferrer" :aria-label="`${t('resources.open')}: ${localized(entry.item, locale).title}`">
        {{ t('resources.open') }}<el-icon aria-hidden="true"><TopRight /></el-icon>
      </a>
    </li>
  </ul>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { localized } from '@/utils/content-data.mjs'
defineProps({ entries: { type: Array, required: true }, showCollection: Boolean })
const { t, locale } = useI18n()
const route = useRoute()
</script>

<style scoped>
.resource-list { list-style: none; }
.resource-row { display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; gap: 20px; padding: 28px 0; border-bottom: 1px solid var(--border-color); }
.resource-icon { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 10px; color: var(--link-color); background: var(--el-color-primary-light-9); }
.resource-description { min-width: 0; }
h2 { font-size: 19px; line-height: 1.6; margin-bottom: 6px; overflow-wrap: anywhere; }
h2 a { color: var(--text-color); text-decoration: none; }
h2 a:hover { color: var(--link-color); }
p { color: var(--resource-secondary, var(--text-secondary)); line-height: 1.8; font-size: 15px; overflow-wrap: anywhere; }
.resource-meta { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; color: var(--resource-secondary, var(--text-secondary)); font-size: 13px; line-height: 1.7; }
.collection-origin { display: inline-block; margin-top: 12px; color: var(--link-color); font-size: 13px; line-height: 1.7; text-underline-offset: 3px; }
.resource-open { display: inline-flex; align-items: center; align-self: center; gap: 6px; padding: 8px 0 8px 12px; color: var(--link-color); text-decoration: none; white-space: nowrap; font-size: 14px; }
.resource-open:hover { text-decoration: underline; text-underline-offset: 4px; }
@media (max-width: 600px) {
  .resource-row { grid-template-columns: 36px minmax(0, 1fr); gap: 12px; padding: 24px 0; }
  .resource-icon { width: 36px; height: 36px; }
  .resource-open { grid-column: 2; justify-self: start; padding: 2px 0; }
  h2 { font-size: 17px; }
}
</style>
