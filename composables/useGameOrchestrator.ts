import { ref, type Ref } from 'vue'
import type { Player, Weapon, PlayerAllocatedStats, PlayerStats } from '~/types'
import { useExperience } from './useExperience'
import { useLootSystem } from './useLootSystem'
import { useBattleFlow } from './useBattleFlow'

export type BattleSpeed = 1 | 2 | 4

/**
 * ページから分離したゲーム進行オーケストレーター
 */
export function useGameOrchestrator(
  player: Player,
  availableWeapons: Ref<any[]>,
  selectedDungeon: any,
  currentLevel: Ref<number>
) {
  const { grantExpForEnemy } = useExperience(player)
  const {
    showChestModal,
    chestOptions,
    chestQueue,
    lastLootSource,
    hasPendingChest,
    chestCount,
    handleVictoryLoot,
    chooseChestWeapon: baseChooseChestWeapon,
    openPendingChest,
    addToAvailableIfNeeded,
    pruneAvailableWeapons,
    spawnChest
  } = useLootSystem(player, availableWeapons, selectedDungeon)

  const {
    enemy,
    combat,
    combatLogs,
    startBattle,
    runTurn,
    goNextBattle
  } = useBattleFlow(player, selectedDungeon, currentLevel)

  const infoMessages = ref<string[]>([])
  const battleSpeed = ref<BattleSpeed>(1)
  const isAutoRunning = ref(false)
  const isDungeonRunning = ref(false)
  const currentStage = ref(0)
  const totalStages = 10
  const currentEvent = ref<'battle' | 'chest' | null>(null)
  let loopHandle: any = null

  const ensureAllocations = (): PlayerAllocatedStats => {
    if (!player.allocatedStats) {
      player.allocatedStats = {
        maxHp: 0,
        attack: 0,
        magic: 0,
        defense: 0,
        magicDefense: 0,
        speed: 0
      }
    }
    return player.allocatedStats as PlayerAllocatedStats
  }

  const allocateStat = (stat: keyof PlayerStats) => {
    if (player.statPoints <= 0) return { ok: false, reason: 'no-points' }
    const allocations = ensureAllocations()

    const deltas: Record<keyof PlayerStats, number> = {
      attack: 5,
      magic: 5,
      defense: 3,
      magicDefense: 3,
      speed: 2
    }

    if (stat === 'attack' || stat === 'magic' || stat === 'defense' || stat === 'magicDefense' || stat === 'speed') {
      player.stats[stat] += deltas[stat]
      allocations[stat] += 1
      player.statPoints -= 1
      return { ok: true }
    }

    return { ok: false, reason: 'unknown-stat' }
  }

  const allocateMaxHp = () => {
    if (player.statPoints <= 0) return { ok: false, reason: 'no-points' }
    const allocations = ensureAllocations()
    player.maxHp += 25
    player.currentHp = Math.min(player.currentHp + 25, player.maxHp)
    allocations.maxHp += 1
    player.statPoints -= 1
    return { ok: true }
  }

  const resetAllocatedStats = (cost: number) => {
    const allocations = ensureAllocations()
    const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0)
    if (totalAllocated === 0) return { ok: false, reason: 'no-allocation' }
    if (player.gold < cost) return { ok: false, reason: 'no-gold' }

    const deltas: Record<keyof PlayerStats, number> = {
      attack: 5,
      magic: 5,
      defense: 3,
      magicDefense: 3,
      speed: 2
    }

    player.maxHp -= allocations.maxHp * 25
    player.stats.attack -= allocations.attack * deltas.attack
    player.stats.magic -= allocations.magic * deltas.magic
    player.stats.defense -= allocations.defense * deltas.defense
    player.stats.magicDefense -= allocations.magicDefense * deltas.magicDefense
    player.stats.speed -= allocations.speed * deltas.speed

    player.statPoints += totalAllocated
    player.gold -= cost

    player.currentHp = Math.min(player.currentHp, player.maxHp)

    allocations.maxHp = 0
    allocations.attack = 0
    allocations.magic = 0
    allocations.defense = 0
    allocations.magicDefense = 0
    allocations.speed = 0

    return { ok: true }
  }

  const addInfo = (msg: string) => infoMessages.value.push(msg)
  const addLoot = (msg: string) => {
    infoMessages.value.push(msg)
    // 戦闘ログにも追加
    combatLogs.value.push({
      turn: combat.value?.turnCount ?? 0,
      message: msg,
      type: 'loot'
    })
  }
  const clearInfos = () => { infoMessages.value = [] }

  const calculateGoldReward = (foe: { level: number; tier: string }) => {
    const base = 20 + foe.level * 5
    const tierMultiplier = foe.tier === 'boss' ? 3 : foe.tier === 'named' ? 2 : foe.tier === 'elite' ? 1.5 : 1
    return Math.floor(base * tierMultiplier)
  }

  const clearAllMessages = () => {
    clearInfos()
  }

  const resetPlayerState = () => {
    player.currentHp = player.maxHp
    player.statusEffects = []
  }

  const processVictory = () => {
    if (!enemy.value) return
    const { expGained, levelUps } = grantExpForEnemy(enemy.value)
    addLoot(`+${expGained} EXP 獲得`)
    if (levelUps > 0) addLoot(`レベルアップ！ Lv.${player.level}`)

    // ゴールド報酬
    const goldGained = calculateGoldReward(enemy.value)
    player.gold += goldGained
    addLoot(`+${goldGained} G 獲得`)

    const loot = handleVictoryLoot(enemy.value)
    if (loot.type === 'weapon') {
      if (loot.status === 'limitbreak') {
        addLoot(`${loot.weapon.name} が限界突破 +${loot.level}`)
        if (loot.level >= (loot.weapon.limitBreakMax ?? 4)) {
          addInfo(`${loot.weapon.name} は最大まで強化済み`)
        }
      } else if (loot.status === 'maxed') {
        addInfo(`${loot.weapon.name} は既に最大突破`)
      } else {
        addLoot(`武器獲得: ${loot.weapon.name}`)
      }
    }
    if (loot.type === 'chest') addInfo(loot.source === 'named' ? '豪華な宝箱が出現！' : '宝箱が出現！')
  }

  const markDungeonFailed = () => {
    stopAuto()
    if (isDungeonRunning.value) {
      isDungeonRunning.value = false
    }
    currentEvent.value = null
    addInfo('探索に失敗しました。装備を整えて再挑戦しましょう')
  }

  const handleBattleCompletion = () => {
    if (!combat.value?.isGameOver()) return
    stopAuto()

    if (combat.value.isPlayerVictory()) {
      if (isDungeonRunning.value) {
        goNextBattle(() => {})
        currentEvent.value = null
        startNextStage()
      }
      return
    }

    markDungeonFailed()
  }

  const autoLoop = () => {
    if (!combat.value || combat.value.isGameOver()) {
      stopAuto()
      return
    }

    runTurn(() => {
      processVictory()
      handleBattleCompletion()
    })

    if (combat.value?.isGameOver() && !combat.value.isPlayerVictory()) {
      handleBattleCompletion()
    }
  }

  const startAuto = () => {
    if (isAutoRunning.value) return
    isAutoRunning.value = true
    const interval = 800 / battleSpeed.value
    loopHandle = setInterval(autoLoop, interval)
  }

  const stopAuto = () => {
    if (loopHandle) {
      clearInterval(loopHandle)
      loopHandle = null
    }
    isAutoRunning.value = false
  }

  const startStageBattle = (opts?: { forcedTier?: 'boss' }) => {
    resetPlayerState()
    stopAuto()
    startBattle({ forcedTier: opts?.forcedTier })
    startAuto()
  }

  const startNextStage = () => {
    if (!isDungeonRunning.value) return

    if (currentStage.value >= totalStages) {
      isDungeonRunning.value = false
      currentEvent.value = null
      addInfo('ダンジョン探索完了！')
      stopAuto()
      return
    }

    currentStage.value += 1
    const isBossStage = currentStage.value === totalStages
    const dungeon = selectedDungeon.value
    const chestChance = dungeon?.chestChance ?? 0.1
    const event = isBossStage ? 'battle' : Math.random() < chestChance ? 'chest' : 'battle'
    currentEvent.value = event
    addInfo(`ステージ ${currentStage.value}/${totalStages}: ${event === 'battle' ? (isBossStage ? 'ボスが出現！' : '敵が現れた') : '宝箱を発見'}`)

    if (event === 'chest') {
      spawnChest('elite')
      currentEvent.value = null
      startNextStage()
      return
    }

    startStageBattle(isBossStage ? { forcedTier: 'boss' } : undefined)
  }

  const startDungeonRun = () => {
    clearAllMessages()
    stopAuto()
    resetPlayerState()
    combatLogs.value = [] // ダンジョン開始時にログをクリア
    isDungeonRunning.value = true
    currentStage.value = 0
    currentEvent.value = null
    startNextStage()
  }

  const proceedNextBattle = () => {
    goNextBattle(() => {})
    clearAllMessages()
    stopAuto()
    if (isDungeonRunning.value) {
      startNextStage()
    }
  }

  const abandonDungeon = () => {
    stopAuto()
    isDungeonRunning.value = false
    currentEvent.value = null
    combat.value = null
    enemy.value = null
    addInfo('探索を中断しました')
  }

  const chooseChestWeapon = (weapon: Weapon) => {
    const res = baseChooseChestWeapon(weapon)
    return res
  }

  const changeSpeed = (speed: BattleSpeed) => {
    battleSpeed.value = speed
    if (isAutoRunning.value) {
      stopAuto()
      startAuto()
    }
  }

  return {
    enemy,
    combat,
    combatLogs,
    showChestModal,
    chestOptions,
    chestQueue,
    lastLootSource,
    hasPendingChest,
    isDungeonRunning,
    currentStage,
    totalStages,
    currentEvent,
    chestCount,
    infoMessages,
    battleSpeed,
    isAutoRunning,
    startDungeonRun,
    proceedNextBattle,
    processVictory,
    chooseChestWeapon,
    openPendingChest,
    abandonDungeon,
    addToAvailableIfNeeded,
    pruneAvailableWeapons,
    changeSpeed,
    stopAuto,
    startAuto,
    allocateStat,
    allocateMaxHp,
    resetAllocatedStats
  }
}
