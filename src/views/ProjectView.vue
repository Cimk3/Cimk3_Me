<template>
  <div class="project">
    <h1 class="content-heading">{{ t('menu.project') }}</h1>
    <el-skeleton v-if="loading" :rows="4" animated />
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <el-empty v-else-if="!projects.length" :description="t('msg.empty')" />
    <template v-else>
      <div class="project-list">
        <article v-for="project in pagedProjects" :key="project.id" class="project-card">
          <div class="card-top"><h2>{{ projectFor(project).title }}</h2></div>
          <p class="card-desc">{{ projectFor(project).description }}</p>
          <div v-if="projectFor(project).highlights?.length" class="project-highlights">
            <h3>{{ t('project.highlights') }}</h3>
            <ul><li v-for="highlight in projectFor(project).highlights" :key="highlight">{{ highlight }}</li></ul>
          </div>
          <p v-if="projectFor(project).approach" class="project-approach"><strong>{{ t('project.approach') }}:</strong> {{ projectFor(project).approach }}</p>
          <div class="card-tags"><el-tag v-for="tag in projectFor(project).tags" :key="tag" size="small" effect="light">{{ tag }}</el-tag></div>
          <details v-if="projectFor(project).caseStudy" class="project-case">
            <summary>{{ t('project.caseStudy') }}</summary>
            <dl>
              <template v-for="field in ['scenario', 'experience', 'tradeoff']" :key="field">
                <dt>{{ t(`project.${field}`) }}</dt>
                <dd>{{ projectFor(project).caseStudy[field] }}</dd>
              </template>
            </dl>
          </details>
          <div class="project-links">
            <a v-for="link in project.links" :key="link.href" :href="link.href" target="_blank" rel="noopener noreferrer" class="project-link">
              {{ t(`project.${link.kind}`) }}<el-icon :size="16"><Icon icon="ant-design:link-outlined" /></el-icon>
            </a>
          </div>
        </article>
      </div>
      <div v-if="projects.length > pageSize" class="project-pagination">
        <el-pagination background layout="prev, pager, next" :total="projects.length" :page-size="pageSize" v-model:current-page="currentPage" />
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
const projectFor = project => localized(project, locale.value)
const { data: projects, loading, error, load } = useMountedContent(() => fetchJson('/data/projects.json'), [])
const pageSize = 6
const currentPage = ref(1)
const pagedProjects = computed(() => projects.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
</script>

<style scoped>
.project {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-pagination {
  margin-top: auto;
  padding-top: 24px;
  display: flex;
  justify-content: center;
}

.project-card {
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 32px 36px;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}

.project-card:hover {
  transform: translateY(-4px);
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-top h2 {
  font-size: 22px;
  color: var(--text-color);
}

.card-link {
  color: var(--text-secondary);
  display: inline-flex;
  padding: 8px;
  border-radius: 8px;
  transition: color 0.2s, background-color 0.2s;
}

.card-link:hover {
  color: var(--el-color-primary);
  background-color: var(--bg-color);
}

.card-desc {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 20px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
<style scoped>
.project-highlights { margin-bottom: 16px; color: var(--text-color); font-size: 15px; line-height: 1.8; }
.project-highlights h3 { font-size: 14px; margin-bottom: 4px; }
.project-highlights ul { padding-left: 1.3em; }
.project-approach { margin-bottom: 16px; line-height: 1.7; font-size: 14px; color: var(--text-secondary); }
.project-links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
.project-link { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; color: var(--text-color); text-decoration: none; font-size: 14px; }
.project-link:hover { color: var(--el-color-primary); border-color: var(--el-color-primary); }
.project-case { margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px; color: var(--text-color); }
.project-case summary { cursor: pointer; font-size: 15px; font-weight: 600; }
.project-case summary:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 4px; }
.project-case dl { margin-top: 16px; font-size: 14px; line-height: 1.8; }
.project-case dt { font-weight: 600; margin-top: 12px; }
.project-case dd { color: var(--text-secondary); margin-top: 4px; }
@media (max-width: 640px) { .project-card { padding: 22px 20px; } }
</style>
