<template>
  <div class="load-error" role="alert">
    <el-alert :title="errorMessage(error, t)" type="error" show-icon :closable="false" />
    <el-button class="retry-btn" @click="$emit('retry')">{{ t('msg.retry') }}</el-button>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { errorMessage } from '@/utils/content'
defineProps({ error: { type: Object, required: true } })
defineEmits(['retry'])
const { t } = useI18n()
</script>
<style scoped>
.retry-btn { margin-top: 12px; }
</style>
