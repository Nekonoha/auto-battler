import { ref } from 'vue'
import type { SaveData, SaveSlotId, ManualSlotEntry } from './useSaveSystem'

export function useSaveLoadHandlers(
  buildSaveData: () => SaveData,
  buildEnvelope: (data?: SaveData) => Promise<any>,
  applySaveData: (data: SaveData, opts?: { silent?: boolean }) => void,
  validateSaveData: (data: any) => data is SaveData,
  saveToLocal: (payload?: SaveData) => Promise<void>,
  refreshManualSlots: () => void,
  encryptAndCompress: (plaintext: string) => Promise<any>,
  decryptAndDecompress: (payload: any) => Promise<string | null>,
  showToast: (message: string, type: 'info' | 'error' | 'loot') => void
) {
  const showSettings = ref(false)
  const showSaveMenu = ref(false)

  const SAVE_SLOTS_KEY = 'auto-battler-manual-saves'

  async function handleSaveEntry(entry: { id: SaveSlotId | 'autosave'; kind: 'auto' | 'manual' }) {
    if (entry.kind === 'auto') {
      await saveToLocal()
      refreshManualSlots()
      showToast('オートセーブしました', 'info')
      return
    }

    const name = window.prompt('セーブ名を入力してください', `セーブ${entry.id === 'slot1' ? '1' : '2'}`)
    if (!name) return

    try {
      const data = buildSaveData()
      const envelope = await buildEnvelope(data)
      const raw = localStorage.getItem(SAVE_SLOTS_KEY)
      const slots: ManualSlotEntry[] = raw ? JSON.parse(raw) : []
      const index = slots.findIndex(s => s.id === entry.id)
      const newSlot: ManualSlotEntry = { id: entry.id, label: name, savedAt: data.timestamp, envelope }
      
      if (index >= 0) {
        slots[index] = newSlot
      } else {
        slots.push(newSlot)
      }
      
      localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots))
      refreshManualSlots()
      showToast(`${name}にセーブしました`, 'info')
    } catch (e) {
      console.error('セーブエラー:', e)
      showToast('セーブに失敗しました', 'error')
    }
  }

  async function handleLoadEntry(entry: { id: SaveSlotId | 'autosave'; kind: 'auto' | 'manual' }) {
    try {
      if (entry.kind === 'auto') {
        const raw = localStorage.getItem('auto-battler-save')
        if (!raw) {
          showToast('オートセーブデータがありません', 'error')
          return
        }
        const parsed = JSON.parse(raw)
        let payload: SaveData | null = null
        
        if (parsed.encoded || parsed.raw) {
          const envelope = parsed
          if (envelope.encoded) {
            const decrypted = await decryptAndDecompress(envelope.encoded)
            if (decrypted) payload = JSON.parse(decrypted)
          }
          if (!payload && envelope.raw) {
            payload = envelope.raw
          }
        } else if (parsed.data && parsed.iv) {
          const decrypted = await decryptAndDecompress(parsed)
          if (decrypted) payload = JSON.parse(decrypted)
        } else {
          payload = parsed
        }
        
        if (!validateSaveData(payload)) {
          throw new Error('無効なセーブデータです')
        }
        applySaveData(payload)
      } else {
        const raw = localStorage.getItem(SAVE_SLOTS_KEY)
        if (!raw) {
          showToast('セーブデータがありません', 'error')
          return
        }
        const slots: ManualSlotEntry[] = JSON.parse(raw)
        const slot = slots.find(s => s.id === entry.id)
        if (!slot?.envelope) {
          showToast('セーブデータが見つかりません', 'error')
          return
        }
        
        let payload: SaveData | null = null
        if (slot.envelope.encoded) {
          const decrypted = await decryptAndDecompress(slot.envelope.encoded)
          if (decrypted) payload = JSON.parse(decrypted)
        }
        if (!payload && slot.envelope.raw) {
          payload = slot.envelope.raw
        }
        
        if (!validateSaveData(payload)) {
          throw new Error('無効なセーブデータです')
        }
        applySaveData(payload)
      }
      showSaveMenu.value = false
    } catch (e) {
      console.error('ロードエラー:', e)
      showToast('ロードに失敗しました', 'error')
    }
  }

  async function handleDownloadEntry(entry: { id: SaveSlotId | 'autosave'; kind: 'auto' | 'manual' }) {
    try {
      const saveData = buildSaveData()
      const encoded = await encryptAndCompress(JSON.stringify(saveData))
      const payload = encoded ?? saveData
      const json = JSON.stringify(payload, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `auto-battler-save-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showToast('セーブデータをダウンロードしました', 'info')
    } catch (e) {
      console.error('ダウンロードエラー:', e)
      showToast('ダウンロードに失敗しました', 'error')
    }
  }

  function handleDeleteEntry(entry: { id: SaveSlotId | 'autosave'; kind: 'auto' | 'manual' }) {
    if (entry.kind === 'auto') {
      showToast('オートセーブは削除できません', 'error')
      return
    }
    
    if (!confirm('本当に削除しますか?')) return
    
    try {
      const raw = localStorage.getItem(SAVE_SLOTS_KEY)
      if (!raw) return
      const slots: ManualSlotEntry[] = JSON.parse(raw)
      const filtered = slots.filter(s => s.id !== entry.id)
      localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(filtered))
      refreshManualSlots()
      showToast('セーブデータを削除しました', 'info')
    } catch (e) {
      console.error('削除エラー:', e)
      showToast('削除に失敗しました', 'error')
    }
  }

  async function uploadSaveData(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const saveData = JSON.parse(text)
      let payload: SaveData | null = null

      if (saveData.data && saveData.iv) {
        const restored = await decryptAndDecompress(saveData)
        if (!restored) throw new Error('セーブデータの復号に失敗しました')
        payload = JSON.parse(restored)
      } else {
        payload = saveData as SaveData
      }
      
      if (!validateSaveData(payload)) {
        throw new Error('無効なセーブデータです')
      }
      
      applySaveData(payload)
      await saveToLocal(payload)
      refreshManualSlots()
      showSettings.value = false
      showSaveMenu.value = false
    } catch (e) {
      console.error('ロードエラー:', e)
      showToast('セーブデータの読み込みに失敗しました', 'error')
    } finally {
      target.value = ''
    }
  }

  function handleHardReset() {
    if (!confirm('すべてのデータを削除してリセットします。よろしいですか？')) return
    if (!confirm('本当によろしいですか？この操作は取り消せません。')) return
    
    try {
      localStorage.removeItem('auto-battler-save')
      localStorage.removeItem(SAVE_SLOTS_KEY)
      showToast('データをリセットしました。ページをリロードしてください。', 'info')
      setTimeout(() => window.location.reload(), 2000)
    } catch (e) {
      console.error('リセットエラー:', e)
      showToast('リセットに失敗しました', 'error')
    }
  }

  function formatTime(timestamp?: number | null): string {
    if (!timestamp) return '---'
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  return {
    showSettings,
    showSaveMenu,
    handleSaveEntry,
    handleLoadEntry,
    handleDownloadEntry,
    handleDeleteEntry,
    uploadSaveData,
    handleHardReset,
    formatTime
  }
}
