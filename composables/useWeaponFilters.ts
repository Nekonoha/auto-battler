import { computed, ref } from 'vue'
import type { Weapon } from '~/types'
import { WeaponSystem } from '~/systems/WeaponSystem'

export function useWeaponFilters(availableWeapons: { value: Weapon[] }) {
  const rarityFilter = ref<string>('all')
  const typeFilter = ref<string>('all')
  const selectedTags = ref<string[]>([])
  const selectedEffects = ref<string[]>([])
  const sortBy = ref<string>('rarity')

  const availableTags = computed(() => {
    const allTags = new Set<string>()
    availableWeapons.value.forEach(w => {
      w.tags.forEach(t => allTags.add(t))
    })
    return Array.from(allTags).sort()
  })

  const availableEffects = computed(() => {
    const allEffects = new Set<string>()
    availableWeapons.value.forEach(w => {
      w.effects.forEach(e => allEffects.add(e.type))
    })
    return Array.from(allEffects).sort()
  })

  const filteredWeapons = computed(() => {
    let filtered = availableWeapons.value
    const indexMap = new Map<string, number>()
    availableWeapons.value.forEach((w, idx) => indexMap.set(w.id, idx))

    if (rarityFilter.value !== 'all') {
      filtered = filtered.filter(w => w.rarity === rarityFilter.value)
    }

    if (typeFilter.value !== 'all') {
      filtered = filtered.filter(w => w.type === typeFilter.value)
    }

    if (selectedTags.value.length > 0) {
      filtered = filtered.filter(w => 
        selectedTags.value.some(tag => w.tags.includes(tag as any))
      )
    }

    if (selectedEffects.value.length > 0) {
      filtered = filtered.filter(w => 
        selectedEffects.value.some(effect => w.effects.some(e => e.type === effect))
      )
    }

    filtered = [...filtered]
    if (sortBy.value === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
    } else if (sortBy.value === 'rarity') {
      const getRarityValue = (rarity: string): number => {
        if (rarity === 'common') return 1
        if (rarity === 'rare') return 2
        if (rarity === 'epic') return 3
        if (rarity === 'legendary') return 4
        // mythic, mythic+, mythic++, etc.
        if (rarity.startsWith('mythic')) {
          const suffix = rarity.slice(6) // 'mythic' の後の部分
          const level = suffix ? suffix.split('+').length : 1
          return 5 + level - 1 // mythic=5, mythic+=6, mythic++=7, ...
        }
        return 0 // 未知のレア度
      }
      filtered.sort((a, b) => getRarityValue(b.rarity) - getRarityValue(a.rarity))
    } else if (sortBy.value === 'attack') {
      filtered.sort((a, b) => b.stats.attack - a.stats.attack)
    } else if (sortBy.value === 'magic') {
      filtered.sort((a, b) => b.stats.magic - a.stats.magic)
    } else if (sortBy.value === 'speed') {
      filtered.sort((a, b) => b.stats.speed - a.stats.speed)
    } else if (sortBy.value === 'critChance') {
      filtered.sort((a, b) => b.stats.critChance - a.stats.critChance)
    } else if (sortBy.value === 'critDamage') {
      filtered.sort((a, b) => b.stats.critDamage - a.stats.critDamage)
    } else if (sortBy.value === 'statusPower') {
      filtered.sort((a, b) => b.stats.statusPower - a.stats.statusPower)
    } else if (sortBy.value === 'rating') {
      filtered.sort((a, b) => WeaponSystem.evaluateWeapon(b) - WeaponSystem.evaluateWeapon(a))
    } else if (sortBy.value === 'acquired') {
      filtered.sort((a, b) => (indexMap.get(b.id) ?? 0) - (indexMap.get(a.id) ?? 0))
    }

    return filtered
  })

  return {
    rarityFilter,
    typeFilter,
    selectedTags,
    selectedEffects,
    sortBy,
    availableTags,
    availableEffects,
    filteredWeapons
  }
}
