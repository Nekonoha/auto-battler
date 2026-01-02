import { ref, computed, type Ref } from 'vue'

/**
 * UI状態管理（モーダル表示、トースト通知）
 */
export function useUIState() {
  const showWeaponSelection = ref(false)
  const showStatManager = ref(false)
  const toastMessage = ref('')
  const toastType = ref<'info' | 'error' | 'loot' | ''>('')

  function showToast(message: string, type: 'info' | 'error' | 'loot') {
    toastMessage.value = message
    toastType.value = type
  }

  return {
    showWeaponSelection,
    showStatManager,
    toastMessage,
    toastType,
    showToast
  }
}
