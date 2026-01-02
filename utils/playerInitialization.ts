import type { Player } from '~/types'
import { BASE_WEAPONS } from '~/data/baseWeapons'
import { generateEnchantedWeapon } from '~/systems/WeaponGenerationSystem'

/**
 * 初期武器を生成（エンチャントなしの錆びた剣）
 */
export function createInitialWeapon() {
  return generateEnchantedWeapon(BASE_WEAPONS[0], 0, 0)
}

/**
 * 初期プレイヤーデータを生成
 */
export function createInitialPlayer(): Player {
  return {
    name: 'プレイヤー',
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    maxHp: 200,
    currentHp: 200,
    statPoints: 0,
    allocatedStats: {
      maxHp: 0,
      attack: 0,
      magic: 0,
      defense: 0,
      magicDefense: 0,
      speed: 0
    },
    unlockedDungeons: ['tutorial-field'],
    gold: 100,
    weapons: [createInitialWeapon()],
    statusEffects: [],
    stats: {
      attack: 15,
      magic: 10,
      defense: 5,
      magicDefense: 4,
      speed: 10
    }
  }
}

/**
 * 基本ステータス（これより低くできない）
 */
export const BASE_STATS = {
  maxHp: 100,
  attack: 10,
  magic: 5,
  defense: 5,
  magicDefense: 5,
  speed: 10
} as const
