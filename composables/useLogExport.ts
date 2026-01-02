import type { Ref, ComputedRef } from 'vue'
import type { Dungeon, Player } from '~/types'

export function useLogExport(
  player: Player,
  selectedDungeon: ComputedRef<Dungeon | undefined>,
  combatLogs: Ref<any[]>,
  explorationCombatLogs: Ref<any[]>,
  dungeonLogs: Ref<any[]>,
  showToast: (message: string, type: 'info' | 'error' | 'loot') => void
) {
  function exportCombatLog() {
    try {
      const logData = {
        exportDate: new Date().toISOString(),
        playerName: player.name,
        playerLevel: player.level,
        dungeon: selectedDungeon.value?.name || 'Unknown',
        logs: combatLogs.value
      }
      
      const json = JSON.stringify(logData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `combat-log-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showToast('戦闘ログをエクスポートしました', 'info')
    } catch (e) {
      console.error('エクスポートエラー:', e)
      showToast('エクスポートに失敗しました', 'error')
    }
  }

  function exportExplorationCombatLog() {
    try {
      const logData = {
        exportDate: new Date().toISOString(),
        playerName: player.name,
        playerLevel: player.level,
        dungeon: selectedDungeon.value?.name || 'Unknown',
        battles: explorationCombatLogs.value.length,
        logs: explorationCombatLogs.value
      }

      const json = JSON.stringify(logData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `exploration-combat-log-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast('探索戦闘ログをエクスポートしました', 'info')
    } catch (e) {
      console.error('エクスポートエラー:', e)
      showToast('エクスポートに失敗しました', 'error')
    }
  }

  function exportDungeonLog() {
    try {
      const logData = {
        exportDate: new Date().toISOString(),
        playerName: player.name,
        playerLevel: player.level,
        dungeon: selectedDungeon.value?.name || 'Unknown',
        totalStages: dungeonLogs.value.length,
        logs: dungeonLogs.value
      }
      
      const json = JSON.stringify(logData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dungeon-log-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showToast('ダンジョンログをエクスポートしました', 'info')
    } catch (e) {
      console.error('エクスポートエラー:', e)
      showToast('エクスポートに失敗しました', 'error')
    }
  }

  return {
    exportCombatLog,
    exportExplorationCombatLog,
    exportDungeonLog
  }
}
