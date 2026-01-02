import { reactive, computed, type Ref } from 'vue'
import type { Player } from '~/types'
import { BASE_STATS } from '~/utils/playerInitialization'

export function useStatAllocation(
  player: Player,
  isRunLocked: Ref<boolean>,
  allocateStat: (stat: 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed') => void,
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
    speed: 0
  })

  const totalTempAlloc = computed(() => {
    return tempStatAlloc.maxHp + tempStatAlloc.attack + tempStatAlloc.magic + 
           tempStatAlloc.defense + tempStatAlloc.magicDefense + tempStatAlloc.speed
  })

  // 割り振り済みステータスポイント数を計算
  const allocatedStats = computed(() => {
    return {
      maxHp: player.maxHp - BASE_STATS.maxHp,
      attack: player.stats.attack - BASE_STATS.attack,
      magic: player.stats.magic - BASE_STATS.magic,
      defense: player.stats.defense - BASE_STATS.defense,
      magicDefense: player.stats.magicDefense - BASE_STATS.magicDefense,
      speed: player.stats.speed - BASE_STATS.speed
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
  }

  const applyStatAllocation = () => {
    if (isRunLocked.value) {
      showToast('探索中はステータスを操作できません', 'error')
      return
    }
    
    const total = totalTempAlloc.value
    if (total === 0) return
    
    // マイナス値は受け付けない
    if (tempStatAlloc.maxHp < 0 || tempStatAlloc.attack < 0 || 
        tempStatAlloc.magic < 0 || tempStatAlloc.defense < 0 || 
        tempStatAlloc.magicDefense < 0 || tempStatAlloc.speed < 0) {
      showToast('マイナス値は使用できません', 'error')
      return
    }
    
    // 現在の割り振りポイント数を計算
    const multipliers = { maxHp: 25, attack: 5, magic: 5, defense: 3, magicDefense: 3, speed: 2 }
    const currentAllocatedPoints = 
      Math.floor((player.maxHp - BASE_STATS.maxHp) / multipliers.maxHp) +
      Math.floor((player.stats.attack - BASE_STATS.attack) / multipliers.attack) +
      Math.floor((player.stats.magic - BASE_STATS.magic) / multipliers.magic) +
      Math.floor((player.stats.defense - BASE_STATS.defense) / multipliers.defense) +
      Math.floor((player.stats.magicDefense - BASE_STATS.magicDefense) / multipliers.magicDefense) +
      Math.floor((player.stats.speed - BASE_STATS.speed) / multipliers.speed)
    
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
    player.maxHp += tempStatAlloc.maxHp * multipliers.maxHp
    player.currentHp = Math.min(player.currentHp + tempStatAlloc.maxHp * multipliers.maxHp, player.maxHp)
    player.stats.attack += tempStatAlloc.attack * multipliers.attack
    player.stats.magic += tempStatAlloc.magic * multipliers.magic
    player.stats.defense += tempStatAlloc.defense * multipliers.defense
    player.stats.magicDefense += tempStatAlloc.magicDefense * multipliers.magicDefense
    player.stats.speed += tempStatAlloc.speed * multipliers.speed

    // allocations オブジェクトも更新
    const allocations = useGameOrchestrator().ensureAllocations()
    allocations.maxHp += tempStatAlloc.maxHp
    allocations.attack += tempStatAlloc.attack
    allocations.magic += tempStatAlloc.magic
    allocations.defense += tempStatAlloc.defense
    allocations.magicDefense += tempStatAlloc.magicDefense
    allocations.speed += tempStatAlloc.speed

    // 割り振り後、statPoints を正確に再計算（これが唯一の source of truth）
    const allocatedPoints = 
      Math.floor((player.maxHp - BASE_STATS.maxHp) / multipliers.maxHp) +
      Math.floor((player.stats.attack - BASE_STATS.attack) / multipliers.attack) +
      Math.floor((player.stats.magic - BASE_STATS.magic) / multipliers.magic) +
      Math.floor((player.stats.defense - BASE_STATS.defense) / multipliers.defense) +
      Math.floor((player.stats.magicDefense - BASE_STATS.magicDefense) / multipliers.magicDefense) +
      Math.floor((player.stats.speed - BASE_STATS.speed) / multipliers.speed)
    player.statPoints = (player.level * 5) - allocatedPoints

    resetTempAllocation()
    if (total > 0) {
      showToast(`${total}ポイント割り振りました`, 'info')
    }
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
    const multipliers = { maxHp: 25, attack: 5, magic: 5, defense: 3, magicDefense: 3, speed: 2 }
    const allocatedPoints = 
      Math.floor((player.maxHp - BASE_STATS.maxHp) / multipliers.maxHp) +
      Math.floor((player.stats.attack - BASE_STATS.attack) / multipliers.attack) +
      Math.floor((player.stats.magic - BASE_STATS.magic) / multipliers.magic) +
      Math.floor((player.stats.defense - BASE_STATS.defense) / multipliers.defense) +
      Math.floor((player.stats.magicDefense - BASE_STATS.magicDefense) / multipliers.magicDefense) +
      Math.floor((player.stats.speed - BASE_STATS.speed) / multipliers.speed)
    player.statPoints = (player.level * 5) - allocatedPoints
    
    resetTempAllocation()
    showToast('ステータスをリセットしました', 'info')
  }

  // 別名でエクスポート
  const handleReset = handleResetStats

  const resetSingleStat = (stat: 'maxHp' | 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed') => {
    if (isRunLocked.value) {
      showToast('探索中はリセットできません', 'error')
      return
    }
    
    const multipliers = { maxHp: 25, attack: 5, magic: 5, defense: 3, magicDefense: 3, speed: 2 }
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
    
    // allocations オブジェクトをリセット
    const allocations = useGameOrchestrator().ensureAllocations()
    allocations[stat] = 0
    
    // リセット後、statPoints を正確に再計算
    const allMultipliers = { maxHp: 25, attack: 5, magic: 5, defense: 3, magicDefense: 3, speed: 2 }
    const allocatedPoints = 
      Math.floor((player.maxHp - BASE_STATS.maxHp) / allMultipliers.maxHp) +
      Math.floor((player.stats.attack - BASE_STATS.attack) / allMultipliers.attack) +
      Math.floor((player.stats.magic - BASE_STATS.magic) / allMultipliers.magic) +
      Math.floor((player.stats.defense - BASE_STATS.defense) / allMultipliers.defense) +
      Math.floor((player.stats.magicDefense - BASE_STATS.magicDefense) / allMultipliers.magicDefense) +
      Math.floor((player.stats.speed - BASE_STATS.speed) / allMultipliers.speed)
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
