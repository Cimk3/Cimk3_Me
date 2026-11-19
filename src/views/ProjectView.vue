<template>
  <div class="catalog-page">
    <header class="catalog-header"><h1>{{ t('menu.project') }}</h1></header>
    <el-skeleton v-if="loading" :rows="4" animated />
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <el-empty v-else-if="!projects.length" :description="t('msg.empty')" />
    <template v-else>
      <div class="project-list">
        <article v-for="project in visibleProjects" :key="project.id" class="project-card" :class="{ 'is-featured': project.id === featuredId }">
          <div v-if="project.id === featuredId" class="project-cover">
            <img v-if="!coverFailed" src="/images/operation-iron-rain.webp" :alt="t('project.ironRainCover')"
              width="1280" height="720" fetchpriority="high" @error="coverFailed = true" />
            <span v-else aria-hidden="true">{{ project.title }}</span>
          </div>
          <div class="project-copy">
            <h2>{{ project.title }}</h2>
            <p class="card-desc catalog-summary">{{ project.description }}</p>
            <ul class="card-tags" :aria-label="t('project.technologies')">
              <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
            </ul>
            <div class="project-links">
              <a v-for="link in project.links" :key="link.href" :href="link.href" target="_blank" rel="noopener noreferrer"
                class="project-link" :class="{ 'is-primary': project.id === featuredId && link.kind === 'demo' }">
                {{ t(`project.${link.kind}`) }}<el-icon aria-hidden="true"><TopRight /></el-icon>
              </a>
            </div>
            <details v-if="project.highlights?.length || project.approach || project.caseStudy" class="project-case">
              <summary>{{ t('project.details') }}</summary>
              <div class="project-details">
                <h3 v-if="project.highlights?.length">{{ t('project.highlights') }}</h3>
                <ul v-if="project.highlights?.length">
                  <li v-for="highlight in project.highlights" :key="highlight">{{ highlight }}</li>
                </ul>
                <p v-if="project.approach">{{ t('project.approach') }} · {{ project.approach }}</p>
                <dl v-if="project.caseStudy">
                  <template v-for="field in ['scenario', 'experience', 'tradeoff']" :key="field">
                    <dt>{{ t(`project.${field}`) }}</dt>
                    <dd>{{ project.caseStudy[field] }}</dd>
                  </template>
                </dl>
              </div>
            </details>
          </div>
        </article>
      </div>
      <div v-if="otherProjects.length > pageSize" class="project-pagination">
        <el-pagination background layout="prev, pager, next" :total="otherProjects.length" :page-size="pageSize" v-model:current-page="currentPage" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { localized } from '@/utils/content-data.mjs'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'
const { t, locale } = useI18n()
const { data: projects, loading, error, load } = useMountedContent(() => fetchJson('/data/projects.json'), [])
const featuredId = 'operation-iron-rain'
const featuredProject = computed(() => projects.value.find(project => project.id === featuredId))
const otherProjects = computed(() => projects.value.filter(project => project.id !== featuredId))
const coverFailed = ref(false)
const pageSize = 6
const currentPage = ref(1)
const visibleProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const page = otherProjects.value.slice(start, start + pageSize)
  if (featuredProject.value) page.unshift(featuredProject.value)
  return page.map(project => localized(project, locale.value))
})
</script>

<style scoped>
.project-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: start;
}

.project-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.project-card {
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  min-width: 0;
  overflow: hidden;
}

.project-card.is-featured {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
}

.project-cover {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 260px;
  background: linear-gradient(140deg, #102944, #174f81);
  color: #fff;
  text-align: center;
}

.project-cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-cover span { padding: 24px; font-size: 28px; font-weight: 700; }
.project-copy { min-width: 0; padding: 24px; }
.is-featured .project-copy { align-self: center; padding: 28px; }

.project-copy h2 {
  color: var(--text-color);
  font-size: 21px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.is-featured h2 { font-size: clamp(26px, 3vw, 38px); }

.card-desc {
  margin-top: 12px;
}

.card-tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.card-tags li {
  padding: 4px 9px;
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--catalog-muted);
  font-size: 13px;
}

.project-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.project-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 14px;
  color: var(--text-color);
  text-decoration: none;
  font-size: 14px;
}
.project-link .el-icon { flex-shrink: 0; }
.project-link:hover { color: var(--link-color); border-color: var(--link-color); }
.project-link.is-primary { background: #1269bd; border-color: #1269bd; color: #fff; font-weight: 600; }
.project-link.is-primary:hover { background: #0d5297; border-color: #0d5297; }
.project-link:focus-visible, .project-case summary:focus-visible { outline: 2px solid var(--link-color); outline-offset: 4px; }

.project-case { margin-top: 16px; border-top: 1px solid var(--border-color); color: var(--text-color); }
.project-case summary { cursor: pointer; padding-top: 12px; font-size: 14px; }
.project-details { margin-top: 12px; color: var(--catalog-muted); font-size: 14px; line-height: 1.7; }
.project-details h3, .project-details dt { color: var(--text-color); font-size: inherit; font-weight: 600; }
.project-details ul { padding-inline-start: 1.3em; }
.project-details p, .project-details dt { margin-top: 10px; }

@media (max-width: 900px) {
  .project-list, .project-card.is-featured { grid-template-columns: minmax(0, 1fr); }
  .project-cover { aspect-ratio: 16 / 9; min-height: 0; }
  .project-copy, .is-featured .project-copy { padding: 20px; }
}
</style>
