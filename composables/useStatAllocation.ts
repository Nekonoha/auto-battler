import { reactive, computed, type Ref } from 'vue'
import type { Player, PlayerAllocatedStats } from '~/types'
import { BASE_STATS } from '~/utils/playerInitialization'

const MULTIPLIERS = {
  maxHp: 25,
  attack: 5,
  magic: 5,
  defense: 3,
  magicDefense: 3,
  speed: 2,
  statusPower: 4
}

/**
 * 割り振りポイント数を計算（各ステータスが BASE_STATS からどれだけ増加しているかで判定）
 */
const calculateAllocatedPoints = (player: Player): Record<string, number> => {
  return {
    maxHp: Math.floor((player.maxHp - BASE_STATS.maxHp) / MULTIPLIERS.maxHp),
    attack: Math.floor((player.stats.attack - BASE_STATS.attack) / MULTIPLIERS.attack),
    magic: Math.floor((player.stats.magic - BASE_STATS.magic) / MULTIPLIERS.magic),
    defense: Math.floor((player.stats.defense - BASE_STATS.defense) / MULTIPLIERS.defense),
    magicDefense: Math.floor((player.stats.magicDefense - BASE_STATS.magicDefense) / MULTIPLIERS.magicDefense),
    speed: Math.floor((player.stats.speed - BASE_STATS.speed) / MULTIPLIERS.speed),
    statusPower: Math.floor((player.stats.statusPower - BASE_STATS.statusPower) / MULTIPLIERS.statusPower)
  }
}

/**
 * 総割り振りポイント数を計算
 */
const calculateTotalAllocatedPoints = (player: Player): number => {
  const points = calculateAllocatedPoints(player)
  return Object.values(points).reduce((sum, p) => sum + p, 0)
}

export function useStatAllocation(
  player: Player,
  isRunLocked: Ref<boolean>,
  allocateStat: (stat: 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed' | 'statusPower') => void,
  allocateMaxHp: () => void,
  resetAllocatedStats: (cost: number) => { ok: boolean; reason?: string },
  showToast: (message: string, type: 'info' | 'error' | 'loot') => void
) {
  // ステータス割り振り用の一時変数
  const tempStatAlloc = reactive({
    maxHp: 0,
    attack: 0,
    magic: 0,
    defense: 0,
    magicDefense: 0,
    speed: 0,
      statusPower: 0
  })

  const totalTempAlloc = computed(() => {
        return tempStatAlloc.maxHp + tempStatAlloc.attack + tempStatAlloc.magic + 
          tempStatAlloc.defense + tempStatAlloc.magicDefense + tempStatAlloc.speed + tempStatAlloc.statusPower
  })

  // 割り振り済みステータスポイント数を計算（実際の stat - BASE_STAT で判定）
  const allocatedStats = computed(() => {
    const points = calculateAllocatedPoints(player)
    return {
      maxHp: points.maxHp,
      attack: points.attack,
      magic: points.magic,
      defense: points.defense,
      magicDefense: points.magicDefense,
      speed: points.speed,
      statusPower: points.statusPower
    }
  })

  // リセットコストを計算（リセット無料）
  const calculateResetCost = () => {
    return 0
  }

  const resetTempAllocation = () => {
    tempStatAlloc.maxHp = 0
    tempStatAlloc.attack = 0
    tempStatAlloc.magic = 0
    tempStatAlloc.defense = 0
    tempStatAlloc.magicDefense = 0
    tempStatAlloc.speed = 0
    tempStatAlloc.statusPower = 0
  }

  const applyStatAllocation = () => {
    if (isRunLocked.value) {
      showToast('探索中はステータスを操作できません', 'error')
      return
    }
    
    const total = totalTempAlloc.value
    
    // 何も割り振られていないなら何もしない
    if (total === 0) {
      showToast('割り振りをしてください', 'info')
      return
    }
    
    // マイナス値は受け付けない
      if (tempStatAlloc.maxHp < 0 || tempStatAlloc.attack < 0 || 
          tempStatAlloc.magic < 0 || tempStatAlloc.defense < 0 || 
          tempStatAlloc.magicDefense < 0 || tempStatAlloc.speed < 0 || tempStatAlloc.statusPower < 0) {
      showToast('マイナス値は使用できません', 'error')
      return
    }
    
    // 現在の割り振りポイント数を計算
    const currentAllocatedPoints = calculateTotalAllocatedPoints(player)
    
    // 追加予定を含めた総割り振りポイント数
    const totalAllocatedAfter = currentAllocatedPoints + total
    
    // 最大割り振り可能ポイント（レベル × 5）
    const maxAvailablePoints = player.level * 5
    
    if (totalAllocatedAfter > maxAvailablePoints) {
      const available = maxAvailablePoints - currentAllocatedPoints
      showToast(`ポイントが不足しています（残り${available}ポイント）`, 'error')
      return
    }

    // ステータス値を直接更新
    player.maxHp += tempStatAlloc.maxHp * MULTIPLIERS.maxHp
    player.currentHp = Math.min(player.currentHp + tempStatAlloc.maxHp * MULTIPLIERS.maxHp, player.maxHp)
    player.stats.attack += tempStatAlloc.attack * MULTIPLIERS.attack
    player.stats.magic += tempStatAlloc.magic * MULTIPLIERS.magic
    player.stats.defense += tempStatAlloc.defense * MULTIPLIERS.defense
    player.stats.magicDefense += tempStatAlloc.magicDefense * MULTIPLIERS.magicDefense
    player.stats.speed += tempStatAlloc.speed * MULTIPLIERS.speed
      player.stats.statusPower += tempStatAlloc.statusPower * MULTIPLIERS.statusPower

    // 割り振り後、statPoints を正確に再計算（これが唯一の source of truth）
    const allocatedPoints = calculateTotalAllocatedPoints(player)
    player.statPoints = (player.level * 5) - allocatedPoints

    resetTempAllocation()
    showToast(`${total}ポイント割り振りました`, 'info')
  }

  const handleResetStats = () => {
    if (isRunLocked.value) {
      showToast('探索中はリセットできません', 'error')
      return
    }
    
    const cost = calculateResetCost()
    const res = resetAllocatedStats(cost)
    if (!res.ok) {
      if (res.reason === 'no-allocation') showToast('リセットする割り振りがありません', 'error')
      else if (res.reason === 'no-gold') showToast('ゴールドが不足しています', 'error')
      else showToast('リセットに失敗しました', 'error')
      return
    }
    
    // リセット後、statPoints を正確に再計算
    const allocatedPoints = calculateTotalAllocatedPoints(player)
    player.statPoints = (player.level * 5) - allocatedPoints
    
    resetTempAllocation()
    showToast('ステータスをリセットしました', 'info')
  }

  // 別名でエクスポート
  const handleReset = handleResetStats

  const resetSingleStat = (stat: 'maxHp' | 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed' | 'statusPower') => {
    if (isRunLocked.value) {
      showToast('探索中はリセットできません', 'error')
      return
    }
    
    const currentAllocated = allocatedStats.value[stat]
    
    if (currentAllocated <= 0) {
      showToast('このステータスは割り振りされていません', 'error')
      return
    }
    
    // デフォルト値に戻す
      if (stat === 'maxHp') {
        player.maxHp = BASE_STATS.maxHp
        player.currentHp = Math.min(player.currentHp, player.maxHp)
      } else {
        player.stats[stat] = BASE_STATS[stat]
      }
    
    // リセット後、statPoints を正確に再計算
    const allocatedPoints = calculateTotalAllocatedPoints(player)
    player.statPoints = (player.level * 5) - allocatedPoints
    
    showToast(`${stat}をリセットしました`, 'info')
  }

  return {
    tempStatAlloc,
    totalTempAlloc,
    allocatedStats,
    calculateResetCost,
    resetTempAllocation,
    applyStatAllocation,
    handleReset,
    resetSingleStat
  }
}
