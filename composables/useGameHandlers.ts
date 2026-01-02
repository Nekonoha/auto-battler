import type { Ref, ComputedRef } from 'vue'
import type { Dungeon } from '~/types'

export function useGameHandlers(
  selectedDungeon: ComputedRef<Dungeon | undefined>,
  isDungeonUnlocked: (dungeonId: string) => boolean,
  isDungeonRunning: Ref<boolean>,
  hasPendingChest: Ref<boolean>,
  infoMessages: Ref<string[]>,
  combat: Ref<any>,
  isAutoRunning: Ref<boolean>,
  startDungeonRun: () => void,
  proceedNextBattle: () => void,
  abandonDungeon: () => void,
  startDebugBattle: () => void,
  stopAuto: () => void,
  startAuto: () => void,
  showToast: (message: string, type: 'info' | 'error' | 'loot') => void
) {
  const addInfoOnce = (msg: string) => {
    if (!infoMessages.value.includes(msg)) {
      infoMessages.value.push(msg)
    }
  }

  const remindPendingChest = () => {
    if (hasPendingChest.value) {
      addInfoOnce('宝箱を開封してください')
      return true
    }
    return false
  }

  const handleStartBattle = () => {
    const dungeon = selectedDungeon.value
    if (!dungeon) return
    if (dungeon.id === 'debug-arena') {
      startDebugBattle()
      return
    }
    if (!isDungeonUnlocked(dungeon.id)) {
      showToast('前のダンジョンをクリアして解放してください', 'error')
      return
    }
    remindPendingChest()
    startDungeonRun()
  }

  const handleNextBattle = () => {
    if (remindPendingChest()) return
    proceedNextBattle()
  }

  const toggleAuto = () => {
    if (!combat.value || combat.value.isGameOver()) return
    isAutoRunning.value ? stopAuto() : startAuto()
  }

  const handleAbandon = () => {
    if (!isDungeonRunning.value) return
    abandonDungeon()
  }

  return {
    handleStartBattle,
    handleNextBattle,
    toggleAuto,
    handleAbandon,
    addInfoOnce,
    remindPendingChest
  }
}
