<template>
  <div class="inspiration">
    <h1 class="content-heading">{{ t('menu.inspiration') }}</h1>
    <div v-if="loading" class="inspiration-loading">
      <el-skeleton :rows="4" animated />
    </div>
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <el-empty v-else-if="!inspirations.length" :description="t('msg.empty')" />
    <template v-else>
      <div class="inspiration-grid">
        <button
          type="button"
          v-for="item in sortedInspirations"
          :key="item.id"
          class="inspiration-card"
          :aria-label="itemFor(item).title"
          @click="openDialog(item)"
        >
          <img class="card-image" :src="item.image" :alt="itemFor(item).title" loading="lazy" />
          <div class="card-footer">
            <span class="card-title">{{ itemFor(item).title }}</span>
          </div>
        </button>
      </div>
    </template>

    <el-dialog
      v-model="dialogVisible"
      class="inspiration-dialog"
      :title="selected ? itemFor(selected).title : t('menu.inspiration')"
      :show-close="false"
      width="min(960px, 94vw)"
      align-center
      @close="invalidateContent"
    >
      <div v-if="selected" class="dialog-body">
        <button type="button" class="dialog-close" @click="dialogVisible = false" :title="t('msg.close')" :aria-label="t('msg.close')">
          <el-icon :size="22"><Close /></el-icon>
        </button>
        <div class="dialog-image">
          <img :src="selected.image" :alt="itemFor(selected).title" />
        </div>
        <div class="dialog-text">
          <h2 class="dialog-title">{{ itemFor(selected).title }}</h2>
          <p class="dialog-time">{{ formatDate(selected.time, locale) }}</p>
          <div v-if="contentLoading" class="dialog-content">
            <el-skeleton :rows="4" animated />
          </div>
          <LoadError v-else-if="contentError" :error="contentError" @retry="loadContent(selected)" />
          <template v-else>
            <BodyNotice />
            <div class="dialog-content md-body" lang="zh-CN" v-html="contentHtml"></div>
          </template>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { fetchText } from '@/utils/content'
import { useContent } from '@/composables/useContent'
import { localized, newestFirst, formatDate } from '@/utils/content-data.mjs'
import BodyNotice from '@/components/BodyNotice.vue'
const { t, locale } = useI18n()
const itemFor = item => localized(item, locale.value)
const { data: inspirations, loading, error, load } = useMountedContent(() => fetchJson('/data/inspirations.json'), [])
const sortedInspirations = computed(() => newestFirst(inspirations.value, 'time'))
const dialogVisible = ref(false)
const selected = ref(null)
const { data: contentHtml, loading: contentLoading, error: contentError, load: loadContent, invalidate: invalidateContent } = useContent(async item => marked.parse(await fetchText(item.md)), '')
function openDialog(item) {
  selected.value = item
  dialogVisible.value = true
  loadContent(item)
}
</script>

<style scoped>
.inspiration-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 20px; }
.inspiration-card { display: flex; flex-direction: column; align-items: stretch; min-width: 0; width: 100%; font: inherit; text-align: left; background: var(--content-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; cursor: pointer; transition: box-shadow .2s, border-color .2s; }
.inspiration-card:hover { border-color: var(--el-color-primary); box-shadow: 0 6px 18px rgba(0,0,0,.1); }
.card-image { display: block; width: 100%; height: clamp(160px, 20vw, 230px); object-fit: cover; background: var(--bg-color); border-bottom: 1px solid var(--border-color); }
.card-footer { padding: 14px 16px; }
.card-title { display: block; line-height: 1.7; overflow-wrap: anywhere; color: var(--text-color); font-size: 15px; font-weight: 600; }
.dialog-body { position: relative; display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); height: min(600px, calc(100dvh - 64px)); min-height: 0; }
.dialog-close { border: 1px solid rgba(255,255,255,.4); position: absolute; top: 12px; left: 12px; z-index: 10; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(0,0,0,.65); color: #fff; cursor: pointer; }
.dialog-close:hover { background: rgba(0,0,0,.85); }
.dialog-image { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; background: var(--bg-color); }
.dialog-image img { display: block; width: 100%; height: 100%; object-fit: cover; }
.dialog-text { min-width: 0; min-height: 0; padding: 28px 24px; overflow-y: auto; overscroll-behavior: contain; }
.dialog-title { margin: 0 0 8px; font-size: 22px; line-height: 1.5; overflow-wrap: anywhere; color: var(--text-color); }
.dialog-time { margin: 0 0 16px; font-size: 13px; color: var(--text-secondary); }
.dialog-content { font-size: 15px; line-height: 1.8; color: var(--text-color); }
@media (max-width: 640px) {
  .dialog-body { display: block; height: auto; }
  .dialog-image { height: auto; padding: 12px; }
  .dialog-image img { height: auto; max-height: 40dvh; width: 100%; object-fit: contain; }
  .dialog-text { overflow: visible; padding: 22px 20px; }
}
</style>

<style>
.inspiration-dialog.el-dialog { border-radius: 20px; overflow: hidden; padding: 0; max-width: calc(100vw - 24px); }
.inspiration-dialog.el-dialog .el-dialog__header { display: none; }
.inspiration-dialog.el-dialog .el-dialog__body { padding: 0; }
@media (max-width: 640px) { .inspiration-dialog.el-dialog { max-height: calc(100dvh - 32px); overflow-y: auto; overscroll-behavior: contain; } }
</style>
