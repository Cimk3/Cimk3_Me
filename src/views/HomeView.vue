<template>
  <div class="home">
    <div v-if="loading" class="home-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <el-card v-else class="profile-card" :class="{ 'has-bg': showBg }" shadow="never">
      <template v-if="showBg">
        <video
          class="bg-video"
          src="/videos/bg1.mp4"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
        ></video>
        <div class="bg-overlay"></div>
      </template>
      <div class="profile">
        <el-avatar :size="96" :src="profile.avatar" />
        <h1>{{ profile.name }}</h1>
        <p class="slogan">{{ slogan }}</p>
        <div class="desc md-body" v-html="descHtml"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { fetchJson } from '@/utils/content'
import { useI18n } from 'vue-i18n'
import { showBg } from '@/store/ui'

const { locale } = useI18n()
const profile = ref({})
const loading = ref(true)
const error = ref('')

const current = computed(() => profile.value[locale.value] || profile.value.zh || {})

const slogan = computed(() => current.value.slogan || '')
const descHtml = computed(() => marked.parse(current.value.desc || ''))


onMounted(async () => {
  try {
    profile.value = await fetchJson('/data/profile.json')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.profile {
  text-align: center;
  color: var(--text-color);
}

.profile h1 {
  color: var(--text-color);
}

.slogan {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 8px 0 0;
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

/* ===== 背景开启时的样式（点击侧边栏图片图标触发） ===== */
.profile-card.has-bg {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

.profile-card.has-bg :deep(.el-card__body) {
  padding: 0;
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
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}

.profile-card.has-bg .profile {
  position: relative;
  z-index: 2;
  padding: 48px 32px;
  color: #fff;
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
</style>
