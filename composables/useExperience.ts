import type { Player, Enemy } from '~/types'
import { CombatSystem } from '~/systems/CombatSystem'

/**
 * 経験値付与とレベルアップ処理を担当するコンポーザブル
 */
export function useExperience(player: Player) {
  const grantExpForEnemy = (enemy: Enemy) => {
    const expGained = CombatSystem.calculateExpReward(enemy.level, enemy.tier, enemy.traits?.expMultiplier ?? 1)
    player.exp += expGained

    let levelUps = 0
    while (player.exp >= player.nextLevelExp) {
      player.exp -= player.nextLevelExp
      player.level += 1
      levelUps += 1

      // ステータスポイント付与（デフォルト値分は含めない）
      // 獲得上限：レベル × 5
      const maxStatPoints = player.level * 5
      const currentAllocated = (player.statPoints || 0) - (player.level * 5)
      if (currentAllocated < maxStatPoints) {
        player.statPoints = (player.statPoints || 0) + 5
      }
      player.currentHp = player.maxHp

      player.nextLevelExp = CombatSystem.calculateNextLevelExp(player.level)
    }

    return { expGained, levelUps }
  }

  return { grantExpForEnemy }
}
