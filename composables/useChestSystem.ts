import { ref, watch, type Ref } from 'vue'

export interface ChestDropCard {
  id: string
  name: string
  rarity: string
  status: string
  level: number
  tier: string
  delay: number
}

export function useChestSystem(
  chestCount: Ref<number>,
  hasPendingChest: Ref<boolean>,
  infoMessages: Ref<string[]>,
  openChestsFromOrchestrator: (count: number) => Array<{ weapon: any; status: string; level: number; tier: string }>
) {
  const chestOpenCount = ref(1)
  const isChestOpening = ref(false)
  const chestDropCards = ref<ChestDropCard[]>([])

  // チェストカウントが変わったら開封数を調整
  watch(chestCount, (next) => {
    const max = Math.min(10, next)
    if (next <= 0) {
      chestOpenCount.value = 0
    } else if (chestOpenCount.value === 0) {
      chestOpenCount.value = 1
    } else {
      chestOpenCount.value = Math.min(chestOpenCount.value, max)
    }
  })

  const handleOpenChests = (count?: number, showToastCallback?: (msg: string, type: 'info' | 'error' | 'loot') => void) => {
    if (!hasPendingChest.value) {
      showToastCallback?.('開封する宝箱がありません', 'error')
      return
    }

    const maxOpen = Math.min(10, chestCount.value)
    const desired = typeof count === 'number' ? count : chestOpenCount.value
    const openCount = Math.min(Math.max(1, desired), maxOpen)

    isChestOpening.value = true
    setTimeout(() => { isChestOpening.value = false }, 900)
    
    const results = openChestsFromOrchestrator(openCount)
    chestDropCards.value = []
    
    results.forEach((res, index) => {
      const statusLabel = res.status === 'limitbreak' ? `限界突破 +${res.level}` : res.status === 'maxed' ? 'MAX' : '入手'
      const msg = `${res.weapon.name} (${res.weapon.rarity}) を${statusLabel}`
      infoMessages.value.push(msg)
      
      const id = `${res.weapon.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`
      const delay = index * 120
      
      setTimeout(() => {
        chestDropCards.value.push({
          id,
          name: res.weapon.name,
          rarity: res.weapon.rarity,
          status: statusLabel,
          level: res.level,
          tier: res.tier,
          delay
        })
      }, delay)
    })
    
    showToastCallback?.(`${openCount}個の宝箱を開封！`, 'loot')
    chestOpenCount.value = chestCount.value > 0 ? 1 : 0
  }

  return {
    chestOpenCount,
    isChestOpening,
    chestDropCards,
    handleOpenChests
  }
}
