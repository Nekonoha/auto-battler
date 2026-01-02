import type { Weapon, Player } from '~/types'
import type { Ref } from 'vue'

export function useDebugTools(
  player: Player,
  debugTagOptions: Ref<string[]>,
  startDebugBattle: () => void,
  showToast: (message: string, type: 'info' | 'error' | 'loot') => void
) {
  function grantDebugWeapon() {
    const name = window.prompt('武器名を入力 (省略可)', 'デバッグ武器') || 'デバッグ武器'
    const tagInput = window.prompt('付与したいタグをカンマ区切りで入力', debugTagOptions.value.join(',')) || ''
    const effectInput = window.prompt('付与したい効果タイプをカンマ区切りで入力 (例: bleed,poison)', 'bleed,poison') || ''
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean)
    const effects = effectInput.split(',').map(e => e.trim()).filter(Boolean).map(type => ({
      type,
      chance: 100,
      stacks: 2,
      duration: 3
    }))

    const weapon: Weapon = {
      id: `debug-${Date.now()}`,
      name,
      type: 'melee',
      rarity: 'legendary',
      stats: {
        attack: 9999,
        magic: 9999,
        speed: 200,
        critChance: 100,
        critDamage: 5,
        statusPower: 500
      },
      tags: (tags.length ? tags : debugTagOptions.value) as any,
      effects: effects.length ? effects as any : [{ type: 'bleed', chance: 100, stacks: 3, duration: 3 } as any],
      description: 'デバッグ用: 自由にタグ・効果を付与'
    }

    player.weapons.push(weapon)
    showToast('デバッグ武器を付与しました', 'info')
  }

  function startDebugSpar() {
    startDebugBattle()
    showToast('デバッグ敵との戦闘を開始', 'info')
  }

  return {
    grantDebugWeapon,
    startDebugSpar
  }
}
