<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Motes</h1>
        <p>思维导图与笔记管理</p>
      </div>

      <!-- 切换按钮 -->
      <div class="auth-tabs">
        <a-segmented
          v-model:value="authMode"
          :options="[
            { label: '登录', value: 'login' },
            { label: '注册', value: 'register' },
          ]"
          size="large"
          block
          class="auth-segmented"
        />
      </div>

      <!-- 表单容器 -->
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
                placeholder="用户名"
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
                placeholder="密码"
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
              {{ isLoading ? '登录中...' : '登录' }}
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
                placeholder="用户名"
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
                placeholder="邮箱"
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
                placeholder="密码"
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
                placeholder="确认密码"
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
              {{ isLoading ? '注册中...' : '注册' }}
            </a-button>
          </form>
        </transition>
      </div>

      <div class="auth-footer">
        <p v-if="isLogin">请输入用户名和密码登录</p>
        <p v-else>请填写完整信息进行注册</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 切换状态
const authMode = ref<'login' | 'register'>('login')
const isLogin = computed(() => authMode.value === 'login')

// 检查URL参数，自动切换到注册模式
onMounted(() => {
  if (route.query.mode === 'register') {
    authMode.value = 'register'
  }
})

// 表单数据
const loginForm = ref({
  username: '',
  password: '',
})

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isLoading = computed(() => userStore.isLoading)

// 容器高度管理
const containerHeight = ref(0)
const loginFormRef = ref<HTMLElement>()
const registerFormRef = ref<HTMLElement>()

// 监听authMode变化
watch(authMode, async (newMode) => {
  await nextTick()
  if (newMode === 'login' && loginFormRef.value) {
    containerHeight.value = loginFormRef.value.offsetHeight
  } else if (newMode === 'register' && registerFormRef.value) {
    containerHeight.value = registerFormRef.value.offsetHeight
  }
})

// 初始化高度
onMounted(async () => {
  await nextTick()
  if (loginFormRef.value) {
    containerHeight.value = loginFormRef.value.offsetHeight
  }
})

// 表单切换动画回调
const onFormEnter = (el: Element) => {
  const form = el as HTMLElement
  containerHeight.value = form.offsetHeight
}

const onFormLeave = (el: Element) => {
  const form = el as HTMLElement
  containerHeight.value = form.offsetHeight
}

// 登录处理
const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    message.error('请输入用户名和密码')
    return
  }

  try {
    const result = await userStore.login(loginForm.value.username, loginForm.value.password)

    if (result.success) {
      message.success('登录成功')
      // 登录成功，跳转到用户文档页面
      router.push('/documents')
    } else {
      message.error(result.error?.details || result.error?.message || '登录失败')
    }
  } catch (error) {
    message.error('登录失败，请重试')
  }
}

// 注册处理
const handleRegister = async () => {
  if (
    !registerForm.value.username ||
    !registerForm.value.email ||
    !registerForm.value.password ||
    !registerForm.value.confirmPassword
  ) {
    message.error('请填写所有必填项')
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }

  if (registerForm.value.password.length < 6) {
    message.error('密码长度至少6位')
    return
  }

  // 简单的邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.value.email)) {
    message.error('请输入有效的邮箱地址')
    return
  }

  try {
    const result = await userStore.register(
      registerForm.value.username,
      registerForm.value.email,
      registerForm.value.password
    )

    if (result.success) {
      message.success('注册成功')
      // 注册并登录成功，跳转到应用页面
      router.push('/documents')
    } else {
      message.error(result.error?.details || result.error?.message || '注册失败')
    }
  } catch (error) {
    message.error('注册失败，请重试')
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

// 输入框样式调整
:deep(.ant-input) {
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

:deep(.ant-input-password) {
  border-radius: 6px;
  border: 1px solid #d9d9d9;

  &:focus,
  &:hover {
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
}

// 图标和文本间距
:deep(.ant-input-prefix) {
  margin-right: 12px;
}
</style>
