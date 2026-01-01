import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { Enemy, EnemyTier, Weapon, Dungeon, Player, WeaponRarity } from '~/types'
import { weaponDatabase } from '~/data/weapons'

const DEFAULT_WEIGHTS = { common: 0.6, rare: 0.3, epic: 0.09, legendary: 0.01 }
const MAX_LIMIT_BREAK = 4

export type LootResult =
  | { type: 'chest'; options: Weapon[]; source: EnemyTier }
  | { type: 'weapon'; weapon: Weapon; status: 'new' | 'limitbreak' | 'maxed'; level: number }
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
  const chestQueue = ref<Array<{ options: Weapon[]; source: EnemyTier }>>([])
  const chestOptions = computed<Weapon[] | null>(() => chestQueue.value[0]?.options ?? null)
  const lastLootSource = computed<EnemyTier | null>(() => chestQueue.value[0]?.source ?? null)
  const hasPendingChest = computed<boolean>(() => chestQueue.value.length > 0)
  const chestCount = computed<number>(() => chestQueue.value.length)

  const cloneWeapon = (weapon: Weapon): Weapon => ({
    ...weapon,
    rarity: weapon.rarity,
    limitBreak: weapon.limitBreak ?? 0,
    limitBreakMax: weapon.limitBreakMax ?? MAX_LIMIT_BREAK,
    stats: { ...weapon.stats },
    tags: [...weapon.tags],
    effects: weapon.effects.map(e => ({ ...e }))
  })

  const rarityOrder: WeaponRarity[] = ['common', 'rare', 'epic', 'legendary']

  const promoteRarity = (weapon: Weapon) => {
    const currentIdx = rarityOrder.indexOf(weapon.rarity)
    if (currentIdx >= 0 && currentIdx < rarityOrder.length - 1) {
      weapon.rarity = rarityOrder[currentIdx + 1]
    }
  }

  const boostWeaponPower = (weapon: Weapon, step: number) => {
    const scale = 1 + 0.08 * step
    weapon.stats.attack = Math.round(weapon.stats.attack * scale)
    weapon.stats.magic = Math.round(weapon.stats.magic * scale)
    weapon.stats.speed = Math.round(weapon.stats.speed * scale)
    weapon.stats.critChance = Math.min(100, Math.round(weapon.stats.critChance * (1 + 0.05 * step)))
    weapon.stats.critDamage = parseFloat((weapon.stats.critDamage * (1 + 0.03 * step)).toFixed(2))
    weapon.stats.statusPower = Math.round(weapon.stats.statusPower * (1 + 0.1 * step))

    weapon.effects = weapon.effects.map(effect => ({
      ...effect,
      chance: Math.min(100, Math.round(effect.chance * (1 + 0.05 * step))),
      stacks: Math.max(1, Math.round(effect.stacks * (1 + 0.05 * step))),
      duration: Math.max(1, Math.round(effect.duration * (1 + 0.03 * step)))
    }))
  }

  const isWeaponMaxed = (candidateId: string): boolean => {
    const pool = [...player.weapons, ...availableWeapons.value]
    const owned = pool.find(w => w.id === candidateId)
    if (!owned) return false
    const max = owned.limitBreakMax ?? MAX_LIMIT_BREAK
    return (owned.limitBreak ?? 0) >= max
  }

  const resetLoot = () => {
    showChestModal.value = false
    chestQueue.value = []
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

  const upgradeExistingWeapon = (existing: Weapon) => {
    existing.limitBreak = existing.limitBreak ?? 0
    const max = existing.limitBreakMax ?? MAX_LIMIT_BREAK
    if (existing.limitBreak >= max) {
      return { status: 'maxed' as const, weapon: existing, level: existing.limitBreak }
    }

    existing.limitBreak += 1
    boostWeaponPower(existing, 1)

    const isMax = existing.limitBreak >= max
    if (isMax) {
      promoteRarity(existing)
      boostWeaponPower(existing, 1)
    }

    return { status: 'limitbreak' as const, weapon: existing, level: existing.limitBreak, isMax }
  }

  const addWeaponToInventory = (weapon: Weapon) => {
    // 既に所持している武器なら限界突破
    const owned = player.weapons.find(w => w.id === weapon.id)
    if (owned) {
      return upgradeExistingWeapon(owned)
    }

    const stored = availableWeapons.value.find(w => w.id === weapon.id)
    if (stored) {
      return upgradeExistingWeapon(stored)
    }

    const ownedCopy = cloneWeapon(weapon)
    if (player.weapons.length < 3) {
      player.weapons.push(ownedCopy)
      pruneAvailableWeapons()
    } else {
      addToAvailableIfNeeded(ownedCopy)
    }

    return { status: 'new' as const, weapon: ownedCopy, level: ownedCopy.limitBreak ?? 0 }
  }

  const createChestOptions = (
    tier: EnemyTier,
    base: Record<'common' | 'rare' | 'epic' | 'legendary', number>
  ): Weapon[] => {
    const bump = tier === 'boss' ? 2.0 : tier === 'named' ? 1.6 : 1.2
    const weights = {
      common: base.common * 0.6,
      rare: base.rare * bump,
      epic: base.epic * bump,
      legendary: base.legendary * bump
    }
    return Array.from({ length: 3 }, () => rollWeaponByWeights(weights))
  }

  const rollWeaponByWeights = (
    weights: Record<'common' | 'rare' | 'epic' | 'legendary', number>
  ): Weapon => {
    const rarities = Object.keys(weights) as Array<keyof typeof weights>
    const total = rarities.reduce((sum, key) => sum + weights[key], 0)

    let attempt = 0
    while (attempt < 10) {
      attempt += 1
      let r = Math.random() * total
      let picked: keyof typeof weights = 'common'
      for (const key of rarities) {
        if (r < weights[key]) {
          picked = key
          break
        }
        r -= weights[key]
      }

      const pool = weaponDatabase.filter(w => w.rarity === picked && !isWeaponMaxed(w.id))
      if (pool.length > 0) {
        return cloneWeapon(pool[Math.floor(Math.random() * pool.length)])
      }
    }

    // fallback
    const fallback = weaponDatabase.filter(w => !isWeaponMaxed(w.id))
    if (fallback.length) {
      return cloneWeapon(fallback[Math.floor(Math.random() * fallback.length)])
    }
    return cloneWeapon(weaponDatabase[Math.floor(Math.random() * weaponDatabase.length)])
  }

  const rollReward = (target: Enemy): LootResult => {
    const normalDropChance = 0.2
    const dungeon = selectedDungeon.value
    const baseWeights = dungeon?.lootWeights || DEFAULT_WEIGHTS

    if (target.tier === 'boss') {
      return { type: 'chest', options: createChestOptions('boss', baseWeights), source: 'boss' }
    }

    if (target.tier === 'named') {
      return { type: 'chest', options: createChestOptions('named', baseWeights), source: 'named' }
    }

    if (target.tier === 'elite' && Math.random() < 0.35) {
      return { type: 'chest', options: createChestOptions('elite', baseWeights), source: 'elite' }
    }

    if (Math.random() < normalDropChance) {
      return { type: 'weapon', weapon: rollWeaponByWeights(baseWeights), status: 'new', level: 0 }
    }

    return { type: 'none' }
  }

  const handleVictoryLoot = (target: Enemy): LootResult => {
    const reward = rollReward(target)

    if (reward.type === 'chest') {
      chestQueue.value.push({ options: reward.options, source: reward.source })
      return reward
    }

    if (reward.type === 'weapon') {
      const result = addWeaponToInventory(reward.weapon)
      return { type: 'weapon', weapon: result.weapon, status: result.status, level: result.level }
    }

    return reward
  }

  const spawnChest = (tier: EnemyTier) => {
    const dungeon = selectedDungeon.value
    const baseWeights = dungeon?.lootWeights || DEFAULT_WEIGHTS
    chestQueue.value.push({ options: createChestOptions(tier, baseWeights), source: tier })
    showChestModal.value = false
  }

  const chooseChestWeapon = (weapon: Weapon) => {
    addWeaponToInventory(weapon)
    chestQueue.value.shift()
    showChestModal.value = false
    return { weapon }
  }

  const openPendingChest = () => {
    if (chestOptions.value?.length) {
      showChestModal.value = true
    }
  }

  return {
    showChestModal,
    chestOptions,
    chestQueue,
    lastLootSource,
    hasPendingChest,
    chestCount,
    resetLoot,
    handleVictoryLoot,
    chooseChestWeapon,
    openPendingChest,
    addWeaponToInventory,
    addToAvailableIfNeeded,
    pruneAvailableWeapons,
    spawnChest
  }
}
