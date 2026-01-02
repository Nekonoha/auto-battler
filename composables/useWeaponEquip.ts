import { ref, type Ref } from 'vue'
import type { Weapon, Player } from '~/types'

export function useWeaponEquip(
  player: Player,
  isRunLocked: Ref<boolean>,
  addToAvailableIfNeeded: (weapon: Weapon) => void,
  pruneAvailableWeapons: () => void
) {
  const selectedWeapon = ref<Weapon | null>(null)
  const showEquipSelection = ref(false)

  const sortWeaponsByRarity = () => {
    const rarityOrder: Record<string, number> = {
      legendary: 0,
      epic: 1,
      rare: 2,
      common: 3
    }
    player.weapons.sort((a, b) => {
      const orderA = rarityOrder[a.rarity] ?? 999
      const orderB = rarityOrder[b.rarity] ?? 999
      return orderA - orderB
    })
  }

  const equipWeapon = (weapon: Weapon, removeWeaponFn: (weapon: Weapon) => void) => {
    if (isRunLocked.value) return
    
    // すでに装備されている場合は外す
    const isEquipped = player.weapons.some(w => w.id === weapon.id)
    if (isEquipped) {
      removeWeaponFn(weapon)
      return
    }
    
    // 常に置き換えUIを表示（空きスロットも含む）
    selectedWeapon.value = weapon
    showEquipSelection.value = true
  }

  const replaceWeapon = (oldIndex: number, showToastCallback?: (msg: string, type: 'info' | 'error' | 'loot') => void) => {
    if (!selectedWeapon.value) return
    
    const oldWeapon = player.weapons[oldIndex]
    player.weapons[oldIndex] = selectedWeapon.value
    sortWeaponsByRarity()
    addToAvailableIfNeeded(oldWeapon)
    pruneAvailableWeapons()
    
    showToastCallback?.(`${oldWeapon.name}を${selectedWeapon.value.name}に置き換えました`, 'info')
    selectedWeapon.value = null
    showEquipSelection.value = false
  }

  const addWeaponToEmptySlot = (showToastCallback?: (msg: string, type: 'info' | 'error' | 'loot') => void) => {
    if (!selectedWeapon.value) return
    
    // 武器の上限チェック（4つまで）
    if (player.weapons.length >= 4) {
      showToastCallback?.('装備スロットがいっぱいです', 'error')
      selectedWeapon.value = null
      showEquipSelection.value = false
      return
    }
    
    player.weapons.push(selectedWeapon.value)
    sortWeaponsByRarity()
    pruneAvailableWeapons()
    
    showToastCallback?.(`${selectedWeapon.value.name}を装備しました`, 'info')
    selectedWeapon.value = null
    showEquipSelection.value = false
  }

  const removeWeapon = (weapon: Weapon) => {
    if (isRunLocked.value) return
    const index = player.weapons.findIndex(w => w.id === weapon.id)
    if (index !== -1) {
      player.weapons.splice(index, 1)
      addToAvailableIfNeeded(weapon)
      pruneAvailableWeapons()
    }
  }

  return {
    selectedWeapon,
    showEquipSelection,
    equipWeapon,
    replaceWeapon,
    addWeaponToEmptySlot,
    removeWeapon
  }
}
