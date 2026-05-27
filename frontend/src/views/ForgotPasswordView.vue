<template>
  <div class="page-content">
    <div class="forgot-card glass-card">
      <!-- Header -->
      <div class="forgot-header">
        <div class="header-icon-wrap">
          <span class="header-icon">🔑</span>
        </div>
        <h1 class="title-gradient">找回密码</h1>
        <p class="subtitle">通过密保问题验证身份</p>
      </div>

      <!-- Step indicator -->
      <div class="steps">
        <div class="step" :class="{ active: step >= 1, done: step > 1 }">
          <span class="step-dot">{{ step > 1 ? '✓' : '1' }}</span>
          <span class="step-label">验证身份</span>
        </div>
        <div class="step-line" :class="{ active: step > 1 }"></div>
        <div class="step" :class="{ active: step >= 2, done: step > 2 }">
          <span class="step-dot">{{ step > 2 ? '✓' : '2' }}</span>
          <span class="step-label">重置密码</span>
        </div>
        <div class="step-line" :class="{ active: step > 2 }"></div>
        <div class="step" :class="{ active: step >= 3 }">
          <span class="step-dot">3</span>
          <span class="step-label">完成</span>
        </div>
      </div>

      <!-- Step 1: Enter username & get question -->
      <Transition name="step-slide" mode="out-in">
        <form v-if="step === 1" key="step1" @submit.prevent="handleGetQuestion" class="forgot-form">
          <div class="input-group" :class="{ focused: focuses.username, error: errors.username }">
            <span class="input-icon">👤</span>
            <input
              v-model="form.username"
              type="text"
              placeholder="请输入注册时的用户名"
              @focus="focuses.username = true"
              @blur="focuses.username = false"
            />
          </div>
          <Transition name="fade"><p v-if="errors.username" class="field-error">{{ errors.username }}</p></Transition>

          <button type="submit" class="submit-btn" :disabled="loading" :class="{ loading }">
            <span v-if="!loading">下一步</span>
            <span v-else class="loading-dots"><i></i><i></i><i></i></span>
          </button>

          <router-link to="/login" class="back-link">← 返回登录</router-link>
        </form>

        <!-- Step 2: Answer question & set new password -->
        <form v-else-if="step === 2" key="step2" @submit.prevent="handleReset" class="forgot-form">
          <div class="question-card">
            <span class="q-icon">❓</span>
            <p class="q-text">{{ securityQuestion }}</p>
          </div>

          <div class="input-group" :class="{ focused: focuses.answer, error: errors.answer }">
            <span class="input-icon">💬</span>
            <input
              v-model="form.securityAnswer"
              type="text"
              placeholder="请输入密保答案"
              @focus="focuses.answer = true"
              @blur="focuses.answer = false"
            />
          </div>
          <Transition name="fade"><p v-if="errors.answer" class="field-error">{{ errors.answer }}</p></Transition>

          <div class="input-group" :class="{ focused: focuses.newPass, error: errors.newPass }">
            <span class="input-icon">🔒</span>
            <input
              v-model="form.newPassword"
              type="password"
              placeholder="设置新密码（4位以上）"
              @focus="focuses.newPass = true"
              @blur="focuses.newPass = false"
            />
          </div>
          <Transition name="fade"><p v-if="errors.newPass" class="field-error">{{ errors.newPass }}</p></Transition>

          <div class="input-group" :class="{ focused: focuses.confirmPass, error: errors.confirmPass }">
            <span class="input-icon">🔐</span>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="确认新密码"
              @focus="focuses.confirmPass = true"
              @blur="focuses.confirmPass = false"
            />
          </div>
          <Transition name="fade"><p v-if="errors.confirmPass" class="field-error">{{ errors.confirmPass }}</p></Transition>

          <button type="submit" class="submit-btn" :disabled="loading" :class="{ loading }">
            <span v-if="!loading">重置密码</span>
            <span v-else class="loading-dots"><i></i><i></i><i></i></span>
          </button>

          <button type="button" class="back-link" @click="step = 1">← 上一步</button>
        </form>

        <!-- Step 3: Success -->
        <div v-else key="step3" class="success-panel">
          <div class="success-icon-wrap">
            <span class="success-icon">🎉</span>
          </div>
          <h2>密码重置成功！</h2>
          <p>请使用新密码登录你的账号</p>
          <router-link to="/login" class="submit-btn" style="display: block; text-align: center; text-decoration: none; margin-top: 24px;">
            去登录
          </router-link>
        </div>
      </Transition>

      <!-- Toast -->
      <Transition name="fade">
        <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const step = ref(1)
const loading = ref(false)
const securityQuestion = ref('')

const form = reactive({
  username: '',
  securityAnswer: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({})
const focuses = reactive({})
const toast = reactive({ show: false, message: '', type: 'error' })

function showToast(message, type = 'error') {
  toast.show = true
  toast.message = message
  toast.type = type
  setTimeout(() => { toast.show = false }, 3000)
}

async function handleGetQuestion() {
  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    return
  }
  delete errors.username
  loading.value = true
  try {
    const question = await userStore.getSecurityQuestion(form.username.trim())
    securityQuestion.value = question
    step.value = 2
  } catch (e) {
    const data = e.response?.data
    const msg = data?.message || '查询失败，请检查网络连接'
    showToast(msg)
  } finally {
    loading.value = false
  }
}

async function handleReset() {
  let hasError = false
  if (!form.securityAnswer.trim()) {
    errors.answer = '请输入密保答案'
    hasError = true
  } else {
    delete errors.answer
  }
  if (!form.newPassword || form.newPassword.length < 4) {
    errors.newPass = '密码至少4位'
    hasError = true
  } else {
    delete errors.newPass
  }
  if (form.newPassword !== form.confirmPassword) {
    errors.confirmPass = '两次密码不一致'
    hasError = true
  } else {
    delete errors.confirmPass
  }
  if (hasError) return

  loading.value = true
  try {
    await userStore.resetPassword({
      username: form.username.trim(),
      securityAnswer: form.securityAnswer.trim(),
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword
    })
    step.value = 3
  } catch (e) {
    const data = e.response?.data
    const msg = data?.message || '重置失败，请检查网络连接'
    showToast(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-card {
  width: 100%;
  max-width: 440px;
  padding: 44px 40px;
  animation: cardEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardEnter {
  0% { opacity: 0; transform: translateY(30px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.forgot-header {
  text-align: center;
  margin-bottom: 28px;
}

.header-icon-wrap {
  margin-bottom: 12px;
}

.header-icon {
  font-size: 44px;
  display: inline-block;
  animation: keySwing 2s ease-in-out infinite;
}

@keyframes keySwing {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.title-gradient {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 13px;
  color: var(--text-lighter);
  margin-top: 4px;
}

/* Steps indicator */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  gap: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  background: var(--bg);
  color: var(--text-lighter);
  border: 2px solid var(--border);
  transition: var(--transition);
}

.step.active .step-dot {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.2);
}

.step.done .step-dot {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.step-label {
  font-size: 11px;
  color: var(--text-lighter);
  white-space: nowrap;
}

.step.active .step-label {
  color: var(--primary-dark);
  font-weight: 500;
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--border);
  margin: 0 8px;
  margin-bottom: 20px;
  transition: background 0.4s ease;
}

.step-line.active {
  background: var(--primary);
}

/* Form */
.forgot-form {
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
}

.input-group input {
  flex: 1;
  padding: 14px 0;
  font-size: 14px;
  background: transparent;
  color: var(--text);
}

.input-group input::placeholder {
  color: var(--text-lighter);
}

.field-error {
  font-size: 12px;
  color: var(--danger);
  padding-left: 4px;
  margin-top: -6px;
}

/* Question card */
.question-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #faf5ff, #ede9fe);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.q-icon { font-size: 20px; }
.q-text { font-size: 14px; color: var(--text); font-weight: 500; }

/* Submit button */
.submit-btn {
  margin-top: 8px;
  padding: 15px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  color: white;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
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

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-link {
  display: block;
  text-align: center;
  font-size: 13px;
  color: var(--primary);
  text-decoration: none;
  padding: 8px;
  background: none;
  cursor: pointer;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--primary-dark);
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

/* Success panel */
.success-panel {
  text-align: center;
  padding: 20px 0;
}

.success-icon-wrap {
  margin-bottom: 16px;
}

.success-icon {
  font-size: 56px;
  display: inline-block;
  animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes successPop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.success-panel h2 {
  font-size: 20px;
  color: var(--text);
  margin-bottom: 8px;
}

.success-panel p {
  font-size: 14px;
  color: var(--text-light);
}

/* Step slide transition */
.step-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.step-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.step-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
