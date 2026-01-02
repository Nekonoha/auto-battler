/**
 * ゲーム進行オーケストレータ (分解版)
 * 
 * 責務:
 * - 複数のコンポーザブルを統合
 * - ダンジョン進行全体の調整
 * - 勝敗時の処理フロー
 * 
 * 個別の責務は以下に分割:
 * - useDungeonFlow: ステージ進行
 * - useAutoRun: オートラン制御
 * - useGameConfig: 設定・初期化
 * - useExperience: 経験値
 * - useLootSystem: 戦利品
 * - useBattleFlow: 戦闘流れ
 */

import { type Ref, type ComputedRef } from 'vue'
import type { Player, Dungeon } from '~/types'
import { useExperience } from './useExperience'
import { useLootSystem } from './useLootSystem'
import { useDungeonFlow } from './useDungeonFlow'
import { useAutoRun, type BattleSpeed } from './useAutoRun'
import { useGameConfig } from './useGameConfig'
import { dungeons } from '~/data/dungeons'



/**
 * ゲーム進行の統合オーケストレータ
 */
export function useGameOrchestrator(
  player: Player,
  availableWeapons: Ref<any[]>,
  selectedDungeon: ComputedRef<Dungeon | undefined>,
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
    currentStage,
    totalStages,
    isDungeonRunning,
    isDebugMode,
    currentEvent,
    infoMessages,
    enemy,
    combat,
    combatLogs,
    explorationCombatLogs,
    dungeonLogs,
    getRandomTier,
    addInfo,
    resetPlayerState,
    startStageBattle,
    startNextStage,
    startDebugBattle,
    abandonDungeon: abandonDungeonFlow,
    runTurn,
    goNextBattle
  } = useDungeonFlow(player, selectedDungeon, currentLevel)

  const {
    isAutoRunning,
    battleSpeed,
    changeSpeed: changeSpeedAuto,
    startAuto,
    stopAuto
  } = useAutoRun(combat, runTurn, {
    onTurnComplete: () => {
      if (combat.value?.isGameOver()) {
        processVictory()
        handleBattleCompletion()
      }
    }
  })

  const {
    ensureAllocations,
    allocateStat,
    allocateMaxHp,
    resetAllocatedStats,
    ensureUnlockedDungeons,
    ensureWeaponSlots
  } = useGameConfig(player)

  // 初期化処理
  ensureUnlockedDungeons()
  ensureWeaponSlots()

  // ゴールド報酬計算
  const calculateGoldReward = (foe: { level: number; tier: string }) => {
    const base = 12 + foe.level * 6
    const levelScale = Math.pow(1.04, Math.max(0, foe.level - 1))
    const tierMultiplier = foe.tier === 'boss' ? 3 : foe.tier === 'named' ? 2.1 : foe.tier === 'elite' ? 1.4 : 1
    return Math.floor(base * tierMultiplier * levelScale)
  }

  // 勝利時の処理
  const processVictory = () => {
    if (!enemy.value) return
    const { expGained, levelUps } = grantExpForEnemy(enemy.value)
    infoMessages.value.push(`+${expGained} EXP 獲得`)
    if (levelUps > 0) infoMessages.value.push(`レベルアップ！ Lv.${player.level}`)

    const goldGained = calculateGoldReward(enemy.value)
    player.gold += goldGained
    infoMessages.value.push(`+${goldGained} G 獲得`)

    const loot = handleVictoryLoot(enemy.value)
    if (loot.type === 'weapon') {
      infoMessages.value.push(`${loot.weapon.name} を獲得！`)
    }
    if (loot.type === 'chest') {
      infoMessages.value.push(loot.source === 'named' ? '豪華な宝箱が出現！' : '宝箱が出現！')
    }
  }

  // 戦闘終了時の処理
  const handleBattleCompletion = () => {
    if (!combat.value?.isGameOver()) return

    if (combat.value.isPlayerVictory()) {
      if (isDungeonRunning.value) {
        goNextBattle(() => {})
        currentEvent.value = null
        proceedNextBattle()
      }
      return
    }

    // 敗北時
    stopAuto()
    isDungeonRunning.value = false
    currentEvent.value = null
    infoMessages.value.push('探索に失敗しました。装備を整えて再挑戦しましょう')
  }

  // ダンジョン開始
  const startDungeonRun = () => {
    const dungeon = selectedDungeon.value
    if (!dungeon || !player.unlockedDungeons.includes(dungeon.id)) {
      infoMessages.value.push('未解放のダンジョンです')
      return
    }
    infoMessages.value = []
    resetPlayerState()
    combatLogs.value = []
    explorationCombatLogs.value = []
    dungeonLogs.value = []
    isDungeonRunning.value = true
    currentStage.value = 0
    currentEvent.value = null
    proceedNextBattle()
    startAuto()
  }

  // 次のバトルに進む
  const proceedNextBattle = () => {
    if (!isDungeonRunning.value) return

    if (currentStage.value >= totalStages) {
      isDungeonRunning.value = false
      currentEvent.value = null
      infoMessages.value.push('ダンジョン探索完了！')

      if (selectedDungeon.value) {
        const nextDungeons = dungeons.filter(d => d.prereq === selectedDungeon.value?.id)
        if (nextDungeons.length > 0) {
          const nextDungeon = nextDungeons[0]
          if (!player.unlockedDungeons.includes(nextDungeon.id)) {
            player.unlockedDungeons.push(nextDungeon.id)
            infoMessages.value.push(`${nextDungeon.name} が解放されました！`)
          }
        }
      }
      stopAuto()
      return
    }

    currentStage.value += 1
    const isBossStage = currentStage.value >= totalStages
    const dungeon = selectedDungeon.value
    const chestChance = (dungeon as any)?.chestChance ?? 0.1
    const event = isBossStage ? 'battle' : Math.random() < chestChance ? 'chest' : 'battle'
    currentEvent.value = event as 'battle' | 'chest'

    if (event === 'chest') {
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
      proceedNextBattle()
      return
    }

    const forcedTier = isBossStage ? 'boss' : getRandomTier(dungeon)
    startStageBattle({ forcedTier })
  }

  const changeSpeed = (speed: BattleSpeed) => {
    changeSpeedAuto(speed)
  }

  return {
    // Combat state
    enemy,
    combat,
    combatLogs,
    explorationCombatLogs,
    dungeonLogs,

    // Dungeon state
    currentStage,
    totalStages,
    isDungeonRunning,
    currentEvent,
    isDebugMode,
    infoMessages,

    // Loot state
    showChestModal,
    lastLootSource,
    hasPendingChest,
    chestCount,
    chestLootHistory,

    // AutoRun state
    isAutoRunning,
    battleSpeed,

    // Methods
    startDungeonRun,
    proceedNextBattle,
    startDebugBattle,
    processVictory,
    changeSpeed,
    stopAuto,
    startAuto,
    openPendingChest,
    openChests,
    abandonDungeon: abandonDungeonFlow,
    addToAvailableIfNeeded,
    pruneAvailableWeapons,

    // Stat allocation
    ensureAllocations,
    allocateStat,
    allocateMaxHp,
    resetAllocatedStats
  }
}
