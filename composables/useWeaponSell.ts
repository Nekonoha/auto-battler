import { ref, type Ref } from 'vue'
import type { Weapon, Player } from '~/types'

export function useWeaponSell(
  player: Player,
  availableWeapons: Ref<Weapon[]>,
  initialWeaponId: string,
  showToast: (message: string, type: 'info' | 'error' | 'loot') => void
) {
  const showSellMenu = ref(false)
  const selectedSellWeapons = ref<Set<string>>(new Set())

  function canSellWeapon(weapon: Weapon): boolean {
    // 初期装備は売却不可
    if (weapon.id === initialWeaponId) return false
    // 装備中の武器は売却不可
    if (player.weapons.some(w => w.id === weapon.id)) return false
    return true
  }

  function toggleSelectWeapon(weaponId: string) {
    if (selectedSellWeapons.value.has(weaponId)) {
      selectedSellWeapons.value.delete(weaponId)
    } else {
      selectedSellWeapons.value.add(weaponId)
    }
  }

  function sellSelectedWeapons() {
    let totalGold = 0
    const weaponsToRemove: string[] = []
    
    availableWeapons.value.forEach(weapon => {
      if (selectedSellWeapons.value.has(weapon.id)) {
        const sellValue = (weapon as any).sellValue || 10
        totalGold += sellValue
        weaponsToRemove.push(weapon.id)
      }
    })
    
    // 武器を削除
    availableWeapons.value = availableWeapons.value.filter(
      w => !weaponsToRemove.includes(w.id)
    )
    
    player.gold += totalGold
    selectedSellWeapons.value.clear()
    showSellMenu.value = false
    
    showToast(`${weaponsToRemove.length}個の武器を${totalGold}Gで売却しました`, 'info')
  }

  return {
    showSellMenu,
    selectedSellWeapons,
    canSellWeapon,
    toggleSelectWeapon,
    sellSelectedWeapons
  }
}
