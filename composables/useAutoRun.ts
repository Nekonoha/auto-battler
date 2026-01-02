/**
 * オートラン・戦闘速度制御コンポーザブル
 * 
 * 責務:
 * - オートランの開始・停止
 * - 戦闘速度の制御
 * - ターンの自動実行ループ
 */

import { ref, type Ref } from 'vue'
import type { CombatSystem } from '~/systems/CombatSystem'

// BattleSpeed 型定義をここで一元管理
export type BattleSpeed = 1 | 2 | 4

export interface AutoRunCallbacks {
  onTurnComplete?: () => void
  onBattleComplete?: () => void
  onBattleFailed?: () => void
}

export function useAutoRun(
  combat: Ref<CombatSystem | null>,
  runTurn: (callback: () => void) => void,
  callbacks: AutoRunCallbacks = {}
) {
  const isAutoRunning = ref(false)
  const battleSpeed = ref<BattleSpeed>(1)
  let loopHandle: any = null

  const changeSpeed = (speed: number | BattleSpeed) => {
    const validSpeeds: BattleSpeed[] = [1, 2, 4]
    const speedNum = Number(speed) as BattleSpeed
    if (validSpeeds.includes(speedNum)) {
      battleSpeed.value = speedNum
      // 既に実行中なら間隔を変更
      if (isAutoRunning.value && loopHandle) {
        stopAuto()
        startAuto()
      }
    }
  }

  const autoLoop = () => {
    if (!combat.value || combat.value.isGameOver()) {
      stopAuto()
      return
    }

    runTurn(() => {
      callbacks.onTurnComplete?.()
    })

    if (combat.value?.isGameOver()) {
      callbacks.onBattleComplete?.()
    }
  }

  const startAuto = () => {
    if (isAutoRunning.value) return
    isAutoRunning.value = true
    const interval = 800 / battleSpeed.value
    loopHandle = setInterval(autoLoop, interval)
  }

  const stopAuto = () => {
    if (loopHandle) {
      clearInterval(loopHandle)
      loopHandle = null
    }
    isAutoRunning.value = false
  }

  return {
    isAutoRunning,
    battleSpeed,
    changeSpeed,
    startAuto,
    stopAuto
  }
}
