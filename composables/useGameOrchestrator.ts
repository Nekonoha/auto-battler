import { ref, type Ref } from 'vue'
import type { Player, PlayerAllocatedStats, PlayerStats, EnemyTier, Dungeon } from '~/types'
import { useExperience } from './useExperience'
import { useLootSystem } from './useLootSystem'
import { useBattleFlow } from './useBattleFlow'
import { dungeons } from '~/data/dungeons'
import { CombatSystem } from '~/systems/CombatSystem'

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
    lastLootSource,
    hasPendingChest,
    chestCount,
    handleVictoryLoot,
    openPendingChest,
    openChests,
    chestLootHistory,
    addToAvailableIfNeeded,
    pruneAvailableWeapons,
    spawnChest
  } = useLootSystem(player, availableWeapons, selectedDungeon)

  const {
    enemy,
    combat,
    combatLogs,
    explorationCombatLogs,
    dungeonLogs,
    startBattle,
    runTurn,
    goNextBattle
  } = useBattleFlow(player, selectedDungeon, currentLevel)

  const isDungeonRunning = ref(false)
  const isDebugMode = ref(false)

  // 古いセーブ互換: アンロックリストが無い場合は初期ダンジョンのみ解放
  if (!Array.isArray(player.unlockedDungeons) || player.unlockedDungeons.length === 0) {
    player.unlockedDungeons = ['tutorial-field']
  }

  if (typeof player.weaponSlots !== 'number') {
    player.weaponSlots = Math.max(2, player.weapons?.length ?? 0)
  }

  const infoMessages = ref<string[]>([])
  const battleSpeed = ref<BattleSpeed>(1)
  const isAutoRunning = ref(false)
  const currentStage = ref(0)
  const totalStages = 10
  const currentEvent = ref<'battle' | 'chest' | null>(null)
  let loopHandle: any = null

  const getRandomTier = (dungeon?: Dungeon): EnemyTier => {
    if (!dungeon) return 'normal'
    const namedChance = Math.max(0, Math.min(1, dungeon.namedChance ?? 0))
    const eliteChance = Math.max(0, Math.min(1, dungeon.eliteChance ?? 0))
    const roll = Math.random()
    if (roll < namedChance) return 'named'
    if (roll < namedChance + eliteChance) return 'elite'
    return 'normal'
  }

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
    return { ok: true }
  }

  const resetAllocatedStats = (cost: number) => {
    const allocations = ensureAllocations()
    
    // allocations オブジェクトにはすでにポイント数が保存されている
    const totalPointsAllocated = 
      allocations.maxHp +
      allocations.attack +
      allocations.magic +
      allocations.defense +
      allocations.magicDefense +
      allocations.speed
    
    if (totalPointsAllocated === 0) return { ok: false, reason: 'no-allocation' }
    if (player.gold < cost) return { ok: false, reason: 'no-gold' }

    // デフォルト値に戻す
    const BASE_STATS = {
      maxHp: 100,
      attack: 10,
      magic: 5,
      defense: 5,
      magicDefense: 5,
      speed: 10
    }

    player.maxHp = BASE_STATS.maxHp
    player.stats.attack = BASE_STATS.attack
    player.stats.magic = BASE_STATS.magic
    player.stats.defense = BASE_STATS.defense
    player.stats.magicDefense = BASE_STATS.magicDefense
    player.stats.speed = BASE_STATS.speed

    player.gold -= cost

    player.currentHp = Math.min(player.currentHp, player.maxHp)

    allocations.maxHp = 0
    allocations.attack = 0
    allocations.magic = 0
    allocations.defense = 0
    allocations.magicDefense = 0
    allocations.speed = 0
    
    // リセット後、statPoints を正確に再計算
    const multipliers = { maxHp: 25, attack: 5, magic: 5, defense: 3, magicDefense: 3, speed: 2 }
    const allocatedPoints = 
      Math.floor((player.maxHp - BASE_STATS.maxHp) / multipliers.maxHp) +
      Math.floor((player.stats.attack - BASE_STATS.attack) / multipliers.attack) +
      Math.floor((player.stats.magic - BASE_STATS.magic) / multipliers.magic) +
      Math.floor((player.stats.defense - BASE_STATS.defense) / multipliers.defense) +
      Math.floor((player.stats.magicDefense - BASE_STATS.magicDefense) / multipliers.magicDefense) +
      Math.floor((player.stats.speed - BASE_STATS.speed) / multipliers.speed)
    player.statPoints = (player.level * 5) - allocatedPoints

    return { ok: true }
  }

  const addInfo = (msg: string) => infoMessages.value.push(msg)
  const addLoot = (msg: string) => {
    infoMessages.value.push(msg)
    // 戦闘ログにも追加
    combatLogs.value.push({
      turn: 0,
      message: msg,
      type: 'loot'
    })
  }
  const clearInfos = () => { infoMessages.value = [] }

  const calculateGoldReward = (foe: { level: number; tier: string }) => {
    const base = 12 + foe.level * 6
    const levelScale = Math.pow(1.04, Math.max(0, foe.level - 1))
    const tierMultiplier = foe.tier === 'boss' ? 3 : foe.tier === 'named' ? 2.1 : foe.tier === 'elite' ? 1.4 : 1
    return Math.floor(base * tierMultiplier * levelScale)
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
      addLoot(`${loot.weapon.name} を獲得！`)
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

  const startStageBattle = (opts?: { forcedTier?: EnemyTier; debugMode?: boolean }) => {
    isDebugMode.value = false
    resetPlayerState()
    stopAuto()
    startBattle({ forcedTier: opts?.forcedTier })
    startAuto()
  }

  const startDebugBattle = (debugTemplateId?: string) => {
    isDebugMode.value = true
    stopAuto()
    resetPlayerState()
    combatLogs.value = []
    explorationCombatLogs.value = []
    dungeonLogs.value = []
    enemy.value = CombatSystem.generateEnemy(player.level, { debugMode: true, debugTemplateId })
    combat.value = enemy.value ? new CombatSystem(player, enemy.value) : null
    if (combat.value) {
      startAuto()
      isDungeonRunning.value = false
      currentEvent.value = null
      addInfo('デバッグ敵とスパーリングを開始')
    }
  }

  const startNextStage = () => {
    if (!isDungeonRunning.value) return

    if (currentStage.value >= totalStages) {
      isDungeonRunning.value = false
      currentEvent.value = null
      addInfo('ダンジョン探索完了！')
      const currentDungeon = selectedDungeon.value
      
      // 現在のダンジョンを前提条件とするダンジョンの中から、最初の1つだけを解放
      if (currentDungeon) {
        const nextDungeons = dungeons.filter(d => d.prereq === currentDungeon.id)
        if (nextDungeons.length > 0) {
          const nextDungeon = nextDungeons[0]
          if (!player.unlockedDungeons.includes(nextDungeon.id)) {
            player.unlockedDungeons.push(nextDungeon.id)
            addInfo(`${nextDungeon.name} が解放されました！`)
          }
        }
      }
      
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
      // 宝箱イベントをexplorationLogsに記録
      const dungeonName = dungeon?.name || '不明なダンジョン'
      explorationCombatLogs.value.push({
        dungeonName,
        stage: currentStage.value,
        eventType: 'chest',
        chestCount: 1,
        itemsDropped: []
      } as any)
      
      spawnChest('elite')
      currentEvent.value = null
      startNextStage()
      return
    }

    const forcedTier = isBossStage ? 'boss' : getRandomTier(dungeon)
    startStageBattle({ forcedTier })
  }

  const startDungeonRun = () => {
    isDebugMode.value = false
    const dungeon = selectedDungeon.value
    if (!dungeon || !player.unlockedDungeons.includes(dungeon.id)) {
      addInfo('未解放のダンジョンです')
      return
    }
    clearAllMessages()
    stopAuto()
    resetPlayerState()
    combatLogs.value = [] // ダンジョン開始時にログをクリア
    explorationCombatLogs.value = []
    dungeonLogs.value = [] // ダンジョン開始時にログをクリア
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
    isDebugMode.value = false
    isDungeonRunning.value = false
    currentEvent.value = null
    combat.value = null
    enemy.value = null
    addInfo('探索を中断しました')
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
    explorationCombatLogs,
    dungeonLogs,
    showChestModal,
    lastLootSource,
    hasPendingChest,
    isDungeonRunning,
    currentStage,
    totalStages,
    currentEvent,
    chestCount,
    infoMessages,
    chestLootHistory,
    battleSpeed,
    isAutoRunning,
    startDungeonRun,
    proceedNextBattle,
    processVictory,
    openPendingChest,
    openChests,
    abandonDungeon,
    addToAvailableIfNeeded,
    pruneAvailableWeapons,
    changeSpeed,
    stopAuto,
    startAuto,
    ensureAllocations,
    allocateStat,
    allocateMaxHp,
    resetAllocatedStats,
    startDebugBattle,
    isDebugMode
  }
}
