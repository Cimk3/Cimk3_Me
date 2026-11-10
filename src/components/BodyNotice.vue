<template><p v-if="locale === 'en'" class="body-notice">{{ t('msg.chineseBody') }}</p></template>
<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
</script>
