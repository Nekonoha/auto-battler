import { StatusEffectSystem } from '~/systems/StatusEffectSystem'
import { TAG_DEFINITIONS } from '~/data/synergies'

export function getWeaponRarityColor(rarity: string) {
  const colors: Record<string, string> = {
    common: '#95a5a6',
    rare: '#3a86ff',
    epic: '#8338ec',
    legendary: '#ffb800'
  }
  return colors[rarity] || '#95a5a6'
}

export function getTagDescription(tag: string) {
  return TAG_DEFINITIONS[tag as keyof typeof TAG_DEFINITIONS]?.description || ''
}

export function getStatusDescription(type: string) {
  return StatusEffectSystem.getStatusDescription(type as any)
}
