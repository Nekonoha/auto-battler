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
    
    // マイナス値は受け付けない
    if (tempStatAlloc.maxHp < 0 || tempStatAlloc.attack < 0 || 
        tempStatAlloc.magic < 0 || tempStatAlloc.defense < 0 || 
        tempStatAlloc.magicDefense < 0 || tempStatAlloc.speed < 0) {
      showToast('マイナス値は使用できません', 'error')
      return
    }
    
    if (total > player.statPoints) {
      showToast('ポイントが不足しています', 'error')
      return
    }

    // HP割り振り
    const hpChange = tempStatAlloc.maxHp
    if (hpChange > 0) {
      for (let i = 0; i < hpChange; i++) {
        allocateMaxHp()
      }
    }
    
    // その他ステータス割り振り
    const stats: Array<'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed'> = 
      ['attack', 'magic', 'defense', 'magicDefense', 'speed']
    
    stats.forEach(stat => {
      const change = tempStatAlloc[stat]
      if (change > 0) {
        for (let i = 0; i < change; i++) {
          allocateStat(stat)
        }
      }
    })

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
    showToast('ステータスをリセットしました', 'info')
  }

  const resetSingleStat = (stat: 'maxHp' | 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed') => {
    if (isRunLocked.value) {
      showToast('探索中はリセットできません', 'error')
      return
    }
    
    const multipliers = { maxHp: 25, attack: 5, magic: 5, defense: 3, magicDefense: 3, speed: 2 }
    const multiplier = multipliers[stat]
    const currentAllocated = allocatedStats.value[stat]
    
    if (currentAllocated <= 0) {
      showToast('このステータスは割り振りされていません', 'error')
      return
    }
    
    // 割り振り分を最小値に戻す
    if (stat === 'maxHp') {
      player.maxHp = BASE_STATS.maxHp
    } else {
      player.stats[stat] = BASE_STATS[stat]
    }
    
    // SPを返却
    const pointsReturned = Math.ceil(currentAllocated / multiplier)
    player.statPoints += pointsReturned
    
    showToast(`${stat}をリセットしました（+${pointsReturned}SP）`, 'info')
  }

  return {
    tempStatAlloc,
    totalTempAlloc,
    allocatedStats,
    calculateResetCost,
    resetTempAllocation,
    applyStatAllocation,
    handleResetStats,
    resetSingleStat
  }
}
