import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { Enemy, EnemyTier, Weapon, Dungeon, Player, WeaponRarity } from '~/types'
import { BASE_WEAPONS, getBaseWeaponsByRarity } from '~/data/baseWeapons'
import { generateEnchantedWeapon } from '~/systems/WeaponGenerationSystem'

const DEFAULT_WEIGHTS: Record<string, number> = { common: 0.6, rare: 0.3, epic: 0.09, legendary: 0.01, mythic: 0.01 }

type ChestSource = EnemyTier | 'pack'

type ChestQueueEntry = { tier: ChestSource; packId?: string }

type PackConfig = {
  id: string
  label: string
  cost: number
  cardsPerPack: number
  weights: Record<string, number>
}

const PACK_SHOP: PackConfig[] = [
  {
    id: 'pack-1k',
    label: '1,000G パック',
    cost: 1_000,
    cardsPerPack: 3,
    weights: { common: 0.65, rare: 0.28, epic: 0.06, legendary: 0.009, mythic: 0.001 }
  },
  {
    id: 'pack-10k',
    label: '10,000G パック',
    cost: 10_000,
    cardsPerPack: 3,
    weights: { common: 0.45, rare: 0.38, epic: 0.13, legendary: 0.032, mythic: 0.008 }
  },
  {
    id: 'pack-100k',
    label: '100,000G パック',
    cost: 100_000,
    cardsPerPack: 3,
    weights: { common: 0.25, rare: 0.4, epic: 0.24, legendary: 0.08, mythic: 0.03 }
  },
  {
    id: 'pack-1m',
    label: '1,000,000G パック',
    cost: 1_000_000,
    cardsPerPack: 3,
    weights: { common: 0.22, rare: 0.35, epic: 0.26, legendary: 0.12, mythic: 0.05 }
  },
  {
    id: 'pack-10m',
    label: '10,000,000G パック',
    cost: 10_000_000,
    cardsPerPack: 3,
    weights: { common: 0.12, rare: 0.26, epic: 0.32, legendary: 0.18, mythic: 0.12 }
  }
]

export type LootResult =
  | { type: 'chest'; options: Weapon[]; source: EnemyTier }
  | { type: 'weapon'; weapon: Weapon; status: 'new'; level: number }
  | { type: 'none' }

/**
 * 戦利品の抽選と保有管理を担当するコンポーザブル
 */
export function useLootSystem(
  player: Player,
  availableWeapons: Ref<Weapon[]>,
  selectedDungeon: ComputedRef<Dungeon | undefined>
) {
  const showChestModal = ref(false)
  const chestQueue = ref<ChestQueueEntry[]>([])
  const lastLootSource = computed<ChestSource | null>(() => chestQueue.value[0]?.tier ?? null)
  const hasPendingChest = computed<boolean>(() => chestQueue.value.length > 0)
  const chestCount = computed<number>(() => chestQueue.value.length)
  const chestLootHistory = ref<Array<{ id: string; name: string; rarity: WeaponRarity; tier: ChestSource; status: 'new'; level: number; timestamp: number }>>([])
  const packShopOptions = computed(() => PACK_SHOP.map(({ id, label, cost, cardsPerPack, weights }) => ({ id, label, cost, cardsPerPack, weights })))
  const findPackConfig = (packId: string) => PACK_SHOP.find(p => p.id === packId)
  const cloneWeapon = (weapon: Weapon): Weapon => ({
    ...weapon,
    rarity: weapon.rarity,
    stats: { ...weapon.stats },
    tags: [...weapon.tags],
    effects: weapon.effects.map(e => ({ ...e }))
  })

  const resetLoot = () => {
    showChestModal.value = false
    chestQueue.value = []
  }

  const enqueuePack = (packId: string, packCount = 1) => {
    const config = findPackConfig(packId)
    if (!config) return { ok: false as const, reason: 'not-found' as const }
    const totalCards = config.cardsPerPack * Math.max(1, packCount)
    for (let i = 0; i < totalCards; i++) {
      chestQueue.value.push({ tier: 'pack', packId: config.id })
    }
    showChestModal.value = true
    return { ok: true as const, config }
  }

  const addToAvailableIfNeeded = (weapon: Weapon) => {
    const hasAlready =
      player.weapons.some(w => w.id === weapon.id) ||
      availableWeapons.value.some(w => w.id === weapon.id)
    if (!hasAlready) {
      availableWeapons.value.push(cloneWeapon(weapon))
    }
  }

  const pruneAvailableWeapons = () => {
    availableWeapons.value = availableWeapons.value.filter(
      w => !player.weapons.find(pw => pw.id === w.id)
    )
  }

  const addWeaponToInventory = (weapon: Weapon) => {
    // 既に所持している武器も新規として扱う（限界突破はなし）
    const ownedCopy = cloneWeapon(weapon)
    addToAvailableIfNeeded(ownedCopy)

    return { status: 'new' as const, weapon: ownedCopy, level: 0 }
  }

  const rarityRank = (rarity: string): number => {
    const baseOrder: WeaponRarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic']
    const idx = baseOrder.indexOf(rarity as WeaponRarity)
    if (idx >= 0) return idx
    const plus = /^mythic(\+*)$/.exec(rarity)
    if (plus) return baseOrder.indexOf('mythic') + (plus[1]?.length || 0)
    return baseOrder.length
  }

  const rarityPlusLevel = (rarity: string): number => {
    const plus = /^mythic(\+*)$/.exec(rarity)
    return plus ? (plus[1]?.length || 0) : 0
  }

  const normalizeRarityForPool = (rarity: string): string => {
    if (rarity.startsWith('mythic')) return 'mythic'
    return rarity
  }

  const getBumpedWeights = (
    tier: EnemyTier,
    base: Record<string, number>
  ) => {
    const bump = tier === 'boss' ? 2.0 : tier === 'named' ? 1.6 : 1.2
    const entries = Object.entries(base)
    if (!entries.length) return {}
    const lowestKey = entries.reduce((min, cur) => rarityRank(cur[0]) < rarityRank(min) ? cur[0] : min, entries[0][0])
    const result: Record<string, number> = {}
    for (const [key, value] of entries) {
      const factor = key === lowestKey ? 0.6 : bump
      result[key] = value * factor
    }
    return result
  }

  const rollWeaponByWeights = (
    weights: Record<string, number>,
    weaponPool?: string[]
  ): Weapon => {
    const rarities = Object.keys(weights)
    const total = rarities.reduce((sum, key) => sum + weights[key], 0)

    // レアリティをランダムに選択
    let r = Math.random() * total
    let picked: string = 'common'
    for (const key of rarities) {
      if (r < weights[key]) {
        picked = key
        break
      }
      r -= weights[key]
    }

    // 選択されたレアリティのベース武器を取得
    const rarityForPool = normalizeRarityForPool(picked)
    let baseWeapons = getBaseWeaponsByRarity(rarityForPool)
    if (weaponPool && weaponPool.length) {
      baseWeapons = baseWeapons.filter(w => weaponPool.includes(w.id))
    }
    if (baseWeapons.length === 0) {
      // フォールバック: プールが空でも基礎武器から選ぶ（レアリティは picked を維持）
      baseWeapons = weaponPool && weaponPool.length ? BASE_WEAPONS.filter(w => weaponPool.includes(w.id)) : BASE_WEAPONS
    }

    // ランダムにベース武器を選択してエンチャント付きで生成
    const baseWeapon = baseWeapons[Math.floor(Math.random() * baseWeapons.length)]
    const plusLevel = rarityPlusLevel(picked)
    // レアリティに応じてエンチャント確率を調整（mythic+ ならボーナス）
    const enchantChanceBase = rarityForPool === 'legendary' ? 90 : rarityForPool === 'epic' ? 70 : rarityForPool === 'rare' ? 50 : 30
    const multiEnchantChanceBase = rarityForPool === 'legendary' ? 40 : rarityForPool === 'epic' ? 25 : 10
    const enchantChance = Math.min(100, enchantChanceBase + plusLevel * 15)
    const multiEnchantChance = Math.min(100, multiEnchantChanceBase + plusLevel * 10)
    const maxEnchantsOverride = plusLevel > 0 ? 5 + plusLevel : undefined
    return generateEnchantedWeapon(baseWeapon, enchantChance, multiEnchantChance, undefined, { targetRarity: picked as WeaponRarity, maxEnchantsOverride })
  }

  /**
   * 敵レベルに応じてエンチャント確率を調整
   */
  const getEnchantChanceForLevel = (level: number): { enchant: number; multiEnchant: number } => {
    // Lv1-100: 基本確率
    // Lv100-200: 1.2倍
    // Lv200-300: 1.5倍
    // Lv300-400: 1.8倍
    // Lv400-500: 2.2倍
    // Lv500+: 2.5倍
    let multiplier = 1.0
    if (level >= 500) multiplier = 2.5
    else if (level >= 400) multiplier = 2.2
    else if (level >= 300) multiplier = 1.8
    else if (level >= 200) multiplier = 1.5
    else if (level >= 100) multiplier = 1.2

    return {
      enchant: Math.min(100, 50 * multiplier),
      multiEnchant: Math.min(100, 20 * multiplier)
    }
  }

  const rollChestReward = (
    tier: EnemyTier,
    base: Record<string, number>,
    weaponPool?: string[],
    enemyLevel?: number
  ): Weapon => {
    const rarityKeys = Object.keys(base)
    const sorted = rarityKeys.sort((a, b) => rarityRank(a) - rarityRank(b))
    const tierUpWeights: Record<string, number> = {}
    sorted.forEach((key, idx) => {
      if (idx === 0) {
        tierUpWeights[key] = 0
      } else {
        const prev = sorted[idx - 1]
        tierUpWeights[key] = (base[prev] ?? 0) + (idx === sorted.length - 1 ? (base[key] ?? 0) : 0)
      }
    })

    const weights = getBumpedWeights(tier, tierUpWeights)
    const weapon = rollWeaponByWeights(weights, weaponPool)
    
    // 敵レベルが高い場合、エンチャント確率を高める
    if (enemyLevel && enemyLevel >= 100) {
      const bonus = getEnchantChanceForLevel(enemyLevel)
      return generateEnchantedWeapon(weapon, bonus.enchant, bonus.multiEnchant)
    }
    
    return weapon
  }

  const rollReward = (target: Enemy): LootResult => {
    const normalDropChance = 0.2
    const dungeon = selectedDungeon.value
    const baseWeights = dungeon?.lootWeights || DEFAULT_WEIGHTS
    const weaponPool = dungeon?.chestWeaponPool

    if (target.tier === 'boss') {
      return { type: 'chest', options: [], source: 'boss' }
    }

    if (target.tier === 'named') {
      return { type: 'chest', options: [], source: 'named' }
    }

    if (target.tier === 'elite' && Math.random() < 0.35) {
      return { type: 'chest', options: [], source: 'elite' }
    }

    if (Math.random() < normalDropChance) {
      return { type: 'weapon', weapon: rollWeaponByWeights(baseWeights, weaponPool), status: 'new', level: 0 }
    }

    return { type: 'none' }
  }

  const handleVictoryLoot = (target: Enemy): LootResult => {
    const reward = rollReward(target)

    if (reward.type === 'chest') {
      chestQueue.value.push({ tier: reward.source })
      return reward
    }

    if (reward.type === 'weapon') {
      const result = addWeaponToInventory(reward.weapon)
      return { type: 'weapon', weapon: result.weapon, status: result.status, level: result.level }
    }

    return reward
  }

  const spawnChest = (tier: EnemyTier) => {
    chestQueue.value.push({ tier })
    showChestModal.value = false
  }

  const openChests = (count: number) => {
    const dungeon = selectedDungeon.value
    const baseWeights = dungeon?.lootWeights || DEFAULT_WEIGHTS
    const chestWeights = dungeon?.chestLootWeights || baseWeights
    const weaponPool = dungeon?.chestWeaponPool
    const openCount = Math.min(Math.max(1, count), Math.min(9, chestQueue.value.length))
    const results: Array<{ weapon: Weapon; status: 'new' | 'limitbreak' | 'maxed'; level: number; tier: ChestSource }> = []

    for (let i = 0; i < openCount; i++) {
      const entry = chestQueue.value.shift()
      if (!entry) break
      const packConfig = entry.packId ? findPackConfig(entry.packId) : undefined
      const weightsForRoll = packConfig?.weights || chestWeights
      const reward = packConfig
        ? rollWeaponByWeights(weightsForRoll, weaponPool)
        : rollChestReward(entry.tier as EnemyTier, weightsForRoll, weaponPool)
      const result = addWeaponToInventory(reward)
      chestLootHistory.value.unshift({
        id: `${reward.id}-${Date.now()}-${i}`,
        name: reward.name,
        rarity: reward.rarity,
        tier: entry.tier,
        status: 'new',
        level: 0,
        timestamp: Date.now()
      })
      chestLootHistory.value = chestLootHistory.value.slice(0, 20)
      results.push({ weapon: reward, status: result.status, level: result.level, tier: entry.tier })
    }

    // モーダルは開いたままにして入手結果を見せる
    showChestModal.value = true
    return results
  }

  const openPendingChest = () => {
    showChestModal.value = true
  }

  return {
    showChestModal,
    lastLootSource,
    hasPendingChest,
    chestCount,
    resetLoot,
    handleVictoryLoot,
    openPendingChest,
    openChests,
    chestLootHistory,
    packShopOptions,
    addWeaponToInventory,
    addToAvailableIfNeeded,
    pruneAvailableWeapons,
    spawnChest,
    enqueuePack
  }
}
