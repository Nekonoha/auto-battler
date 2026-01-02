import type { Weapon, Player, StatusEffectType, WeaponEffect } from '~/types'
import { STATUS_EFFECTS_DB } from '~/data/statusEffects'
import type { Ref } from 'vue'

export function useDebugTools(
  player: Player,
  debugTagOptions: Ref<string[]>,
  startDebugBattle: () => void,
  showToast: (message: string, type: 'info' | 'error' | 'loot') => void
) {
  const allStatusTypes = Object.keys(STATUS_EFFECTS_DB) as StatusEffectType[]

  function buildEffects(effectInput: string): WeaponEffect[] {
    const requested = effectInput
      ? effectInput.split(',').map(e => e.trim()).filter(Boolean)
      : allStatusTypes

    const filtered = requested.filter((type): type is StatusEffectType => {
      const def = STATUS_EFFECTS_DB[type as StatusEffectType]
      return Boolean(def) && def.allowDirectApply !== false
    })

    return filtered.map(type => {
      const def = STATUS_EFFECTS_DB[type]
      const isBuff = def.type === 'Buff'
      return {
        type,
        chance: 100,
        stacks: 2,
        duration: 3,
        target: isBuff ? 'self' : 'enemy'
      }
    })
  }

  function grantDebugWeapon() {
    const name = window.prompt('武器名を入力 (省略可)', 'デバッグ武器') || 'デバッグ武器'
    const tagInput = window.prompt('付与したいタグをカンマ区切りで入力', debugTagOptions.value.join(',')) || ''
    const effectInput = window.prompt('付与したい効果タイプをカンマ区切りで入力 (省略ですべての状態異常)', '') || ''
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean)
    const effects = buildEffects(effectInput)

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
      effects,
      description: 'デバッグ用: 状態異常DBに存在する全ての効果を付与（バフは自分に付与）'
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
