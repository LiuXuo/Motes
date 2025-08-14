<template>
  <a-config-provider :locale="antdLocale">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ConfigProvider as AConfigProvider } from 'ant-design-vue'
import { getAntdLocale } from '@/i18n'

// 获取 Ant Design Vue 的语言包
const antdLocale = computed(() => getAntdLocale())
</script>

<style scoped lang="less"></style>
