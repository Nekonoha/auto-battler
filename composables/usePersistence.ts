/**
 * localStorage ベースの永続化層
 * サーバレス・スタンドアロン対応
 * 
 * 既存の useSaveSystem と連携し、
 * localStorage をバックエンドとして使用
 */

import type { Player, Weapon } from '~/types'

export interface GameState {
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

export interface SaveProfile {
  id: string
  name: string
  timestamp: number
  data: GameState
}

const STORAGE_PREFIX = 'autobattler'
const AUTOSAVE_KEY = `${STORAGE_PREFIX}-autosave`
const PROFILES_KEY = `${STORAGE_PREFIX}-profiles-index`
const PROFILE_DATA_KEY = (id: string) => `${STORAGE_PREFIX}-profile-${id}`

/**
 * localStorage ベースのゲームセーブ管理
 */
export function usePersistence() {
  /**
   * ゲーム状態をオートセーブする
   * @param state - セーブするゲーム状態
   */
  const autosave = (state: GameState): boolean => {
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state))
      return true
    } catch (error) {
      console.error('Autosave failed:', error)
      return false
    }
  }

  /**
   * オートセーブからロードする
   * @returns ゲーム状態、またはオートセーブが存在しない場合は null
   */
  const loadAutosave = (): GameState | null => {
    try {
      const data = localStorage.getItem(AUTOSAVE_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Autosave load failed:', error)
      return null
    }
  }

  /**
   * 指定プロフィールにセーブする
   * @param profileId - プロフィールID
   * @param profileName - プロフィール名
   * @param state - セーブするゲーム状態
   */
  const saveProfile = (profileId: string, profileName: string, state: GameState): boolean => {
    try {
      const data: GameState = {
        ...state,
        timestamp: Date.now()
      }
      
      localStorage.setItem(PROFILE_DATA_KEY(profileId), JSON.stringify(data))

      // プロフィールインデックスを更新
      const index = loadProfileIndex()
      const existingIndex = index.findIndex(p => p.id === profileId)

      if (existingIndex >= 0) {
        index[existingIndex] = {
          id: profileId,
          name: profileName,
          timestamp: data.timestamp
        }
      } else {
        index.push({
          id: profileId,
          name: profileName,
          timestamp: data.timestamp
        })
      }

      localStorage.setItem(PROFILES_KEY, JSON.stringify(index))
      return true
    } catch (error) {
      console.error('Profile save failed:', error)
      return false
    }
  }

  /**
   * 指定プロフィールをロードする
   * @param profileId - プロフィールID
   */
  const loadProfile = (profileId: string): GameState | null => {
    try {
      const data = localStorage.getItem(PROFILE_DATA_KEY(profileId))
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Profile load failed:', error)
      return null
    }
  }

  /**
   * 全プロフィール一覧をロード
   */
  const loadProfileIndex = (): Array<{ id: string; name: string; timestamp: number }> => {
    try {
      const data = localStorage.getItem(PROFILES_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Profile index load failed:', error)
      return []
    }
  }

  /**
   * 指定プロフィールを削除する
   * @param profileId - プロフィールID
   */
  const deleteProfile = (profileId: string): boolean => {
    try {
      localStorage.removeItem(PROFILE_DATA_KEY(profileId))
      
      // インデックスから削除
      const index = loadProfileIndex()
      const filtered = index.filter(p => p.id !== profileId)
      localStorage.setItem(PROFILES_KEY, JSON.stringify(filtered))
      
      return true
    } catch (error) {
      console.error('Profile delete failed:', error)
      return false
    }
  }

  /**
   * 全プロフィール一覧を取得
   */
  const listProfiles = (): SaveProfile[] => {
    const index = loadProfileIndex()
    return index
      .map(meta => {
        const data = loadProfile(meta.id)
        return data ? { ...meta, data } : null
      })
      .filter((p): p is SaveProfile => p !== null)
  }

  /**
   * localStorage の利用可能性を確認
   */
  const isAvailable = (): boolean => {
    try {
      const test = `${STORAGE_PREFIX}-test-${Date.now()}`
      localStorage.setItem(test, 'test')
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * localStorage の利用可能容量を推定（バイト）
   * @returns 推定利用可能容量（バイト）
   */
  const getAvailableSpace = (): number => {
    try {
      const test = new Array(1024 * 1024).join('x') // 約1MB
      const key = `${STORAGE_PREFIX}-space-test`
      localStorage.setItem(key, test)
      localStorage.removeItem(key)
      return 5 * 1024 * 1024 // 5MB (typical browser limit)
    } catch {
      return 0
    }
  }

  /**
   * 全てのセーブデータをエクスポート
   */
  const exportAll = (): string => {
    const profiles = listProfiles()
    const autosave = loadAutosave()
    
    return JSON.stringify({
      exported: Date.now(),
      autosave,
      profiles
    }, null, 2)
  }

  /**
   * エクスポートしたデータをインポート
   */
  const importAll = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.autosave) {
        autosave(data.autosave)
      }
      
      if (Array.isArray(data.profiles)) {
        data.profiles.forEach((profile: SaveProfile) => {
          saveProfile(profile.id, profile.name, profile.data)
        })
      }
      
      return true
    } catch (error) {
      console.error('Import failed:', error)
      return false
    }
  }

  /**
   * 全てのセーブデータをクリア
   */
  const clearAll = (): boolean => {
    try {
      const index = loadProfileIndex()
      index.forEach(profile => {
        localStorage.removeItem(PROFILE_DATA_KEY(profile.id))
      })
      localStorage.removeItem(PROFILES_KEY)
      localStorage.removeItem(AUTOSAVE_KEY)
      return true
    } catch (error) {
      console.error('Clear failed:', error)
      return false
    }
  }

  return {
    autosave,
    loadAutosave,
    saveProfile,
    loadProfile,
    loadProfileIndex,
    deleteProfile,
    listProfiles,
    isAvailable,
    getAvailableSpace,
    exportAll,
    importAll,
    clearAll
  }
}
