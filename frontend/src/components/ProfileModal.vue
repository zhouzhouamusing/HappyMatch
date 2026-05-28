<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card profile-modal">
        <button class="modal-close" @click="$emit('close')">×</button>
        <div class="profile-header">
          <span class="profile-header-icon">✏️</span>
          <h2 class="title-gradient">编辑资料</h2>
        </div>

        <div class="profile-form">
          <div class="form-group">
            <label class="form-label">选择头像</label>
            <div class="avatar-grid">
              <button
                v-for="av in avatarOptions"
                :key="av"
                class="avatar-option"
                :class="{ selected: selectedAvatar === av }"
                @click="selectedAvatar = av"
              >
                {{ av }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">昵称</label>
            <input
              v-model="nicknameInput"
              type="text"
              class="nickname-input"
              placeholder="输入昵称（1-15个字符）"
              maxlength="15"
            />
            <span class="char-count">{{ nicknameInput.length }}/15</span>
          </div>
        </div>

        <div class="profile-actions">
          <button class="btn-save" @click="handleSave" :disabled="saving">
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <button class="btn-cancel" @click="$emit('close')">取消</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  currentAvatar: { type: String, default: '🙂' },
  currentNickname: { type: String, default: '' }
})

const emit = defineEmits(['close', 'save'])

const avatarOptions = ['🙂', '😎', '🤩', '😄', '🥳', '😺', '🐼', '🦊', '🐸', '🌟', '🎮', '🎯']
const selectedAvatar = ref(props.currentAvatar)
const nicknameInput = ref(props.currentNickname)
const saving = ref(false)

watch(() => props.show, (val) => {
  if (val) {
    selectedAvatar.value = props.currentAvatar || '🙂'
    nicknameInput.value = props.currentNickname || ''
  }
})

async function handleSave() {
  saving.value = true
  try {
    await emit('save', { nickname: nicknameInput.value, avatar: selectedAvatar.value })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.profile-modal {
  background: white;
  border-radius: 24px;
  padding: 32px 28px;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
}

.profile-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #a78bfa, #7c3aed, #a78bfa);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 24px;
  color: var(--text-lighter);
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--transition-fast);
}

.modal-close:hover {
  background: var(--bg);
  color: var(--text);
}

.profile-header {
  text-align: center;
  margin-bottom: 24px;
}

.profile-header-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}

.title-gradient {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  position: relative;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 10px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.avatar-option {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--border-light);
  background: var(--bg);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-option:hover {
  transform: scale(1.1);
  border-color: var(--primary-light);
}

.avatar-option.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
  transform: scale(1.1);
  background: #faf5ff;
}

.nickname-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid var(--border-light);
  font-size: 14px;
  transition: var(--transition-fast);
  outline: none;
  box-sizing: border-box;
}

.nickname-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 11px;
  color: var(--text-lighter);
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-save {
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 10px;
  border-radius: 12px;
  background: none;
  border: 1px solid var(--border-light);
  color: var(--text-light);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-cancel:hover {
  background: var(--bg);
}

.modal-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .profile-modal {
  transform: scale(0.85) translateY(20px);
}
.modal-leave-to .profile-modal {
  transform: scale(0.95);
}
</style>
