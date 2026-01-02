import { ref, watch, onMounted, type Ref } from 'vue'
import type { Player, Weapon } from '~/types'
import { compressToUint8Array, decompressFromUint8Array } from '~/utils/lzString'
import { dungeons } from '~/data/dungeons'
import { clampLevel } from '~/utils/level'
import { createInitialWeapon } from '~/utils/playerInitialization'

const SAVE_KEY = 'auto-battler-save'
const SAVE_SLOTS_KEY = 'auto-battler-manual-saves'
const SAVE_VERSION = '1.1'
const SAVE_PASSPHRASE = 'auto-battler-local-key'
const SAVE_SALT = 'auto-battler-salt'
const SAVE_ITERATIONS = 120000
const AES_PARAMS = { name: 'AES-GCM', length: 256 }

interface StoredSave {
  version: string
  algo: 'AES-GCM'
  iv: string
  data: string
  compressed: boolean
  createdAt: number
}

interface StoredSaveEnvelope {
  encoded?: StoredSave
  raw?: SaveData
}

export type SaveSlotId = 'slot1' | 'slot2'

export interface ManualSlotEntry {
  id: SaveSlotId
  label: string
  savedAt: number | null
  envelope?: StoredSaveEnvelope
}

export interface SaveData {
  version: string
  timestamp: number
  player: Player
  availableWeapons: Weapon[]
  selectedDungeonId: string
  currentLevel: number
  combatLogs: any[]
  explorationCombatLogs: any[]
  dungeonLogs: any[]
}

export function useSaveSystem(
  player: Player,
  availableWeapons: Ref<Weapon[]>,
  selectedDungeonId: Ref<string>,
  currentLevel: Ref<number>,
  combatLogs: Ref<any[]>,
  explorationCombatLogs: Ref<any[]>,
  dungeonLogs: Ref<any[]>,
  dungeonOptions: any,
  showToast: (message: string, type: 'info' | 'error' | 'loot') => void
) {
  let isRestoring = false
  const autosaveMeta = ref<{ savedAt: number }>({ savedAt: 0 })
  const saveEntries = ref<Array<{ id: SaveSlotId | 'autosave'; kind: 'auto' | 'manual'; label: string; savedAt: number | null }>>([])

  // 暗号化ユーティリティ
  const toBase64 = (bytes: Uint8Array) => {
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    return btoa(binary)
  }

  const fromBase64 = (base64: string) => {
    const binary = atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  const isCryptoAvailable = () => typeof window !== 'undefined' && !!window.crypto?.subtle

  const deriveKey = async () => {
    if (!isCryptoAvailable()) return null
    const encoder = new TextEncoder()
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SAVE_PASSPHRASE),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(SAVE_SALT),
        iterations: SAVE_ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      AES_PARAMS,
      false,
      ['encrypt', 'decrypt']
    )
  }

  const encryptAndCompress = async (plaintext: string): Promise<StoredSave | null> => {
    try {
      const compressed = compressToUint8Array(plaintext)
      const key = await deriveKey()
      if (!key) return null
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const cipher = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new Uint8Array(compressed)
      )
      return {
        version: SAVE_VERSION,
        algo: 'AES-GCM',
        iv: toBase64(iv),
        data: toBase64(new Uint8Array(cipher)),
        compressed: true,
        createdAt: Date.now()
      }
    } catch (e) {
      console.error('暗号化エラー:', e)
      return null
    }
  }

  const decryptAndDecompress = async (payload: StoredSave): Promise<string | null> => {
    try {
      const key = await deriveKey()
      if (!key) return null
      const iv = fromBase64(payload.iv)
      const cipherBytes = fromBase64(payload.data)
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        cipherBytes
      )
      const plainBytes = new Uint8Array(decrypted)
      return decompressFromUint8Array(plainBytes)
    } catch (e) {
      console.error('復号エラー:', e)
      return null
    }
  }

  const buildSaveData = (): SaveData => {
    const requestedId = selectedDungeonId.value || dungeonOptions.value[0]?.id || ''
    const unlockedSet = new Set(Array.isArray(player.unlockedDungeons) && player.unlockedDungeons.length > 0 ? player.unlockedDungeons : ['tutorial-field'])
    const dungeonId = requestedId === 'debug-arena'
      ? requestedId
      : unlockedSet.has(requestedId) ? requestedId : (Array.from(unlockedSet)[0] ?? dungeons[0]?.id ?? '')
    const dungeon = dungeonOptions.value.find((d: any) => d.id === dungeonId)
    const safeLevel = clampLevel(currentLevel.value, dungeon)

    return {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      player: JSON.parse(JSON.stringify(player)),
      availableWeapons: JSON.parse(JSON.stringify(availableWeapons.value)),
      selectedDungeonId: dungeonId,
      currentLevel: safeLevel,
      combatLogs: JSON.parse(JSON.stringify(combatLogs.value)),
      explorationCombatLogs: JSON.parse(JSON.stringify(explorationCombatLogs.value)),
      dungeonLogs: JSON.parse(JSON.stringify(dungeonLogs.value))
    }
  }

  const buildEnvelope = async (data?: SaveData): Promise<StoredSaveEnvelope> => {
    const payload = data ?? buildSaveData()
    const envelope: StoredSaveEnvelope = { raw: payload }
    const encoded = await encryptAndCompress(JSON.stringify(payload))
    if (encoded) envelope.encoded = encoded
    return envelope
  }

  const validateSaveData = (data: any): data is SaveData => {
    return !!data
      && typeof data === 'object'
      && typeof data.player === 'object'
      && Array.isArray(data.availableWeapons)
      && typeof data.selectedDungeonId === 'string'
      && typeof data.currentLevel === 'number'
      && Array.isArray(data.combatLogs ?? [])
      && Array.isArray(data.explorationCombatLogs ?? [])
      && Array.isArray(data.dungeonLogs ?? [])
  }

  const applySaveData = (data: SaveData, opts: { silent?: boolean } = {}) => {
    const initialWeapon = createInitialWeapon()
    const restoredPlayer = data.player ?? {}
    const unlockedList = Array.isArray(restoredPlayer.unlockedDungeons) && restoredPlayer.unlockedDungeons.length > 0
      ? restoredPlayer.unlockedDungeons
      : (Array.isArray(player.unlockedDungeons) && player.unlockedDungeons.length > 0 ? player.unlockedDungeons : ['tutorial-field'])

    Object.assign(player, {
      ...player,
      ...restoredPlayer,
      stats: { ...player.stats, ...(restoredPlayer.stats ?? {}) },
      allocatedStats: { ...player.allocatedStats, ...(restoredPlayer.allocatedStats ?? {}) },
      unlockedDungeons: unlockedList,
      weapons: Array.isArray(restoredPlayer.weapons) && restoredPlayer.weapons.length > 0 ? restoredPlayer.weapons : player.weapons,
      statusEffects: restoredPlayer.statusEffects ?? []
    })

    const unlockedSet = new Set(player.unlockedDungeons)
    const fallbackDungeonId = unlockedSet.size > 0 ? Array.from(unlockedSet)[0] : (dungeonOptions.value[0]?.id ?? '')
    const requestedDungeon = dungeonOptions.value.find((d: any) => d.id === data.selectedDungeonId) ?? dungeonOptions.value[0]
    const dungeonId = requestedDungeon && (requestedDungeon.id === 'debug-arena' || unlockedSet.has(requestedDungeon.id)) ? requestedDungeon.id : fallbackDungeonId
    const dungeon = dungeonOptions.value.find((d: any) => d.id === dungeonId) ?? dungeonOptions.value[0]
    const safeLevel = clampLevel(data.currentLevel ?? dungeon?.levelRange?.[0] ?? 1, dungeon)

    if (!player.weapons.length) player.weapons.push(initialWeapon)
    player.currentHp = Math.min(player.currentHp, player.maxHp)

    availableWeapons.value = Array.isArray(data.availableWeapons) ? (data.availableWeapons as any) : []
    combatLogs.value = Array.isArray(data.combatLogs) ? data.combatLogs : []
    explorationCombatLogs.value = Array.isArray(data.explorationCombatLogs) ? data.explorationCombatLogs : []
    dungeonLogs.value = Array.isArray(data.dungeonLogs) ? data.dungeonLogs : []

    isRestoring = true
    selectedDungeonId.value = dungeonId
    currentLevel.value = safeLevel
    isRestoring = false

    if (!opts.silent) {
      showToast('セーブデータを読み込みました', 'info')
    }
  }

  const saveToLocal = async (payload?: SaveData) => {
    if (typeof window === 'undefined') return
    if (isRestoring) return
    const data = payload ?? buildSaveData()
    const envelope = await buildEnvelope(data)
    localStorage.setItem(SAVE_KEY, JSON.stringify(envelope))
    autosaveMeta.value = { savedAt: data.timestamp }
  }

  const loadFromLocal = async (opts: { silent?: boolean } = { silent: true }) => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as StoredSaveEnvelope | StoredSave | SaveData
      let payload: SaveData | null = null

      if ((parsed as StoredSaveEnvelope).encoded || (parsed as StoredSaveEnvelope).raw) {
        const envelope = parsed as StoredSaveEnvelope
        if (envelope.encoded) {
          const decrypted = await decryptAndDecompress(envelope.encoded)
          if (decrypted) payload = JSON.parse(decrypted)
        }
        if (!payload && envelope.raw) {
          payload = envelope.raw
        }
      } else if ((parsed as StoredSave).data && (parsed as StoredSave).iv) {
        const decrypted = await decryptAndDecompress(parsed as StoredSave)
        if (decrypted) payload = JSON.parse(decrypted)
      } else {
        payload = parsed as SaveData
      }

      if (!validateSaveData(payload)) {
        throw new Error('無効なセーブデータです')
      }
      applySaveData(payload, { silent: opts.silent })
      autosaveMeta.value = { savedAt: payload.timestamp }
    } catch (e) {
      console.error('ロードエラー:', e)
      showToast('セーブデータの読み込みに失敗しました', 'error')
    }
  }

  const refreshManualSlots = () => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(SAVE_SLOTS_KEY)
    const slots: ManualSlotEntry[] = raw ? JSON.parse(raw) : []
    const slotMap = new Map(slots.map(s => [s.id, s]))
    
    const entries: Array<{ id: SaveSlotId | 'autosave'; kind: 'auto' | 'manual'; label: string; savedAt: number | null }> = [
      { id: 'autosave', kind: 'auto' as const, label: 'オートセーブ', savedAt: autosaveMeta.value.savedAt }
    ];
    
    (['slot1', 'slot2'] as SaveSlotId[]).forEach(id => {
      const slot = slotMap.get(id)
      entries.push({
        id,
        kind: 'manual' as const,
        label: slot?.label ?? 'スロット',
        savedAt: slot?.savedAt ?? null
      })
    })
    
    saveEntries.value = entries
  }

  // 初期化と自動セーブ
  onMounted(() => {
    loadFromLocal()
    refreshManualSlots()
  })

  watch(
    [player, availableWeapons, selectedDungeonId, currentLevel, combatLogs, explorationCombatLogs, dungeonLogs],
    () => { saveToLocal().catch(err => console.error('自動セーブ失敗:', err)) },
    { deep: true }
  )

  return {
    autosaveMeta,
    saveEntries,
    buildSaveData,
    buildEnvelope,
    validateSaveData,
    applySaveData,
    saveToLocal,
    loadFromLocal,
    refreshManualSlots,
    encryptAndCompress,
    decryptAndDecompress
  }
}
