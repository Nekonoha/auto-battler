import type { Player, Enemy } from '~/types'
import { CombatSystem } from '~/systems/CombatSystem'

/**
 * 経験値付与とレベルアップ処理を担当するコンポーザブル
 */
export function useExperience(player: Player) {
  const grantExpForEnemy = (enemy: Enemy) => {
    // プレイヤーレベルと敵レベルの差に基づいた経験値計算
    const levelDifference = player.level - enemy.level
    let expMultiplier = enemy.traits?.expMultiplier ?? 1
    
    // 敵が適正レベルを大きく下回る場合は経験値を制限
    // プレイヤーレベルの10%以上低い敵からは経験値なし
    // 5～(10%未満)レベル低い敵は経験値が30%～90%に減少
    // 4～0レベル低い敵は通常通り
    const levelThreshold = Math.floor(player.level * 0.1)
    if (levelDifference >= levelThreshold) {
      // 経験値なし
      expMultiplier = 0
      console.debug(`EXP Penalty: Enemy is ${levelDifference} levels below player (threshold: ${levelThreshold}), exp = 0`)
    } else if (levelDifference >= 5) {
      // 5レベル低い：30%、6レベル：45%、7レベル：60%、8レベル：75%、9レベル：90%
      const scalingFactor = 0.3 + (levelDifference - 5) * 0.15
      expMultiplier *= scalingFactor
      console.debug(`EXP Penalty: Enemy is ${levelDifference} levels below player, scaling factor = ${scalingFactor.toFixed(2)}`)
    } else {
      console.debug(`EXP Normal: Enemy is ${levelDifference} levels below player (or above)`)
    }
    
    const expGained = CombatSystem.calculateExpReward(enemy.level, enemy.tier, expMultiplier)
    console.debug(`EXP Granted: ${expGained} to player level ${player.level}`)
    player.exp += expGained

    let levelUps = 0
    while (player.exp >= player.nextLevelExp) {
      player.exp -= player.nextLevelExp
      player.level += 1
      levelUps += 1
      console.debug(`Level Up! New level: ${player.level}`)

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
