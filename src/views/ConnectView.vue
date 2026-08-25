<template>
  <div class="connect">
    <div
      v-for="c in contacts"
      :key="c.label"
      class="contact-item"
      :class="{ copyable: c.copyable }"
      @click="handleContact(c)"
    >
      <el-icon :size="20"><component :is="c.icon" /></el-icon>
      <span class="contact-label">{{ c.label }}</span>
      <span class="contact-value">{{ c.value }}</span>
      <el-icon v-if="c.copyable" :size="14" class="copy-icon"><CopyDocument /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const contacts = [
  { label: '邮箱', value: 'a2034379061@163.com', icon: 'Message', copyable: true },
  { label: 'GitHub', value: 'https://github.com/Cimk3', icon: 'Link' },
]

const handleContact = (item) => {
  if (!item.copyable) {
    // 非复制类（如链接）点击后新窗口打开
    if (item.value.startsWith('http')) window.open(item.value, '_blank')
    return
  }
  navigator.clipboard.writeText(item.value)
  ElMessage.success('邮箱已复制')
}
</script>

<style scoped>
.connect {
  max-width: 640px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 8px;
  border-bottom: 1px solid var(--border-color); /* 用分隔线隔开每一项 */
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact-item:last-child {
  border-bottom: none; /* 最后一项不加分隔线 */
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

.copy-icon {
  color: var(--text-secondary);
}
</style>