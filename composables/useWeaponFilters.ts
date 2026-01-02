import { computed, ref } from 'vue'
import type { Weapon } from '~/types'

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
      const rarityOrder: Record<string, number> = { common: 1, rare: 2, epic: 3, legendary: 4 }
      filtered.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])
    } else if (sortBy.value === 'attack') {
      filtered.sort((a, b) => b.stats.attack - a.stats.attack)
    } else if (sortBy.value === 'magic') {
      filtered.sort((a, b) => b.stats.magic - a.stats.magic)
    } else if (sortBy.value === 'speed') {
      filtered.sort((a, b) => b.stats.speed - a.stats.speed)
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
