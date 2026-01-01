import type { Weapon, EnchantedWeapon, WeaponRarity, WeaponStats, WeaponTag } from '~/types'
import { getRandomEnchantment } from '../data/enchantments'

/**
 * 武器生成システム
 * ベース武器にエンチャントを適用して新しい武器インスタンスを生成
 */

/**
 * レアリティを1段階上げる
 */
function upgradeRarity(rarity: WeaponRarity): WeaponRarity {
  const rarityOrder: WeaponRarity[] = ['common', 'rare', 'epic', 'legendary']
  const index = rarityOrder.indexOf(rarity)
  return index < rarityOrder.length - 1 ? rarityOrder[index + 1] : rarity
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
  const baseValues: Record<WeaponRarity, number> = {
    common: 10,
    rare: 30,
    epic: 80,
    legendary: 200
  }
  return baseValues[rarity] + (enchantmentCount * 15)
}

/**
 * エンチャントされた武器を生成
 * @param baseWeapon - ベース武器
 * @param enchantmentChance - エンチャント発生確率 (0-100)
 * @param multiEnchantChance - 複数エンチャント確率 (0-100)
 */
export function generateEnchantedWeapon(
  baseWeapon: Weapon,
  enchantmentChance: number = 40,
  multiEnchantChance: number = 15
): EnchantedWeapon {
  const enchantmentIds: string[] = []
  let finalRarity = baseWeapon.rarity
  let finalStats = { ...baseWeapon.stats }
  let finalTags = [...baseWeapon.tags]
  let finalEffects = [...baseWeapon.effects]
  let namePrefix = ''
  let nameSuffix = ''

  // エンチャント判定
  if (Math.random() * 100 < enchantmentChance) {
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
      }
      
      if (prefix.addEffects) {
        finalEffects = [...finalEffects, ...prefix.addEffects]
      }
    }

    // 複数エンチャント判定（接尾辞）
    if (Math.random() * 100 < multiEnchantChance) {
      const suffix = getRandomEnchantment('suffix')
      if (suffix) {
        enchantmentIds.push(suffix.id)
        nameSuffix = suffix.name
        
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
        }
        
        if (suffix.addEffects) {
          finalEffects = [...finalEffects, ...suffix.addEffects]
        }
      }
    }
  }

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
    rarity: finalRarity,
    stats: finalStats,
    tags: finalTags as WeaponTag[],
    effects: finalEffects,
    description: baseWeapon.description,
    baseWeaponId: baseWeapon.id,
    enchantments: enchantmentIds,
    sellValue: calculateSellValue(finalRarity, enchantmentIds.length)
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
  }
}
