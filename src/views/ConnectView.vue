<template>
  <div class="connect">
    <div v-if="loading" class="connect-loading">
      <el-skeleton :rows="3" animated />
    </div>
    <el-alert v-else-if="error" :title="error" type="error" show-icon :closable="false" />
    <template v-else>
      <div v-for="c in contacts" :key="c.label" class="contact-item" @click="handleContact(c)">
        <el-icon :size="20">
          <Icon :icon="c.icon" />
        </el-icon>
        <span class="contact-label">{{ c.label }}</span>
        <span v-if="!isLink(c)" class="contact-value">{{ c.value }}</span>
        <el-icon v-if="c.copyable" :size="14" class="action-icon">
          <CopyDocument />
        </el-icon>
        <el-icon v-else-if="isLink(c)" :size="16" class="action-icon">
          <Icon icon="mdi:open-in-new" />
        </el-icon>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchJson } from '@/utils/content'

const contacts = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    contacts.value = await fetchJson('/data/contacts.json')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const handleContact = (item) => {
  if (!item.copyable) {
    if (item.value.startsWith('http')) window.open(item.value, '_blank')
    return
  }
  navigator.clipboard.writeText(item.value)
  ElMessage.success('已复制')
}

const isLink = (item) => item.value.startsWith('http')
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
  cursor: pointer;
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
  color: var(--text-secondary);
}

.contact-value {
  flex: 1;
}

.action-icon {
  margin-left: auto;
  color: var(--text-secondary);
}
</style>