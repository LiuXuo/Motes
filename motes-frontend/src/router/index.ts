import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../views/AppLayout.vue'
import AppDocGrid from '../components/layout/AppDocGrid.vue'
import AppMote from '../components/layout/AppMote.vue'
import AppAiGenrate from '../components/layout/AppAiGenrate.vue'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import NotFoundPage from '../views/NotFoundPage.vue'
import { useUserStore } from '../stores/userStore'
import { useDocStore } from '../stores/docStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'home',
      component: HomePage,
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { requiresAuth: false },
    },
    {
      path: '/documents',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: AppDocGrid,
        },
      ],
    },
    {
      path: '/folder/:folderId',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: AppDocGrid,
        },
      ],
    },
    {
      path: '/mote/:moteId',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: AppMote,
        },
      ],
    },
    {
      path: '/trash',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: AppDocGrid,
        },
      ],
    },
    {
      path: '/ai',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', component: AppAiGenrate },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
      meta: { requiresAuth: false },
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 如果路由需要认证且用户未登录，重定向到登录页
  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    // 如果已登录用户访问登录页，重定向到应用页面
    next('/documents')
  } else {
    // 如果用户已登录且访问需要认证的页面，确保数据已加载
    if (to.meta.requiresAuth && userStore.isLoggedIn) {
      const docStore = useDocStore()
      // 检查是否需要加载数据：如果还没有初始化过或者正在加载中
      const needsDataLoad = !docStore.isInitialized && !docStore.isLoading

      if (needsDataLoad) {
        try {
          await docStore.fetchDocTree()
        } catch (error) {
          console.error('路由守卫中获取文档树失败:', error)
          // 如果获取失败，仍然允许导航，但用户可能会看到空状态
        }
      }
    }
    next()
  }
})

export default router
