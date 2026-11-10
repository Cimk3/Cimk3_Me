<template>
  <div class="connect">
    <h1 class="content-heading">{{ t('menu.connect') }}</h1>
    <el-skeleton v-if="loading" :rows="3" animated />
    <LoadError v-else-if="error" :error="error" @retry="load" />
    <el-empty v-else-if="!contacts.length" :description="t('msg.empty')" />
    <template v-else>
      <div v-for="contact in contacts" :key="contact.value" class="contact-item">
        <el-icon :size="30"><Icon :icon="contact.icon" /></el-icon>
        <span class="contact-label">{{ t(`contact.${contact.key}`) }}</span>
        <span v-if="contact.copyable" class="contact-value">{{ contact.value }}</span>
        <button v-if="contact.copyable" type="button" class="contact-action" :aria-label="t('contact.copy', { label: t(`contact.${contact.key}`) })" :title="t('contact.copy', { label: t(`contact.${contact.key}`) })" @click="handleCopy(contact)">
          <el-icon :size="24"><CopyDocument /></el-icon>
        </button>
        <a v-else :href="contact.value" target="_blank" rel="noopener noreferrer" class="contact-action" :aria-label="`${t('msg.open')}: ${t(`contact.${contact.key}`)}`" :title="t('msg.open')">
          <el-icon :size="24"><Icon icon="mdi:open-in-new" /></el-icon>
        </a>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { fetchJson } from '@/utils/content'
import { copyText } from '@/utils/clipboard.mjs'
import { useMountedContent } from '@/composables/useContent'
import LoadError from '@/components/LoadError.vue'
const { t } = useI18n()
const { data: contacts, loading, error, load } = useMountedContent(() => fetchJson('/data/contacts.json'), [])
async function handleCopy(contact) {
  try { await copyText(contact.value); ElMessage.success(t('msg.copied')) }
  catch { ElMessage.warning(t('msg.copyFailed')) }
}
</script>

<style scoped>
.connect {
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 8px;
  border-bottom: 1px solid var(--border-color);
  /* 用分隔线隔开每一项 */
  color: var(--text-color);
  transition: background-color 0.2s;
}

.contact-item:last-child {
  border-bottom: none;
  /* 最后一项不加分隔线 */
}

.contact-item:hover {
  background-color: var(--content-bg);
}

.contact-label {
  width: 80px;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.contact-value {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  user-select: text;
}

.action-icon {
  margin-left: auto;
  color: var(--text-secondary);
}
</style>
<style scoped>
.contact-action { margin-left: auto; padding: 8px; display: inline-flex; flex-shrink: 0; border: 0; border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.contact-action:hover { color: var(--el-color-primary); background: var(--bg-color); }
@media (max-width: 480px) { .contact-item { gap: 8px; } .contact-label { width: 62px; font-size: 14px; } .contact-value { font-size: 14px; } }
</style>
