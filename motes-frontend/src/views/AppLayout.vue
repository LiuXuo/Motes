<template>
  <a-layout style="min-height: 100vh">
    <AppSidebar v-model:collapsed="collapsed" />
    <a-layout style="display: flex; justify-items: center">
      <AppHeader />
      <a-layout-content theme="light" style="height: calc(100vh - 64px); overflow: hidden">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppHeader from '../components/layout/AppHeader.vue'
import { useDocStore } from '@/stores/docStore'

const docStore = useDocStore()

// 使用store中的状态
const collapsed = computed({
  get: () => docStore.sidebarCollapsed,
  set: (value: boolean) => {
    docStore.sidebarCollapsed = value
  },
})
</script>

<style scoped lang="less">
/* 主布局样式 */
</style>
