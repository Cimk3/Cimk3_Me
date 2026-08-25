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
        <p class="desc">{{ profile.desc }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchJson } from '@/utils/content'

const profile = ref({})
const loading = ref(true)
const error = ref('')

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
