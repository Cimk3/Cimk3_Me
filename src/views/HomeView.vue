<template>
  <div class="home">
    <div v-if="loading" class="home-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <el-card v-else class="profile-card">
      <div class="profile">
        <el-avatar :size="96" :src="profile.avatar" />
        <h1>{{ profile.name }}</h1>
        <p class="slogan">{{ profile.slogan }}</p>
        <div class="desc md-body" v-html="descHtml"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { fetchJson } from '@/utils/content'

const profile = ref({})
const loading = ref(true)
const error = ref('')

const descHtml = computed(() => marked.parse(profile.value.desc || ''))

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
}
</style>
