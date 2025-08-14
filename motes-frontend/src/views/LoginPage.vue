<!--
  用户认证页面组件

  主要功能：
  - 提供用户登录和注册功能
  - 支持登录/注册模式切换
  - 表单验证和错误处理
  - 平滑的动画过渡效果
  - 响应式设计适配

  页面结构：
  - 头部：应用标题和描述
  - 切换：登录/注册模式切换
  - 表单：动态表单内容
  - 底部：操作提示信息
-->
<template>
  <div class="auth-container">
    <!-- 语言切换按钮 -->
    <div class="language-switch-container">
      <LanguageSwitch />
    </div>

    <div class="auth-card">
      <!-- 头部区域：应用标题和描述 -->
      <div class="auth-header">
        <h1>{{ t('app.name') }}</h1>
        <p>{{ t('app.slogan') }}</p>
      </div>

      <!-- 认证模式切换区域 -->
      <div class="auth-tabs">
        <a-segmented
          v-model:value="authMode"
          :options="[
            { label: t('common.login'), value: 'login' },
            { label: t('common.register'), value: 'register' },
          ]"
          size="large"
          block
          class="auth-segmented"
        />
      </div>

      <!-- 表单容器：支持动态高度和动画 -->
      <div class="form-container" :style="{ height: containerHeight + 'px' }">
        <!-- 登录表单 -->
        <transition name="form-fade" mode="out-in" @enter="onFormEnter" @leave="onFormLeave">
          <form
            v-if="isLogin"
            @submit.prevent="handleLogin"
            class="auth-form"
            key="login"
            ref="loginFormRef"
          >
            <div class="form-group">
              <a-input
                v-model:value="loginForm.username"
                size="large"
                :placeholder="t('common.username')"
                :disabled="isLoading"
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </div>

            <div class="form-group">
              <a-input-password
                v-model:value="loginForm.password"
                size="large"
                :placeholder="t('common.password')"
                :disabled="isLoading"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </div>

            <a-button
              type="primary"
              size="large"
              html-type="submit"
              :loading="isLoading"
              class="auth-button"
              block
            >
              {{ isLoading ? t('common.loading') : t('common.login') }}
            </a-button>
          </form>

          <!-- 注册表单 -->
          <form
            v-else
            @submit.prevent="handleRegister"
            class="auth-form"
            key="register"
            ref="registerFormRef"
          >
            <div class="form-group">
              <a-input
                v-model:value="registerForm.username"
                size="large"
                :placeholder="t('LoginPageVue.usernamePlaceholder')"
                :disabled="isLoading"
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </div>

            <div class="form-group">
              <a-input
                v-model:value="registerForm.email"
                size="large"
                :placeholder="t('LoginPageVue.emailPlaceholder')"
                :disabled="isLoading"
              >
                <template #prefix>
                  <MailOutlined />
                </template>
              </a-input>
            </div>

            <div class="form-group">
              <a-input-password
                v-model:value="registerForm.password"
                size="large"
                :placeholder="t('LoginPageVue.passwordPlaceholder')"
                :disabled="isLoading"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </div>

            <div class="form-group">
              <a-input-password
                v-model:value="registerForm.confirmPassword"
                size="large"
                :placeholder="t('LoginPageVue.confirmPasswordPlaceholder')"
                :disabled="isLoading"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </div>

            <a-button
              type="primary"
              size="large"
              html-type="submit"
              :loading="isLoading"
              class="auth-button"
              block
            >
              {{ isLoading ? t('LoginPageVue.loadingRegister') : t('LoginPageVue.registerButton') }}
            </a-button>
          </form>
        </transition>
      </div>

      <div class="auth-footer">
        <p v-if="isLogin">{{ t('LoginPageVue.loginHint') }}</p>
        <p v-else>{{ t('LoginPageVue.registerHint') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 用户认证页面组件逻辑
 *
 * 使用 Composition API 管理认证状态和表单交互，
 * 包括登录/注册模式切换、表单验证、动画效果和路由导航。
 */

import { ref, nextTick, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitch from '../components/LanguageSwitch.vue'

// ==================== 路由和状态管理 ====================
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { t } = useI18n()

// ==================== 认证模式管理 ====================
/**
 * 当前认证模式
 *
 * 控制当前显示的是登录表单还是注册表单。
 *
 * @type {Ref<'login' | 'register'>}
 */
const authMode = ref<'login' | 'register'>('login')

/**
 * 是否为登录模式
 *
 * 计算属性，用于条件渲染登录表单。
 *
 * @type {ComputedRef<boolean>}
 */
const isLogin = computed(() => authMode.value === 'login')

/**
 * 检查URL参数并设置认证模式
 *
 * 组件挂载时检查URL查询参数，
 * 如果存在 mode=register 则自动切换到注册模式。
 */
onMounted(() => {
  if (route.query.mode === 'register') {
    authMode.value = 'register'
  }
})

// ==================== 表单数据管理 ====================
/**
 * 登录表单数据
 *
 * 包含用户名和密码字段。
 *
 * @type {Ref<{username: string, password: string}>}
 */
const loginForm = ref({
  username: '',
  password: '',
})

/**
 * 注册表单数据
 *
 * 包含用户名、邮箱、密码和确认密码字段。
 *
 * @type {Ref<{username: string, email: string, password: string, confirmPassword: string}>}
 */
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

/**
 * 加载状态
 *
 * 从用户 Store 获取当前加载状态。
 *
 * @type {ComputedRef<boolean>}
 */
const isLoading = computed(() => userStore.isLoading)

// ==================== 容器高度管理 ====================
/**
 * 表单容器高度
 *
 * 动态计算表单容器的高度，确保动画效果流畅。
 *
 * @type {Ref<number>}
 */
const containerHeight = ref(0)

/** 登录表单DOM引用 */
const loginFormRef = ref<HTMLElement>()

/** 注册表单DOM引用 */
const registerFormRef = ref<HTMLElement>()

/**
 * 监听认证模式变化并调整容器高度
 *
 * 当用户在登录和注册模式间切换时，
 * 动态调整容器高度以适应不同表单的高度。
 *
 * @param {string} newMode - 新的认证模式
 */
watch(authMode, async (newMode) => {
  await nextTick()
  if (newMode === 'login' && loginFormRef.value) {
    containerHeight.value = loginFormRef.value.offsetHeight
  } else if (newMode === 'register' && registerFormRef.value) {
    containerHeight.value = registerFormRef.value.offsetHeight
  }
})

/**
 * 初始化容器高度
 *
 * 组件挂载后设置初始容器高度。
 */
onMounted(async () => {
  await nextTick()
  if (loginFormRef.value) {
    containerHeight.value = loginFormRef.value.offsetHeight
  }
})

// ==================== 动画回调函数 ====================
/**
 * 表单进入动画回调
 *
 * 当表单进入时更新容器高度。
 *
 * @param {Element} el - 进入的DOM元素
 */
const onFormEnter = (el: Element) => {
  const form = el as HTMLElement
  containerHeight.value = form.offsetHeight
}

/**
 * 表单离开动画回调
 *
 * 当表单离开时更新容器高度。
 *
 * @param {Element} el - 离开的DOM元素
 */
const onFormLeave = (el: Element) => {
  const form = el as HTMLElement
  containerHeight.value = form.offsetHeight
}

// ==================== 表单处理函数 ====================
/**
 * 处理登录表单提交
 *
 * 验证表单数据，调用用户 Store 的登录方法，
 * 处理登录结果并导航到相应页面。
 *
 * @returns {Promise<void>}
 *
 * @throws {Error} 当表单验证失败时
 * @throws {Error} 当登录请求失败时
 */
const handleLogin = async () => {
  // 表单验证
  if (!loginForm.value.username || !loginForm.value.password) {
    message.error(t('LoginPageVue.validationErrors.requiredFields'))
    return
  }

  try {
    const result = await userStore.login(loginForm.value.username, loginForm.value.password)

    if (result.success) {
      message.success(t('LoginPageVue.successMessages.loginSuccess'))
      // 登录成功，跳转到用户文档页面
      router.push('/documents')
    } else {
      message.error(result.error?.details || result.error?.message || t('LoginPageVue.validationErrors.loginFailed'))
    }
  } catch {
    message.error(t('LoginPageVue.validationErrors.loginFailed'))
  }
}

/**
 * 处理注册表单提交
 *
 * 验证表单数据，包括必填项检查、密码一致性验证、
 * 密码长度验证和邮箱格式验证，然后调用用户 Store 的注册方法。
 *
 * @returns {Promise<void>}
 *
 * @throws {Error} 当表单验证失败时
 * @throws {Error} 当注册请求失败时
 */
const handleRegister = async () => {
  // 必填项验证
  if (
    !registerForm.value.username ||
    !registerForm.value.email ||
    !registerForm.value.password ||
    !registerForm.value.confirmPassword
  ) {
    message.error(t('LoginPageVue.validationErrors.requiredFields'))
    return
  }

  // 密码一致性验证
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    message.error(t('LoginPageVue.validationErrors.passwordMismatch'))
    return
  }

  // 密码长度验证
  if (registerForm.value.password.length < 6) {
    message.error(t('LoginPageVue.validationErrors.passwordLength'))
    return
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.value.email)) {
    message.error(t('LoginPageVue.validationErrors.invalidEmail'))
    return
  }

  try {
    const result = await userStore.register(
      registerForm.value.username,
      registerForm.value.email,
      registerForm.value.password
    )

    if (result.success) {
      message.success(t('LoginPageVue.successMessages.registerSuccess'))
      // 注册并登录成功，跳转到应用页面
      router.push('/documents')
    } else {
      message.error(result.error?.details || result.error?.message || t('LoginPageVue.validationErrors.registerFailed'))
    }
  } catch {
    message.error(t('LoginPageVue.validationErrors.registerFailed'))
  }
}
</script>

<style scoped lang="less">
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
  position: relative;
}

.language-switch-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.auth-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 48px;
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    color: #000;
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }

  p {
    color: #666;
    font-size: 14px;
    margin: 0;
  }
}

.auth-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.auth-segmented {
  width: 100%;

  :deep(.ant-segmented-item) {
    font-size: 16px;
    font-weight: 500;
  }
}

.form-container {
  // 让容器高度自适应内容，避免写死高度
  transition: height 0.3s ease;
}

.auth-form {
  .form-group {
    margin-bottom: 24px;
  }
}

// 表单切换动画
.form-fade-enter-active,
.form-fade-leave-active {
  transition: all 0.3s ease;
}

.form-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.form-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.form-fade-enter-to,
.form-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.auth-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  background-color: rgba(0, 0, 0, 0.66) !important;
  border: none !important;

  &:hover {
    background-color: rgba(0, 0, 0, 0.88) !important;
  }

  &:disabled {
    background-color: rgba(0, 0, 0, 0.2) !important;
  }
}

.auth-footer {
  margin-top: 32px;
  text-align: center;

  p {
    color: #999;
    font-size: 12px;
    margin: 0;
  }
}

// 与 Ant Design 的通用覆写已移至全局样式
</style>
