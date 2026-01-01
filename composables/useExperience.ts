import type { Player, Enemy } from '~/types'
import { CombatSystem } from '~/systems/CombatSystem'

/**
 * 経験値付与とレベルアップ処理を担当するコンポーザブル
 */
export function useExperience(player: Player) {
  const grantExpForEnemy = (enemy: Enemy) => {
    const expGained = CombatSystem.calculateExpReward(enemy.level, enemy.tier)
    player.exp += expGained

    let levelUps = 0
    while (player.exp >= player.nextLevelExp) {
      player.exp -= player.nextLevelExp
      player.level += 1
      levelUps += 1

      // ステータスポイント付与（自動成長は無し）
      player.statPoints = (player.statPoints || 0) + 5
      player.currentHp = player.maxHp

      player.nextLevelExp = CombatSystem.calculateNextLevelExp(player.level)
    }

    return { expGained, levelUps }
  }

  return { grantExpForEnemy }
}
