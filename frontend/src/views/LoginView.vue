<template>
  <div class="page-content">
    <div class="login-card glass-card">
      <!-- Header with animated logo -->
      <div class="login-header">
        <div class="logo-wrapper">
          <span class="logo-bounce">🍓</span>
          <div class="logo-ring"></div>
        </div>
        <h1 class="title-gradient">开心消消乐</h1>
        <p class="subtitle">HappyMatch</p>
      </div>

      <!-- Tab switch with sliding indicator -->
      <div class="tab-switch">
        <div class="tab-indicator" :style="{ transform: `translateX(${mode === 'login' ? 0 : 100}%)` }"></div>
        <button :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
        <button :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
      </div>

      <!-- Login Form -->
      <Transition name="form-slide" mode="out-in">
        <form v-if="mode === 'login'" key="login" @submit.prevent="handleLogin" class="auth-form">
          <div class="input-group" :class="{ focused: focuses.username, error: errors.username }">
            <span class="input-icon">👤</span>
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              autocomplete="username"
              @focus="focuses.username = true"
              @blur="focuses.username = false; validateField('username')"
            />
            <Transition name="fade">
              <span v-if="loginForm.username" class="input-clear" @click="loginForm.username = ''">✕</span>
            </Transition>
          </div>
          <Transition name="fade"><p v-if="errors.username" class="field-error">{{ errors.username }}</p></Transition>

          <div class="input-group" :class="{ focused: focuses.password, error: errors.password }">
            <span class="input-icon">🔒</span>
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              autocomplete="current-password"
              @focus="focuses.password = true"
              @blur="focuses.password = false; validateField('password')"
            />
            <span class="input-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </span>
          </div>
          <Transition name="fade"><p v-if="errors.password" class="field-error">{{ errors.password }}</p></Transition>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span class="checkbox-custom"></span>
              <span>记住密码</span>
            </label>
            <router-link to="/forgot-password" class="forgot-link">忘记密码？</router-link>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading" :class="{ loading }">
            <span v-if="!loading">登 录</span>
            <span v-else class="loading-dots">
              <i></i><i></i><i></i>
            </span>
          </button>
        </form>

        <!-- Register Form -->
        <form v-else key="register" @submit.prevent="handleRegister" class="auth-form">
          <div class="input-group" :class="{ focused: focuses.regUsername, error: errors.regUsername }">
            <span class="input-icon">👤</span>
            <input
              v-model="registerForm.username"
              type="text"
              placeholder="设置用户名（2-20位）"
              autocomplete="off"
              @focus="focuses.regUsername = true"
              @blur="focuses.regUsername = false; validateRegField('regUsername')"
            />
          </div>
          <Transition name="fade"><p v-if="errors.regUsername" class="field-error">{{ errors.regUsername }}</p></Transition>

          <div class="input-group" :class="{ focused: focuses.regPassword, error: errors.regPassword }">
            <span class="input-icon">🔒</span>
            <input
              v-model="registerForm.password"
              :type="showRegPassword ? 'text' : 'password'"
              placeholder="设置密码（4位以上）"
              autocomplete="new-password"
              @focus="focuses.regPassword = true"
              @blur="focuses.regPassword = false; validateRegField('regPassword')"
            />
            <span class="input-toggle" @click="showRegPassword = !showRegPassword">
              {{ showRegPassword ? '🙈' : '👁️' }}
            </span>
          </div>
          <Transition name="fade"><p v-if="errors.regPassword" class="field-error">{{ errors.regPassword }}</p></Transition>

          <div class="input-group" :class="{ focused: focuses.regConfirm, error: errors.regConfirm }">
            <span class="input-icon">🔐</span>
            <input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              autocomplete="new-password"
              @focus="focuses.regConfirm = true"
              @blur="focuses.regConfirm = false; validateRegField('regConfirm')"
            />
          </div>
          <Transition name="fade"><p v-if="errors.regConfirm" class="field-error">{{ errors.regConfirm }}</p></Transition>

          <div class="input-group" :class="{ focused: focuses.secQuestion }">
            <span class="input-icon">❓</span>
            <select v-model="registerForm.securityQuestion" @focus="focuses.secQuestion = true" @blur="focuses.secQuestion = false">
              <option value="" disabled>选择密保问题</option>
              <option v-for="q in securityQuestions" :key="q" :value="q">{{ q }}</option>
            </select>
          </div>

          <div class="input-group" :class="{ focused: focuses.secAnswer, error: errors.secAnswer }">
            <span class="input-icon">💬</span>
            <input
              v-model="registerForm.securityAnswer"
              type="text"
              placeholder="密保答案"
              autocomplete="off"
              @focus="focuses.secAnswer = true"
              @blur="focuses.secAnswer = false"
            />
          </div>
          <Transition name="fade"><p v-if="errors.secAnswer" class="field-error">{{ errors.secAnswer }}</p></Transition>

          <button type="submit" class="submit-btn" :disabled="loading" :class="{ loading }">
            <span v-if="!loading">注 册</span>
            <span v-else class="loading-dots">
              <i></i><i></i><i></i>
            </span>
          </button>
        </form>
      </Transition>

      <!-- Error toast -->
      <Transition name="fade">
        <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const mode = ref('login')
const loading = ref(false)
const showPassword = ref(false)
const showRegPassword = ref(false)

const securityQuestions = [
  '你的小学校名是什么？',
  '你最喜欢的水果是什么？',
  '你的第一个宠物叫什么？',
  '你母亲的姓氏是什么？',
  '你最喜欢的电影是什么？'
]

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  securityQuestion: '',
  securityAnswer: ''
})

const errors = reactive({})
const focuses = reactive({})

const toast = reactive({ show: false, message: '', type: 'error' })

onMounted(() => {
  const remembered = userStore.getRememberedCredentials()
  if (remembered) {
    loginForm.username = remembered.username
    loginForm.password = remembered.password
    loginForm.rememberMe = true
  }
})

function switchMode(m) {
  mode.value = m
  Object.keys(errors).forEach(k => delete errors[k])
}

function showToast(message, type = 'error') {
  toast.show = true
  toast.message = message
  toast.type = type
  setTimeout(() => { toast.show = false }, 3000)
}

function validateField(field) {
  if (field === 'username' && !loginForm.username.trim()) {
    errors.username = '请输入用户名'
  } else if (field === 'username') {
    delete errors.username
  }
  if (field === 'password' && !loginForm.password) {
    errors.password = '请输入密码'
  } else if (field === 'password') {
    delete errors.password
  }
}

function validateRegField(field) {
  if (field === 'regUsername') {
    const val = registerForm.username.trim()
    if (!val) errors.regUsername = '请输入用户名'
    else if (val.length < 2 || val.length > 20) errors.regUsername = '用户名长度2-20位'
    else delete errors.regUsername
  }
  if (field === 'regPassword') {
    if (!registerForm.password) errors.regPassword = '请输入密码'
    else if (registerForm.password.length < 4) errors.regPassword = '密码至少4位'
    else delete errors.regPassword
  }
  if (field === 'regConfirm') {
    if (!registerForm.confirmPassword) errors.regConfirm = '请确认密码'
    else if (registerForm.confirmPassword !== registerForm.password) errors.regConfirm = '两次密码不一致'
    else delete errors.regConfirm
  }
}

async function handleLogin() {
  validateField('username')
  validateField('password')
  if (errors.username || errors.password) return

  loading.value = true
  try {
    await userStore.login(loginForm.username.trim(), loginForm.password, loginForm.rememberMe)
    showToast('登录成功！', 'success')
    setTimeout(() => router.push('/'), 400)
  } catch (e) {
    const data = e.response?.data
    const msg = data?.message || '登录失败，请检查网络连接'
    showToast(msg)
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  validateRegField('regUsername')
  validateRegField('regPassword')
  validateRegField('regConfirm')
  if (!registerForm.securityQuestion) {
    showToast('请选择密保问题')
    return
  }
  if (!registerForm.securityAnswer.trim()) {
    errors.secAnswer = '请填写密保答案'
    return
  }
  if (errors.regUsername || errors.regPassword || errors.regConfirm) return

  loading.value = true
  try {
    await userStore.register({
      username: registerForm.username.trim(),
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword,
      securityQuestion: registerForm.securityQuestion,
      securityAnswer: registerForm.securityAnswer.trim()
    })
    showToast('注册成功！', 'success')
    setTimeout(() => router.push('/'), 400)
  } catch (e) {
    const data = e.response?.data
    const msg = data?.message || '注册失败，请检查网络连接'
    showToast(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 440px;
  padding: 44px 40px;
  animation: cardEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardEnter {
  0% { opacity: 0; transform: translateY(30px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.logo-bounce {
  font-size: 52px;
  display: block;
  animation: logoBounce 2s ease-in-out infinite;
}

@keyframes logoBounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(-5deg); }
  75% { transform: translateY(-4px) rotate(5deg); }
}

.logo-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid var(--primary-light);
  opacity: 0.5;
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.2; }
}

.title-gradient {
  font-size: 26px;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 13px;
  color: var(--text-lighter);
  margin-top: 4px;
  letter-spacing: 2px;
}

/* Tab switch */
.tab-switch {
  display: flex;
  position: relative;
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 28px;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: var(--bg-card-solid);
  border-radius: var(--radius-xs);
  box-shadow: var(--shadow-sm);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-switch button {
  flex: 1;
  padding: 11px;
  border-radius: var(--radius-xs);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
  background: transparent;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.tab-switch button.active {
  color: var(--primary-dark);
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-group {
  display: flex;
  align-items: center;
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 0 14px;
  border: 2px solid transparent;
  transition: var(--transition);
  position: relative;
}

.input-group.focused {
  border-color: var(--primary-light);
  background: white;
  box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.1);
}

.input-group.error {
  border-color: var(--danger);
  background: var(--danger-light);
}

.input-icon {
  font-size: 16px;
  margin-right: 10px;
  flex-shrink: 0;
}

.input-group input,
.input-group select {
  flex: 1;
  padding: 14px 0;
  font-size: 14px;
  background: transparent;
  color: var(--text);
  min-width: 0;
}

.input-group select {
  cursor: pointer;
  appearance: none;
}

.input-group input::placeholder {
  color: var(--text-lighter);
}

.input-clear,
.input-toggle {
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.input-clear:hover,
.input-toggle:hover {
  opacity: 1;
}

.field-error {
  font-size: 12px;
  color: var(--danger);
  padding-left: 4px;
  margin-top: -6px;
}

/* Remember me & forgot password */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-light);
  cursor: pointer;
  user-select: none;
}

.remember-me input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  position: relative;
}

.remember-me input:checked + .checkbox-custom {
  background: var(--primary);
  border-color: var(--primary);
}

.remember-me input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 11px;
  font-weight: bold;
}

.forgot-link {
  font-size: 13px;
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* Submit button */
.submit-btn {
  margin-top: 10px;
  padding: 15px;
  border-radius: var(--radius-sm);
  background: var(--primary-gradient);
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.submit-btn:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.35);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Loading dots */
.loading-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.loading-dots i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: dotBounce 1.4s ease-in-out infinite;
}

.loading-dots i:nth-child(2) { animation-delay: 0.16s; }
.loading-dots i:nth-child(3) { animation-delay: 0.32s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* Form slide transition */
.form-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.form-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.form-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.form-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Toast positioning override for scoped */
.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
