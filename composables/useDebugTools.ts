import type { Weapon, Player, StatusEffectType, WeaponEffect } from '~/types'
import { STATUS_EFFECTS_DB } from '~/data/statusEffects'
import type { Ref } from 'vue'

export function useDebugTools(
  player: Player,
  debugTagOptions: Ref<string[]>,
  startDebugBattle: (templateId?: string) => void,
  showToast: (message: string, type: 'info' | 'error' | 'loot') => void
) {
  const weakDebugStats: Weapon['stats'] = {
    attack: 1,
    magic: 1,
    speed: 1,
    critChance: 0,
    critDamage: 1,
    statusPower: 0
  }

  const maxedStatsByType: Record<Weapon['type'], Weapon['stats']> = {
    melee: { attack: 9999, magic: 100, speed: 200, critChance: 100, critDamage: 5, statusPower: 500 },
    ranged: { attack: 6000, magic: 100, speed: 260, critChance: 100, critDamage: 4.5, statusPower: 500 },
    magic: { attack: 100, magic: 9999, speed: 220, critChance: 100, critDamage: 4, statusPower: 500 }
  }

  function buildEffects(effectInput: string): WeaponEffect[] {
    // 明示入力がないときは何も付与しない（全付与は危険なのでやめる）
    const requested = effectInput
      ? effectInput.split(',').map(e => e.trim()).filter(Boolean)
      : []

    const filtered = requested.filter((type): type is StatusEffectType => {
      const def = STATUS_EFFECTS_DB[type as StatusEffectType]
      // allowDirectApply === false のみ除外（子エフェクト）
      return Boolean(def) && def.allowDirectApply !== false
    })

    const effects = filtered.map(type => {
      const def = STATUS_EFFECTS_DB[type]
      const isBuff = def.type === 'Buff'
      return {
        type,
        chance: 100,
        stacks: 1,
        duration: 3,
        target: isBuff ? 'self' : 'enemy'
      }
    })

    // 同じ効果が複数指定された場合は合成（stacks合算、durationは最大、chanceは最大100で上限）
    const merged: WeaponEffect[] = []
    for (const eff of effects) {
      const existing = merged.find(e => e.type === eff.type && e.target === eff.target)
      if (existing) {
        existing.stacks += eff.stacks
        existing.duration = Math.max(existing.duration, eff.duration)
        existing.chance = Math.min(100, Math.max(existing.chance, eff.chance))
      } else {
        merged.push({ ...eff })
      }
    }

    return merged
  }

  function createStatusPreset(defId: StatusEffectType): Weapon {
    const def = STATUS_EFFECTS_DB[defId]
    const isBuff = def.type === 'Buff'
    return {
      id: `debug-status-${defId}`,
      name: `[弱] ${def.name}`,
      type: 'melee',
      rarity: 'common',
      stats: { ...weakDebugStats },
      tags: [],
      effects: [{
        type: defId,
        chance: 100,
        stacks: 1,
        duration: Math.min(def.maxDuration ?? 3, 3),
        target: isBuff ? 'self' : 'enemy'
      }],
      description: `デバッグ用: ${def.name} を簡単に付与する弱武器`
    }
  }

  function createMaxedPreset(type: Weapon['type']): Weapon {
    return {
      id: `debug-max-${type}`,
      name: `[MAX] ${type.toUpperCase()} デバッグ武器`,
      type,
      rarity: 'legendary',
      stats: { ...maxedStatsByType[type] },
      tags: debugTagOptions.value as any,
      effects: [],
      description: 'デバッグ用: ステータスカンスト武器'
    }
  }

  function getPresetWeapons(): { id: string; label: string; weapon: Weapon }[] {
    const directStatusDefs = Object.values(STATUS_EFFECTS_DB).filter(def => def.allowDirectApply !== false)
    const statusPresets = directStatusDefs.map(def => ({ id: def.id, label: `弱ステ ${def.name} (${def.type})`, weapon: createStatusPreset(def.id) }))
    const maxPresets: { id: string; label: string; weapon: Weapon }[] = ['melee', 'ranged', 'magic'].map(type => ({
      id: `max-${type}`,
      label: `MAX ${type.toUpperCase()} 武器`,
      weapon: createMaxedPreset(type as Weapon['type'])
    }))
    return [...statusPresets, ...maxPresets]
  }

  const presetWeapons = getPresetWeapons()

  function cloneWithNewId(base: Weapon): Weapon {
    return {
      ...base,
      id: `${base.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stats: { ...base.stats },
      tags: [...base.tags],
      effects: base.effects.map(e => ({ ...e }))
    }
  }

  function grantPresetWeaponById(presetId?: string) {
    if (!presetId) {
      grantCustomDebugWeapon()
      return
    }

    const preset = presetWeapons.find(p => p.id === presetId)
    if (!preset) {
      showToast('該当するプリセットがありません', 'error')
      return
    }

    const weapon = cloneWithNewId(preset.weapon)
    player.weapons.push(weapon)
    showToast(`${preset.label} を付与しました`, 'info')
  }

  function grantCustomDebugWeapon() {
    const name = window.prompt('武器名を入力 (省略可)', 'デバッグ武器') || 'デバッグ武器'
    const weaponType = window.prompt('武器タイプを入力 (melee/ranged/magic)', 'melee') as any || 'melee'
    const attackInput = window.prompt('攻撃力を入力 (省略=9999)', '') || '9999'
    const magicInput = window.prompt('魔力を入力 (省略=9999)', '') || '9999'
    const speedInput = window.prompt('速度を入力 (省略=200)', '') || '200'
    const tagInput = window.prompt('付与したいタグをカンマ区切りで入力', debugTagOptions.value.join(',')) || ''
    const effectInput = window.prompt('付与したい効果タイプをカンマ区切りで入力 (例: burn,electrification)', '') || ''
    
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean)
    const effects = buildEffects(effectInput)
    if (effects.length === 0) {
      showToast('効果タイプが未指定です。付与したい効果を入力してください。', 'error')
      return
    }
    
    const attackVal = Math.max(0, parseInt(attackInput, 10) || 9999)
    const magicVal = Math.max(0, parseInt(magicInput, 10) || 9999)
    const speedVal = Math.max(0, parseInt(speedInput, 10) || 200)

    const weapon: Weapon = {
      id: `debug-${Date.now()}`,
      name,
      type: weaponType,
      rarity: 'legendary',
      stats: {
        attack: attackVal,
        magic: magicVal,
        speed: speedVal,
        critChance: 100,
        critDamage: 5,
        statusPower: 500
      },
      tags: (tags.length ? tags : debugTagOptions.value) as any,
      effects,
      description: 'デバッグ用: カスタマイズ可能なデバッグ武器'
    }

    player.weapons.push(weapon)
    showToast('デバッグ武器を付与しました', 'info')
  }

  const debugEnemyPresets = [
    { id: undefined as string | undefined, label: '無害（何もしない）' },
    { id: 'viper', label: '毒付与: バイパー' },
    { id: 'banshee', label: 'スタン/恐怖/感電: バンシー' },
    { id: 'lich', label: '恐怖/スタン: リッチ' },
    { id: 'storm_elemental', label: 'スタン/火傷: ストームエレメンタル' },
    { id: 'dragon', label: '炎＆出血: ドラゴン' }
  ]

  function grantDebugWeapon(presetId?: string) {
    grantPresetWeaponById(presetId)
  }

  function startDebugSpar(templateId?: string) {
    startDebugBattle(templateId)
    showToast('デバッグ敵との戦闘を開始', 'info')
  }

  function grantDebugGold() {
    const promptInput = window.prompt('付与するゴールドを入力', '1000000')
    if (promptInput === null) return

    const numeric = Math.floor(Number(promptInput.replace(/,/g, '')))
    if (!Number.isFinite(numeric) || numeric <= 0) {
      showToast('正の数を入力してください', 'error')
      return
    }

    player.gold = (player.gold || 0) + numeric
    showToast(`${numeric.toLocaleString()} ゴールドを付与しました`, 'info')
  }

  return {
    presetWeapons,
    debugEnemyPresets,
    grantDebugWeapon,
    grantCustomDebugWeapon,
    startDebugSpar,
    grantDebugGold
  }
}
