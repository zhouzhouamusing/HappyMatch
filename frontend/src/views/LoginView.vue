<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="logo">🍓</span>
        <h1>开心消消乐</h1>
        <p>HappyMatch</p>
      </div>

      <div class="tab-switch">
        <button
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >登录</button>
        <button
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >注册</button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="input-group">
          <span class="input-icon">👤</span>
          <input
            v-model="username"
            type="text"
            :placeholder="mode === 'login' ? '请输入用户名' : '设置用户名（2-20位）'"
            autocomplete="username"
          />
        </div>
        <div class="input-group">
          <span class="input-icon">🔒</span>
          <input
            v-model="password"
            type="password"
            :placeholder="mode === 'login' ? '请输入密码' : '设置密码（4位以上）'"
            autocomplete="current-password"
          />
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '请稍候...' : (mode === 'login' ? '登录' : '注册') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const mode = ref('login')
const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '请填写用户名和密码'
    return
  }
  loading.value = true
  try {
    if (mode.value === 'login') {
      await userStore.login(username.value, password.value)
    } else {
      await userStore.register(username.value, password.value)
    }
    router.push('/')
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #faf5ff 0%, #ede9fe 50%, #fce7f3 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 40px 36px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
}

.login-header h1 {
  font-size: 24px;
  color: var(--primary-dark);
  margin-bottom: 4px;
}

.login-header p {
  font-size: 13px;
  color: var(--text-light);
}

.tab-switch {
  display: flex;
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 24px;
}

.tab-switch button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-light);
  background: transparent;
  transition: all 0.25s ease;
}

.tab-switch button.active {
  background: var(--bg-card);
  color: var(--primary-dark);
  box-shadow: var(--shadow-sm);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  align-items: center;
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 0 14px;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.input-group:focus-within {
  border-color: var(--primary-light);
}

.input-icon {
  font-size: 16px;
  margin-right: 10px;
}

.input-group input {
  flex: 1;
  padding: 14px 0;
  font-size: 14px;
  background: transparent;
  color: var(--text);
}

.input-group input::placeholder {
  color: var(--text-light);
}

.error-msg {
  color: var(--danger);
  font-size: 13px;
  text-align: center;
}

.submit-btn {
  margin-top: 8px;
  padding: 14px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  font-size: 15px;
  font-weight: 600;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
