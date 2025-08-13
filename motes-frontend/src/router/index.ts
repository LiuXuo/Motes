/**
 * Vue Router 配置
 *
 * 定义 Motes 应用的路由结构，包括：
 * - 页面路由配置（首页、登录、文档管理、脑图编辑等）
 * - 路由守卫（认证检查、数据预加载）
 * - 懒加载组件配置
 * - 元信息配置（认证要求）
 *
 * 路由结构：
 * - /: 重定向到首页
 * - /home: 应用首页
 * - /login: 用户登录页
 * - /documents: 文档管理页面
 * - /folder/:folderId: 文件夹页面
 * - /mote/:moteId: 脑图编辑页面
 * - /trash: 回收站页面
 * - /ai: AI 生成页面
 * - /:pathMatch(.*)*: 404 页面
 *
 * @constant {Router} router - 路由实例
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useDocStore } from '../stores/docStore'

/**
 * 路由配置对象
 *
 * 定义应用的所有路由规则，支持嵌套路由和懒加载。
 * 每个路由都配置了相应的认证要求和组件加载策略。
 */
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
      component: () => import('../views/HomePage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/documents',
      component: () => import('../views/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('../components/layout/AppDocGrid.vue'),
        },
      ],
    },
    {
      path: '/folder/:folderId',
      component: () => import('../views/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('../components/layout/AppDocGrid.vue'),
        },
      ],
    },
    {
      path: '/mote/:moteId',
      component: () => import('../views/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('../components/layout/AppMote.vue'),
        },
      ],
    },
    {
      path: '/trash',
      component: () => import('../views/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('../components/layout/AppDocGrid.vue'),
        },
      ],
    },
    {
      path: '/ai',
      component: () => import('../views/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('../components/layout/AppAiGenrate.vue')
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundPage.vue'),
      meta: { requiresAuth: false },
    },
  ],
})

/**
 * 全局路由守卫
 *
 * 在路由跳转前进行权限检查和数据预加载：
 * - 检查用户登录状态
 * - 重定向未授权用户到登录页
 * - 处理已登录用户访问登录页的情况
 * - 确保文档数据加载完成
 * - 处理认证失败的情况
 *
 * @param {RouteLocationNormalized} to - 目标路由
 * @param {RouteLocationNormalized} from - 来源路由
 * @param {NavigationGuardNext} next - 导航守卫函数
 *
 * @example
 * // 路由守卫会自动处理以下场景：
 * // 1. 未登录用户访问需要认证的页面 -> 重定向到登录页
 * // 2. 已登录用户访问登录页 -> 重定向到文档页面
 * // 3. 访问需要认证的页面时自动加载文档树数据
 */
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
