<!--
  应用主布局组件

  主要功能：
  - 提供应用的整体布局结构
  - 集成侧边栏和顶部导航
  - 管理侧边栏折叠状态
  - 提供路由视图容器

  Layout 结构：
  - 侧边栏：文档管理和导航
  - 顶部导航：用户信息和操作
  - 主内容区：路由视图容器
-->
<template>
  <a-layout style="min-height: 100vh">
    <!-- 侧边栏组件，支持折叠功能 -->
    <AppSidebar v-model:collapsed="collapsed" />

    <!-- 主布局区域 -->
    <a-layout style="display: flex; justify-items: center">
      <!-- 顶部导航栏 -->
      <AppHeader />

      <!-- 主内容区域 -->
      <a-layout-content theme="light" style="height: calc(100vh - 64px); overflow: hidden">
        <!-- 路由视图容器，显示当前路由对应的组件 -->
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
/**
 * 应用主布局组件逻辑
 *
 * 使用 Composition API 管理布局状态，
 * 包括侧边栏折叠状态的管理和与文档 Store 的集成。
 */

import { computed } from 'vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppHeader from '../components/layout/AppHeader.vue'
import { useDocStore } from '@/stores/docStore'

// ==================== 状态管理 ====================
const docStore = useDocStore()

/**
 * 侧边栏折叠状态
 *
 * 使用计算属性实现双向绑定，将侧边栏的折叠状态
 * 与文档 Store 中的状态同步。
 *
 * @type {ComputedRef<boolean>}
 */
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
