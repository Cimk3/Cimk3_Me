<template>
  <div class="home-discover">
    <el-skeleton v-if="loading" :rows="6" animated />
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <template v-else>
      <section class="discover-section" aria-labelledby="featured-heading">
        <h2 id="featured-heading">{{ t('home.featured') }}</h2>
        <p class="section-intro">{{ t('home.featuredIntro') }}</p>
        <div class="featured-list">
          <router-link v-for="entry in featured" :key="entry.kind" :to="entry.to" class="featured-item">
            <span class="featured-kind">{{ t(`home.${entry.kind}`) }}</span>
            <div><h3>{{ localized(entry.record, locale).title }}</h3><p>{{ localized(entry, locale).reason }}</p></div>
            <el-icon :size="18" aria-hidden="true"><ArrowRight /></el-icon>
          </router-link>
        </div>
      </section>
      <section class="discover-section" aria-labelledby="recent-heading">
        <h2 id="recent-heading">{{ t('home.recent') }}</h2>
        <p class="section-intro">{{ t('home.recentIntro') }}</p>
        <ol class="recent-list">
          <li v-for="entry in recent" :key="entry.id">
            <time :datetime="entry.date">{{ formatDate(entry.date, locale) }}</time>
            <router-link :to="entry.to"><h3>{{ localized(entry, locale).title }}</h3></router-link>
            <p>{{ localized(entry, locale).description }}</p>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { localized, newestFirst, formatDate } from '@/utils/content-data.mjs'
import { resolveFeatured } from '@/utils/home-data.mjs'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'
const { t, locale } = useI18n()
const { data, loading, error, load } = useMountedContent(async () => {
  const [home, projects, posts, works] = await Promise.all(['home', 'projects', 'posts', 'works'].map(name => fetchJson(`/data/${name}.json`)))
  return { featured: resolveFeatured(home.featured, { projects, posts, works }), updates: home.updates }
})
const featured = computed(() => data.value?.featured || [])
const recent = computed(() => newestFirst(data.value?.updates || []).slice(0, 3))
</script>

<style scoped>
.home-discover { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 24px; margin-top: 28px; }
.discover-section { min-width: 0; padding: 24px; border: 1px solid var(--border-color); border-radius: 14px; background: var(--content-bg); color: var(--text-color); }
h2 { font-size: 21px; margin-bottom: 8px; }
h3 { font-size: 16px; line-height: 1.6; overflow-wrap: anywhere; }
p { line-height: 1.8; font-size: 14px; color: var(--text-secondary); }
.section-intro { margin-bottom: 20px; }
.featured-item { display: grid; grid-template-columns: 48px minmax(0, 1fr) 18px; gap: 12px; align-items: start; padding: 16px 0; color: inherit; text-decoration: none; }
.featured-item + .featured-item { border-top: 1px solid var(--border-color); }
.featured-kind { font-size: 12px; padding-top: 3px; color: var(--el-color-primary); }
.featured-item .el-icon { margin-top: 5px; }
.featured-item:hover h3, .recent-list a:hover { color: var(--el-color-primary); }
.recent-list { list-style: none; }
.recent-list li { margin-top: 20px; padding-left: 16px; border-left: 2px solid var(--border-color); }
.recent-list time { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 5px; }
.recent-list a { color: inherit; text-decoration: none; }
@media (max-width: 1000px) { .home-discover { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 480px) { .discover-section { padding: 20px 16px; } .featured-item { grid-template-columns: minmax(0, 1fr) 18px; gap: 5px 10px; } .featured-kind { grid-column: 1 / -1; } }
</style>
