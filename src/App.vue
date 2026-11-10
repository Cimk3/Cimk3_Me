<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { detailTitle } from '@/composables/usePageTitle'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const { locale, t } = useI18n()
const route = useRoute()
watchEffect(() => {
  document.documentElement.lang = locale.value === 'en' ? 'en' : 'zh-CN'
  const title = detailTitle.value?.path === route.path ? detailTitle.value.title : ''
  document.title = `${title || t(route.meta.titleKey || 'menu.home')} | Cimk3`
})
const elLocale = computed(() => (locale.value === 'zh' ? zhCn : en))
</script>
