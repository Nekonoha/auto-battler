import { ref, watch, type Ref } from 'vue'
import type { Weapon } from '~/types'

export interface ChestDropCard {
  id: string
  weapon: Weapon
  delay: number
}

type OpenOptions = { append?: boolean }

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
    const max = Math.min(9, next)
    if (next <= 0) {
      chestOpenCount.value = 0
    } else if (chestOpenCount.value === 0) {
      chestOpenCount.value = 1
    } else {
      chestOpenCount.value = Math.min(chestOpenCount.value, max)
    }
  })

  const handleOpenChests = (
    count?: number,
    showToastCallback?: (msg: string, type: 'info' | 'error' | 'loot') => void,
    options?: OpenOptions
  ) => {
    if (!hasPendingChest.value) {
      showToastCallback?.('開封する宝箱がありません', 'error')
      return
    }

    const maxOpen = Math.min(9, chestCount.value)
    const desired = typeof count === 'number' ? count : chestOpenCount.value
    const openCount = Math.min(Math.max(1, desired), maxOpen)
    const append = options?.append === true

    if (append && chestDropCards.value.length >= 9) {
      showToastCallback?.('これ以上並べられません (最大9枚)', 'info')
      isChestOpening.value = false
      return
    }

    const capacity = append ? Math.max(0, 9 - chestDropCards.value.length) : 9
    const finalOpen = Math.min(openCount, capacity)
    if (finalOpen <= 0) {
      isChestOpening.value = false
      return
    }

    isChestOpening.value = true
    setTimeout(() => { isChestOpening.value = false }, 900)
    
    const results = openChestsFromOrchestrator(openCount)
    if (!append) {
      chestDropCards.value = []
    }
    
    const startIndex = append ? chestDropCards.value.length : 0
    results.slice(0, finalOpen).forEach((res, index) => {
      const statusLabel = res.status === 'limitbreak' ? `限界突破 +${res.level}` : res.status === 'maxed' ? 'MAX' : '入手'
      const msg = `${res.weapon.name} (${res.weapon.rarity}) を${statusLabel}`
      infoMessages.value.push(msg)
      
      const id = `${res.weapon.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`
      const delay = (startIndex + index) * 120
      
      setTimeout(() => {
        chestDropCards.value.push({ id, weapon: res.weapon, delay })
      }, delay)
    })
    
    showToastCallback?.(`${finalOpen}枚のカードを並べました！`, 'loot')
    chestOpenCount.value = chestCount.value > 0 ? Math.min(9, chestCount.value) : 0
  }

  return {
    chestOpenCount,
    isChestOpening,
    chestDropCards,
    handleOpenChests
  }
}
