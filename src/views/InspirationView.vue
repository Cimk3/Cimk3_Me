<template>
  <div class="inspiration">
    <div v-if="loading" class="inspiration-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <template v-else>
      <div class="inspiration-grid">
        <div
          v-for="item in inspirations"
          :key="item.id"
          class="inspiration-card"
          @click="openDialog(item)"
        >
          <img class="card-image" :src="item.image" :alt="item.title" loading="lazy" />
          <div class="card-footer">
            <span class="card-title">{{ item.title }}</span>
          </div>
        </div>
      </div>
    </template>

    <el-dialog
      v-model="dialogVisible"
      class="inspiration-dialog"
      :show-close="false"
      width="min(960px, 94vw)"
      align-center
      @closed="selected = null"
    >
      <div v-if="selected" class="dialog-body">
        <div class="dialog-close" @click="dialogVisible = false" title="关闭">
          <el-icon :size="22"><Close /></el-icon>
        </div>
        <div class="dialog-image">
          <img :src="selected.image" :alt="selected.title" />
        </div>
        <div class="dialog-text">
          <h2 class="dialog-title">{{ selected.title }}</h2>
          <p class="dialog-time">{{ selected.time }}</p>
          <div v-if="contentLoading" class="dialog-content">
            <el-skeleton :rows="4" animated />
          </div>
          <el-alert v-else-if="contentError" :title="contentError" type="error" show-icon :closable="false" />
          <div v-else class="dialog-content md-body" v-html="contentHtml"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import { fetchJson, fetchText } from '@/utils/content'

const inspirations = ref([])
const loading = ref(true)
const error = ref('')
const dialogVisible = ref(false)
const selected = ref(null)
const contentHtml = ref('')
const contentLoading = ref(false)
const contentError = ref('')

onMounted(async () => {
  try {
    inspirations.value = await fetchJson('/data/inspirations.json')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const openDialog = async (item) => {
  selected.value = item
  dialogVisible.value = true
  contentHtml.value = ''
  contentError.value = ''
  contentLoading.value = true
  try {
    const md = await fetchText(item.md)
    contentHtml.value = marked.parse(md)
  } catch (e) {
    contentError.value = e.message
  } finally {
    contentLoading.value = false
  }
}
</script>

<style scoped>
.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.inspiration-card {
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}

.inspiration-card:hover {
  transform: translateY(-4px);
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-image {
  display: block;
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-footer {
  padding: 12px 16px;
}

.card-title {
  color: var(--text-color);
  font-size: 15px;
  font-weight: 600;
}

/* ===== 模态框 ===== */
.dialog-body {
  position: relative;
  height: 520px; /* 固定高度，不随图片大小调整 */
}

.dialog-close {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dialog-close:hover {
  background: rgba(0, 0, 0, 0.6);
}

.dialog-image {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 60%;
}

.dialog-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dialog-text {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 60%;
  padding: 28px 24px;
  overflow-y: auto;
}

.dialog-title {
  margin: 0 0 8px;
  font-size: 22px;
  color: var(--text-color);
}

.dialog-time {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.dialog-content {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-color);
}

@media (max-width: 640px) {
  .dialog-body {
    height: auto;
  }

  .dialog-image {
    position: static;
    width: 100%;
  }

  .dialog-image img {
    aspect-ratio: 4 / 3;
  }

  .dialog-text {
    position: static;
  }
}
</style>

<!-- 非 scoped：作用于 Element Plus 内部对话框元素 -->
<style>
.inspiration-dialog.el-dialog {
  border-radius: 24px;
  overflow: hidden;
  padding: 0;
}

/* 隐藏空 header，避免顶部留白 */
.inspiration-dialog.el-dialog .el-dialog__header {
  display: none;
}

.inspiration-dialog.el-dialog .el-dialog__body {
  padding: 0;
  height: 520px;
}
</style>
