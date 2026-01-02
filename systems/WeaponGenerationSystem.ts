import type { Weapon, EnchantedWeapon, WeaponRarity, WeaponStats, WeaponTag, WeaponEffect } from '~/types'
import { getRandomEnchantment } from '../data/enchantments'

const TAG_STATUS_EFFECT_MAP: Partial<Record<WeaponTag, WeaponEffect>> = {
  venomous: { type: 'poison', chance: 25, stacks: 2, duration: 3 },
  flame: { type: 'burn', chance: 25, stacks: 2, duration: 3 },
  frost: { type: 'frozen', chance: 12, stacks: 1, duration: 1 },
  bloodthirsty: { type: 'bleed', chance: 30, stacks: 2, duration: 3 },
  precise: { type: 'precision', chance: 100, stacks: 1, duration: 2, target: 'self' },
  fast: { type: 'fleet', chance: 100, stacks: 1, duration: 2, target: 'self' },
  defensive: { type: 'armor', chance: 100, stacks: 1, duration: 3, target: 'self' },
  elemental: { type: 'intellect', chance: 60, stacks: 1, duration: 3, target: 'self' }
}

/**
 * 武器生成システム
 * ベース武器にエンチャントを適用して新しい武器インスタンスを生成
 */

const BASE_RARITY_ORDER: WeaponRarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic']

const getRarityRank = (rarity: WeaponRarity): number => {
  const baseIndex = BASE_RARITY_ORDER.indexOf(rarity as WeaponRarity)
  if (baseIndex >= 0) return baseIndex
  const plusMatch = /^mythic(\+*)$/.exec(rarity)
  if (plusMatch) {
    return BASE_RARITY_ORDER.indexOf('mythic') + (plusMatch[1]?.length || 0)
  }
  return BASE_RARITY_ORDER.length
}

/**
 * レアリティを1段階上げる（mythic 以降は + を増やす）
 */
function upgradeRarity(rarity: WeaponRarity): WeaponRarity {
  if (rarity.startsWith('mythic')) {
    return (`mythic${rarity.slice('mythic'.length)}+` as WeaponRarity)
  }
  const index = BASE_RARITY_ORDER.indexOf(rarity)
  return index >= 0 && index < BASE_RARITY_ORDER.length - 1
    ? BASE_RARITY_ORDER[index + 1]
    : rarity
}

/**
 * ステータスにエンチャント修正を適用
 */
function applyStatModifiers(baseStats: WeaponStats, modifiers: any): WeaponStats {
  return {
    attack: Math.round(baseStats.attack * (modifiers.attack || 1)),
    magic: Math.round(baseStats.magic * (modifiers.magic || 1)),
    speed: Math.round(baseStats.speed * (modifiers.speed || 1)),
    critChance: Math.round(baseStats.critChance * (modifiers.critChance || 1)),
    critDamage: Number((baseStats.critDamage * (modifiers.critDamage || 1)).toFixed(2)),
    statusPower: Math.round(baseStats.statusPower * (modifiers.statusPower || 1))
  }
}

/**
 * 売却価格を計算
 */
function calculateSellValue(rarity: WeaponRarity, enchantmentCount: number): number {
  const baseValues: Record<string, number> = {
    common: 10,
    rare: 30,
    epic: 80,
    legendary: 200,
    mythic: 500
  }
  const base = baseValues[rarity] ?? 500
  const rank = getRarityRank(rarity)
  const mythicRank = getRarityRank('mythic')
  const bonus = Math.max(0, rank - mythicRank) * 200
  return base + bonus + (enchantmentCount * 15)
}

/**
 * エンチャントされた武器を生成
 * @param baseWeapon - ベース武器
 * @param enchantmentChance - エンチャント発生確率 (0-100)
 * @param multiEnchantChance - 複数エンチャント確率 (0-100)
 * @param maxEnchants - 最大エンチャント数（デフォルト: レア度に依存）
 */
export function generateEnchantedWeapon(
  baseWeapon: Weapon,
  enchantmentChance: number = 40,
  multiEnchantChance: number = 15,
  maxEnchants?: number,
  opts?: { targetRarity?: WeaponRarity; maxEnchantsOverride?: number }
): EnchantedWeapon {
  const enchantmentIds: string[] = []
  let finalRarity = baseWeapon.rarity
  let finalStats = { ...baseWeapon.stats }
  let finalTags = [...baseWeapon.tags]
  // ベース武器のエフェクトを破壊的にいじらないようディープコピー
  let finalEffects = baseWeapon.effects.map(effect => ({ ...effect }))
  const enchantmentAddedTags: Set<WeaponTag> = new Set()
  let namePrefix = ''
  let nameSuffix = ''

  // 最大エンチャント数を決定
  const maxEnchantsByRarity: Record<string, number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 5,
    mythic: 5
  }
  const rarityRank = getRarityRank(baseWeapon.rarity)
  const mythicRank = getRarityRank('mythic')
  const extraFromPlus = Math.max(0, rarityRank - mythicRank)
  const effectiveMaxEnchants = opts?.maxEnchantsOverride
    ?? maxEnchants
    ?? (maxEnchantsByRarity[baseWeapon.rarity] ?? 5) + extraFromPlus

  // エンチャント判定
  if (Math.random() * 100 < enchantmentChance && enchantmentIds.length < effectiveMaxEnchants) {
    // 接頭辞
    const prefix = getRandomEnchantment('prefix')
    if (prefix) {
      enchantmentIds.push(prefix.id)
      namePrefix = prefix.name
      
      if (prefix.rarityBonus > 0) {
        for (let i = 0; i < prefix.rarityBonus; i++) {
          finalRarity = upgradeRarity(finalRarity)
        }
      }
      
      if (prefix.statModifiers) {
        finalStats = applyStatModifiers(finalStats, prefix.statModifiers)
      }
      
      if (prefix.addTags) {
        finalTags = [...new Set([...finalTags, ...prefix.addTags])]
        prefix.addTags.forEach(tag => enchantmentAddedTags.add(tag as WeaponTag))
      }
      
      if (prefix.addEffects) {
        finalEffects = [...finalEffects, ...prefix.addEffects.map(effect => ({ ...effect }))]
      }
    }

    // 複数エンチャント判定（接尾辞）
    // 確率を指数関数的に低くする（2個目以降）
    let remainingChance = multiEnchantChance
    let enchantIndex = 1
    
    while (enchantmentIds.length < effectiveMaxEnchants && Math.random() * 100 < remainingChance) {
      const suffix = getRandomEnchantment('suffix')
      if (suffix) {
        enchantmentIds.push(suffix.id)
        if (enchantIndex === 1) {
          nameSuffix = suffix.name
        } else {
          nameSuffix += `・${suffix.name}`
        }
        
        if (suffix.rarityBonus > 0) {
          for (let i = 0; i < suffix.rarityBonus; i++) {
            finalRarity = upgradeRarity(finalRarity)
          }
        }
        
        if (suffix.statModifiers) {
          finalStats = applyStatModifiers(finalStats, suffix.statModifiers)
        }
        
        if (suffix.addTags) {
          finalTags = [...new Set([...finalTags, ...suffix.addTags])]
          suffix.addTags.forEach(tag => enchantmentAddedTags.add(tag as WeaponTag))
        }
        
        if (suffix.addEffects) {
          finalEffects = [...finalEffects, ...suffix.addEffects.map(effect => ({ ...effect }))]
        }

        enchantIndex++
        // 次のエンチャント確率は指数関数的に低下
        remainingChance = remainingChance * 0.6
      } else {
        break
      }
    }
  }

  finalEffects = appendTagBasedEffects(finalEffects, enchantmentAddedTags)
  finalEffects = mergeWeaponEffects(finalEffects)

  // 最終的な武器名を構築
  let finalName = baseWeapon.name
  if (namePrefix && nameSuffix) {
    finalName = `${namePrefix}${finalName}・${nameSuffix}`
  } else if (namePrefix) {
    finalName = `${namePrefix}${finalName}`
  } else if (nameSuffix) {
    finalName = `${finalName}・${nameSuffix}`
  }

  // ユニークIDを生成
  const uniqueId = `${baseWeapon.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const targetRarity = opts?.targetRarity ?? finalRarity

  return {
    id: uniqueId,
    name: finalName,
    type: baseWeapon.type,
    rarity: targetRarity,
    stats: finalStats,
    tags: finalTags as WeaponTag[],
    effects: finalEffects,
    description: baseWeapon.description,
    baseWeaponId: baseWeapon.id,
    enchantments: enchantmentIds,
    sellValue: calculateSellValue(targetRarity, enchantmentIds.length)
  }
}

/**
 * 複数の武器を一括生成
 */
export function generateMultipleWeapons(
  baseWeapons: Weapon[],
  count: number,
  enchantmentChance: number = 40,
  multiEnchantChance: number = 15
): EnchantedWeapon[] {
  const weapons: EnchantedWeapon[] = []
  
  for (let i = 0; i < count; i++) {
    const baseWeapon = baseWeapons[Math.floor(Math.random() * baseWeapons.length)]
    weapons.push(generateEnchantedWeapon(baseWeapon, enchantmentChance, multiEnchantChance))
  }
  
  return weapons
}

function appendTagBasedEffects(effects: WeaponEffect[], tags: Set<WeaponTag>): WeaponEffect[] {
  if (!tags.size) return effects

  const existingTypes = new Set(effects.map(effect => effect.type))
  const additions: WeaponEffect[] = []

  tags.forEach(tag => {
    const candidate = TAG_STATUS_EFFECT_MAP[tag]
    if (candidate && !existingTypes.has(candidate.type)) {
      additions.push({ ...candidate })
      existingTypes.add(candidate.type)
    }
  })

  return [...effects, ...additions]
}

// 同じ状態異常エフェクトが重複した場合に合成する（stacks合算・duration最大・chanceは上限100で最大値）
function mergeWeaponEffects(effects: WeaponEffect[]): WeaponEffect[] {
  const merged: WeaponEffect[] = []

  effects.forEach(effect => {
    const targetKey = effect.target ?? 'default'
    const existing = merged.find(e => e.type === effect.type && (e.target ?? 'default') === targetKey)

    if (existing) {
      existing.stacks = (existing.stacks ?? 0) + (effect.stacks ?? 0)
      existing.duration = Math.max(existing.duration ?? 0, effect.duration ?? 0)
      const currentChance = existing.chance ?? 0
      const nextChance = effect.chance ?? 0
      existing.chance = Math.min(100, Math.max(currentChance, nextChance))
    } else {
      merged.push({ ...effect })
    }
  })

  return merged
}

/**
 * レアリティに応じたエンチャント確率を取得
 */
export function getEnchantmentChanceByRarity(targetRarity: WeaponRarity): { 
  enchantmentChance: number
  multiEnchantChance: number 
} {
  switch (targetRarity) {
    case 'common':
      return { enchantmentChance: 20, multiEnchantChance: 5 }
    case 'rare':
      return { enchantmentChance: 50, multiEnchantChance: 15 }
    case 'epic':
      return { enchantmentChance: 80, multiEnchantChance: 35 }
    case 'legendary':
      return { enchantmentChance: 100, multiEnchantChance: 60 }
    case 'mythic':
      return { enchantmentChance: 100, multiEnchantChance: 80 }
  }
}
