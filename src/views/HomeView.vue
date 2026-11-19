<template>
  <div class="home catalog-page">
    <div class="home-overview">
      <el-skeleton v-if="loading" :rows="4" animated />
      <LoadError v-else-if="error" :error="error" @retry="load" />
      <el-card v-else class="profile-card" :class="{ 'has-bg': showBg }" shadow="never">
        <template v-if="showBg">
          <video class="bg-video" src="/videos/bg1.mp4" autoplay muted loop playsinline preload="auto"></video>
          <div class="bg-overlay"></div>
        </template>
        <div class="profile">
          <el-avatar :size="96" :src="profile.avatar" />
          <h1>{{ profile.name }}</h1>
          <p class="slogan">{{ slogan }}</p>
          <div class="desc md-body" v-html="descHtml"></div>
        </div>
      </el-card>
      <el-skeleton v-if="discoveryLoading" :rows="4" animated />
      <LoadError v-else-if="discoveryError" :error="discoveryError" @retry="loadDiscovery" />
      <section v-else-if="currentProject" class="home-recommendation" aria-labelledby="home-recommendation-title">
        <img src="/images/operation-iron-rain.webp" :alt="t('project.ironRainCover')"
          width="1280" height="720" class="recommendation-cover" />
        <div class="recommendation-copy">
          <p class="recommendation-label">{{ t('home.current') }}</p>
          <h2 id="home-recommendation-title">{{ currentProject.title }}</h2>
          <p class="catalog-summary">{{ currentProject.description }}</p>
          <router-link to="/project" class="recommendation-link">
            {{ t('home.viewProject') }}<el-icon aria-hidden="true"><ArrowRight /></el-icon>
          </router-link>
        </div>
      </section>
    </div>
    <HomeDiscover v-if="!discoveryLoading && !discoveryError && discovery"
      :featured="discovery.featured" :recent="discovery.recent" />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'
import HomeDiscover from '@/components/HomeDiscover.vue'
import { computed } from 'vue'
import { marked } from 'marked'
import { showBg } from '@/store/ui'
import { localized, newestFirst } from '@/utils/content-data.mjs'
import { resolveFeatured } from '@/utils/home-data.mjs'
const { t, locale } = useI18n()
const { data: profile, loading, error, load } = useMountedContent(() => fetchJson('/data/profile.json'), {})
const { data: discovery, loading: discoveryLoading, error: discoveryError, load: loadDiscovery } = useMountedContent(async () => {
  const [home, projects, posts, works] = await Promise.all(
    ['home', 'projects', 'posts', 'works'].map(name => fetchJson(`/data/${name}.json`))
  )
  return {
    featured: resolveFeatured(home.featured, { projects, posts, works }),
    recent: newestFirst(home.updates).slice(0, 3),
    project: projects.find(project => project.id === 'operation-iron-rain')
  }
})
const currentProject = computed(() => discovery.value?.project ? localized(discovery.value.project, locale.value) : null)
const current = computed(() => localized(profile.value, locale.value))
const slogan = computed(() => current.value.slogan || '')
const descHtml = computed(() => marked.parse(current.value.desc || ''))
</script>

<style scoped>
.home-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
}

.profile-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border-color: var(--border-color);
  background: var(--content-bg);
}

.profile-card :deep(.el-card__body) {
  padding: clamp(20px, 3vw, 36px);
}

.profile {
  position: relative;
  z-index: 2;
  color: var(--text-color);
  text-align: center;
}

.profile h1 {
  color: var(--text-color);
  font-size: 32px;
  line-height: 1.15;
}

.slogan {
  color: var(--catalog-muted);
  font-size: 16px;
  line-height: 1.55;
  margin-top: 6px;
}

.desc {
  margin: 16px auto 0;
  max-width: 520px;
  text-align: left;
  color: var(--text-color);
}

.profile :deep(.md-body) {
  color: var(--text-color);
}

.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.52);
  z-index: 1;
}

.profile-card.has-bg .profile h1 {
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.profile-card.has-bg .slogan {
  color: rgba(255, 255, 255, 0.9);
}

.profile-card.has-bg .desc {
  color: rgba(255, 255, 255, 0.92);
}

.profile-card.has-bg :deep(.md-body) {
  color: rgba(255, 255, 255, 0.92);
}

.profile-card.has-bg :deep(.md-body a) {
  color: #fff;
}

.home-recommendation {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--content-bg);
}

.recommendation-cover {
  display: block;
  width: 100%;
  aspect-ratio: 2.2 / 1;
  height: 100%;
  object-fit: cover;
  background: var(--bg-color);
}

.recommendation-copy { align-self: center; padding: 18px 22px 20px; }
.recommendation-label { color: var(--link-color); font-size: 13px; font-weight: 600; }
.recommendation-copy h2 { margin: 6px 0; color: var(--text-color); font-size: 22px; overflow-wrap: anywhere; }
.recommendation-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  margin-top: 6px;
  color: var(--link-color);
  font-size: 14px;
  font-weight: 600;
  text-underline-offset: 3px;
}

@media (max-width: 640px) {
  .home-overview { gap: 16px; }
  .home-recommendation { grid-template-columns: minmax(0, 1fr); }
  .recommendation-cover { height: auto; }
}
</style>
