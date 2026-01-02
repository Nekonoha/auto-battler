import type { Weapon, EnchantedWeapon, WeaponRarity, WeaponStats, WeaponTag, WeaponEffect, WeaponTraits } from '~/types'
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
 * レア度に基づいてステータスを上昇させる
 */
function applyRarityStatBonus(baseStats: WeaponStats, rarity: WeaponRarity): WeaponStats {
  const rank = getRarityRank(rarity)
  const commonRank = getRarityRank('common')
  
  // レア度ごとのステータスブースト係数
  const multiplier = 1 + (rank - commonRank) * 0.08 // 1段階ごとに8%増加
  
  return {
    attack: Math.round(baseStats.attack * multiplier),
    magic: Math.round(baseStats.magic * multiplier),
    speed: Math.round(baseStats.speed * multiplier),
    critChance: Math.round(baseStats.critChance * multiplier),
    critDamage: Number((baseStats.critDamage * multiplier).toFixed(2)),
    statusPower: Math.round(baseStats.statusPower * multiplier)
  }
}

/**
 * 高レアリティ武器にtraitsを付与（10-20%の耐性・軽減率）
 * legendary以上は必ず1つ以上のtraitが付与される
 */
function generateWeaponTraits(rarity: WeaponRarity): WeaponTraits | undefined {
  const rank = getRarityRank(rarity)
  const legendaryRank = getRarityRank('legendary')
  
  // legendary未満はtraitsなし
  if (rank < legendaryRank) return undefined
  
  // legendary以降は必ずtraitを付与（100%）
  // レア度が高いほどtraitの数が増える
  let traitCount = 1
  if (rank >= legendaryRank + 2) {
    traitCount = Math.random() < 0.5 ? 2 : 1
  } else if (rank >= legendaryRank + 1) {
    traitCount = Math.random() < 0.3 ? 2 : 1
  }
  
  const traits: WeaponTraits = {}
  const availableTraits = ['physicalResistance', 'magicalResistance', 'statusResistance', 'damageReduction']
  
  for (let i = 0; i < traitCount; i++) {
    if (availableTraits.length === 0) break
    
    const traitIndex = Math.floor(Math.random() * availableTraits.length)
    const traitType = availableTraits.splice(traitIndex, 1)[0]
    
    // 10-25%の範囲でランダム（レア度が高いほど高い値）
    const isMythicPlus = rank > legendaryRank + 1
    const minValue = isMythicPlus ? 15 : 12
    const maxValue = isMythicPlus ? 25 : 20
    const value = minValue + Math.floor(Math.random() * (maxValue - minValue + 1))
    
    switch (traitType) {
      case 'physicalResistance':
        traits.physicalResistance = value
        break
      case 'magicalResistance':
        traits.magicalResistance = value
        break
      case 'statusResistance':
        traits.statusResistance = value
        break
      case 'damageReduction':
        traits.damageReduction = value
        break
    }
  }
  
  return Object.keys(traits).length > 0 ? traits : undefined
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
  let finalStats = applyRarityStatBonus({ ...baseWeapon.stats }, baseWeapon.rarity)
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

  // 確率的にレア度を上昇させる（エンチャント前の初期処理）
  // 各レア度ごとに異なる上昇確率
  const rarityUpgradeChances: Record<string, number> = {
    common: 5,      // 5%
    rare: 8,        // 8%
    epic: 12,       // 12%
    legendary: 15,  // 15%
    mythic: 8       // 8%（mythic+はさらに低い）
  }
  const currentRarityKey = baseWeapon.rarity.split('+')[0]
  const upgradeChance = rarityUpgradeChances[currentRarityKey] ?? 3
  
  let initialRarity = baseWeapon.rarity
  const rarityUpgradeRoll = Math.random() * 100
  if (rarityUpgradeRoll < upgradeChance) {
    initialRarity = upgradeRarity(initialRarity)
    finalRarity = initialRarity
    // 初期レア度が上昇した場合、ステータスボーナスを再計算
    finalStats = applyRarityStatBonus(finalStats, initialRarity)
  }

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

  // targetRarityを決定
  const targetRarity = opts?.targetRarity ?? finalRarity

  // 最終レア度でステータスを再計算（エンチャントによる上昇も考慮）
  const finalStatBonus = applyRarityStatBonus(finalStats, targetRarity)

  // traits生成（高レアリティ武器用）
  const traits = generateWeaponTraits(targetRarity)

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

  return {
    id: uniqueId,
    name: finalName,
    type: baseWeapon.type,
    rarity: targetRarity,
    stats: finalStatBonus,
    tags: finalTags as WeaponTag[],
    effects: finalEffects,
    description: baseWeapon.description,
    baseWeaponId: baseWeapon.id,
    enchantments: enchantmentIds,
    sellValue: calculateSellValue(targetRarity, enchantmentIds.length),
    traits
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
    default:
      // mythic または mythic+ の場合
      return { enchantmentChance: 100, multiEnchantChance: 80 }
  }
}
