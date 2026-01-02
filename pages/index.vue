<template>
  <div id="app">
    <header class="app-header">
      <h1>⚔️ オートバトラー</h1>
    </header>

    <div class="top-actions">
      <div class="top-actions-left">
        <button class="btn btn-primary" @click="showSaveMenu = true">💾 セーブ / ロード</button>
        <button class="btn btn-secondary" @click="showDebugWeaponModal = true">🐞 デバッグ武器</button>
        <button class="btn btn-special" @click="showDebugEnemyModal = true">🐞 デバッグ敵</button>
      </div>
      <div class="top-actions-right">
        <button class="btn btn-settings" @click="showSettings = true">⚙️ 設定</button>
      </div>
    </div>

    <div class="game-container">
      <div class="control-grid">
        <DungeonPanel
          :selectedDungeonId="selectedDungeonId"
          :dungeonOptions="dungeonOptions"
          :selectedDungeon="selectedDungeon"
          :currentStage="currentStage"
          :totalStages="totalStages"
          :currentEventLabel="currentEventLabel"
          :chestCount="chestCount"
          :hasPendingChest="hasPendingChest"
          :isDebugMode="isDebugMode"
          :isRunLocked="isRunLocked"
          :isDungeonRunning="isDungeonRunning"
          :isAutoRunning="isAutoRunning"
          :battleSpeed="battleSpeed"
          :infoMessages="infoMessages"
          :isDungeonUnlocked="isDungeonUnlocked"
          :canProceedNext="!!combat && combat.isGameOver() && !isRunLocked"
          :autoDisabled="!combat || combat.isGameOver()"
          @update:selectedDungeonId="selectedDungeonId = $event; currentLevel = 1"
          @start="handleStartBattle"
          @next="handleNextBattle"
          @abandon="handleAbandon"
          @open-chest="openPendingChest"
          @toggle-auto="toggleAuto"
          @change-speed="changeSpeed"
        />
      </div>

      <div class="battle-area">
        <PlayerInfo 
          :player="player" 
          :isRunLocked="isRunLocked"
          :nextSlotCost="nextSlotCost"
          :canPurchaseSlot="canPurchaseSlot"
          @openWeaponManager="showWeaponSelection = true"
          @openStatManager="showStatManager = true"
          @openSellMenu="showSellMenu = true"
          @purchase-slot="purchaseWeaponSlot"
          @updatePlayerName="updatePlayerName"
        />

        <div>
          <CombatLog :logs="combatLogs" />
          <ExplorationLogPanel
            v-if="explorationTimeline.length"
            :explorationTimeline="explorationTimeline"
          />
          <div v-if="combat?.isGameOver()" class="battle-result">
            <div v-if="combat.isPlayerVictory()" class="victory">
              <h2>🎉 勝利！</h2>
              <p>次のレベルに挑戦しましょう</p>
            </div>
            <div v-else class="defeat">
              <h2>💀 敗北...</h2>
              <p>装備を見直して再挑戦しましょう</p>
            </div>
          </div>
        </div>

        <EnemyInfo v-if="enemy" :enemy="enemy" />
      </div>
    </div>

    <WeaponSelectionModal
      :show="showWeaponSelection"
      :player="player"
      :filteredWeapons="filteredWeapons"
      :availableWeapons="availableWeapons"
      :rarityFilter="rarityFilter"
      :typeFilter="typeFilter"
      :sortBy="sortBy"
      :selectedTags="selectedTags"
      :selectedEffects="selectedEffects"
      :availableTags="availableTags"
      :availableEffects="availableEffects"
      :isRunLocked="isRunLocked"
      @close="showWeaponSelection = false"
      @remove="removeWeapon"
      @select="equipWeapon"
      @openSellMenu="showSellMenu = true"
      @update:rarityFilter="rarityFilter = $event"
      @update:typeFilter="typeFilter = $event"
      @update:sortBy="sortBy = $event"
      @update:selectedTags="selectedTags = $event"
      @update:selectedEffects="selectedEffects = $event"
    />

    <StatManagerModal
      v-if="showStatManager"
      :show="showStatManager"
      :player="player"
      :tempStatAlloc="tempStatAlloc"
      :allocatedStats="allocatedStats"
      :totalTempAlloc="totalTempAlloc"
      :isRunLocked="isRunLocked"
      @close="showStatManager = false"
      @apply="applyStatAllocation"
      @reset="handleResetStats"
      @reset-single-stat="resetSingleStat"
      @update:tempStatAlloc="Object.assign(tempStatAlloc, $event)"
    />

    <SettingsModal
      :show="showSettings"
      :combatLogsLength="combatLogs.length"
      :explorationLogsLength="explorationCombatLogs.length"
      :dungeonLogsLength="dungeonLogs.length"
      @close="showSettings = false"
      @export-combat="exportCombatLog"
      @export-exploration="exportExplorationCombatLog"
      @export-dungeon="exportDungeonLog"
    />

    <DebugWeaponModal
      :show="showDebugWeaponModal"
      :presets="presetWeapons"
      @close="showDebugWeaponModal = false"
      @select="handleSelectDebugWeapon"
      @custom="handleCustomDebugWeapon"
    />

    <DebugEnemyModal
      :show="showDebugEnemyModal"
      :enemies="debugEnemyPresets"
      @close="showDebugEnemyModal = false"
      @select="handleSelectDebugEnemy"
    />

    <SaveLoadModal
      :show="showSaveMenu"
      :saveEntries="saveEntries"
      :formatTime="formatTime"
      @close="showSaveMenu = false"
      @save-entry="handleSaveEntry"
      @load-entry="handleLoadEntry"
      @download-entry="handleDownloadEntry"
      @delete-entry="handleDeleteEntry"
      @upload="uploadSaveData"
      @hard-reset="handleHardReset"
    />

    <!-- 売却メニューモーダル -->
    <SellMenuModal
      :show="showSellMenu"
      :availableWeapons="availableWeapons"
      :selectedSellWeapons="selectedSellWeapons"
      :canSellWeapon="canSellWeapon"
      :initialWeaponId="initialWeapon.id"
      @close="showSellMenu = false"
      @toggle="toggleSelectWeapon"
      @sell="sellSelectedWeapons"
    />

    <!-- 装備置き換え選択モーダル -->
    <WeaponReplaceModal
      :show="showEquipSelection"
      :selectedWeapon="selectedWeapon"
      :playerWeapons="player.weapons"
      :maxSlots="player.weaponSlots"
      @close="showEquipSelection = false"
      @replace-weapon="replaceWeapon"
      @add-to-empty-slot="addWeaponToEmptySlot"
    />

    <!-- 宝箱モーダル -->
    <ChestModal
      :show="showChestModal"
      :chestCount="chestCount"
      :chestOpenCount="chestOpenCount"
      :isChestOpening="isChestOpening"
      :lastLootSourceLabel="lastLootSourceLabel"
      :chestLootHistory="chestLootHistory"
      :chestDropCards="chestDropCards"
      :formatTime="formatTime"
      @close="showChestModal = false"
      @open-chests="handleOpenChestsWrapper"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Player, Weapon } from '~/types'
import { TAG_DEFINITIONS } from '~/data/synergies'
import { createInitialPlayer, createInitialWeapon } from '~/utils/playerInitialization'

// Composables
import { useGameOrchestrator } from '~/composables/useGameOrchestrator'
import { useGameState } from '~/composables/useGameState'
import { useWeaponFilters } from '~/composables/useWeaponFilters'
import { useChestSystem } from '~/composables/useChestSystem'
import { useWeaponEquip } from '~/composables/useWeaponEquip'
import { useStatAllocation } from '~/composables/useStatAllocation'
import { useWeaponSell } from '~/composables/useWeaponSell'
import { useDebugTools } from '~/composables/useDebugTools'
import { useGameHandlers } from '~/composables/useGameHandlers'
import { useSaveSystem } from '~/composables/useSaveSystem'
import { useSaveLoadHandlers } from '~/composables/useSaveLoadHandlers'
import { useLogExport } from '~/composables/useLogExport'
import { useUIState } from '~/composables/useUIState'
import { getNextWeaponSlotCost } from '~/utils/weaponSlots'

// Components
import PlayerInfo from '~/components/PlayerInfo.vue'
import EnemyInfo from '~/components/EnemyInfo.vue'
import CombatLog from '~/components/CombatLog.vue'
import DungeonPanel from '~/components/DungeonPanel.vue'
import ExplorationLogPanel from '~/components/ExplorationLogPanel.vue'
import WeaponSelectionModal from '~/components/WeaponSelectionModal.vue'
import SellMenuModal from '~/components/SellMenuModal.vue'
import StatManagerModal from '~/components/StatManagerModal.vue'
import SaveLoadModal from '~/components/SaveLoadModal.vue'
import SettingsModal from '~/components/SettingsModal.vue'
import ChestModal from '~/components/ChestModal.vue'
import WeaponReplaceModal from '~/components/WeaponReplaceModal.vue'
import DebugWeaponModal from '~/components/DebugWeaponModal.vue'
import DebugEnemyModal from '~/components/DebugEnemyModal.vue'

// 初期データ
const initialWeapon = createInitialWeapon()
const player = reactive<Player>(createInitialPlayer())
const availableWeapons = ref<Weapon[]>([])

// UI状態管理
const { showWeaponSelection, showStatManager, showDebugWeaponModal, showDebugEnemyModal, showToast } = useUIState()
const debugTagOptions = computed(() => Object.keys(TAG_DEFINITIONS))

// ゲーム状態管理
const {
  currentLevel,
  selectedDungeonId,
  dungeonOptions,
  isDungeonUnlocked,
  selectedDungeon
} = useGameState(player)

const {
  enemy,
  combat,
  combatLogs,
  explorationCombatLogs,
  dungeonLogs,
  showChestModal,
  lastLootSource,
  hasPendingChest,
  chestCount,
  isDungeonRunning,
  currentStage,
  totalStages,
  currentEvent,
  infoMessages,
  chestLootHistory,
  battleSpeed,
  isAutoRunning,
  startDungeonRun,
  proceedNextBattle,
  openPendingChest,
  openChests,
  addToAvailableIfNeeded,
  pruneAvailableWeapons,
  changeSpeed,
  stopAuto,
  startAuto,
  allocateStat,
  allocateMaxHp,
  resetAllocatedStats,
  abandonDungeon,
  startDebugBattle,
  isDebugMode
} = useGameOrchestrator(player, availableWeapons, selectedDungeon, currentLevel)

const isRunLocked = computed(() => isDungeonRunning.value && !(combat.value?.isGameOver()))

// 宝箱システム
const {
  chestOpenCount,
  isChestOpening,
  chestDropCards,
  handleOpenChests
} = useChestSystem(chestCount, hasPendingChest, infoMessages, openChests)

// 武器装備システム
const {
  selectedWeapon,
  showEquipSelection,
  equipWeapon: equipWeaponFromComposable,
  replaceWeapon: replaceWeaponFromComposable,
  addWeaponToEmptySlot: addWeaponToEmptySlotFromComposable,
  removeWeapon
} = useWeaponEquip(player, isRunLocked, addToAvailableIfNeeded, pruneAvailableWeapons)

// ステータス割り振りシステム
const {
  tempStatAlloc,
  totalTempAlloc,
  allocatedStats,
  resetTempAllocation,
  applyStatAllocation,
  handleReset: handleResetStats,
  resetSingleStat
} = useStatAllocation(player, isRunLocked, allocateStat, allocateMaxHp, resetAllocatedStats, showToast)

// 武器売却システム
const {
  showSellMenu,
  selectedSellWeapons,
  canSellWeapon,
  toggleSelectWeapon,
  sellSelectedWeapons
} = useWeaponSell(player, availableWeapons, initialWeapon.id, showToast)

// デバッグツール
const {
  presetWeapons,
  debugEnemyPresets,
  grantDebugWeapon,
  grantCustomDebugWeapon,
  startDebugSpar
} = useDebugTools(player, debugTagOptions, startDebugBattle, showToast)

const handleSelectDebugWeapon = (presetId: string) => {
  grantDebugWeapon(presetId)
  showDebugWeaponModal.value = false
}

const handleCustomDebugWeapon = () => {
  grantCustomDebugWeapon()
  showDebugWeaponModal.value = false
}

const handleSelectDebugEnemy = (templateId?: string) => {
  startDebugSpar(templateId)
  showDebugEnemyModal.value = false
}

const nextSlotCost = computed(() => getNextWeaponSlotCost(player.weaponSlots))
const canPurchaseSlot = computed(() => player.gold >= nextSlotCost.value)

const purchaseWeaponSlot = () => {
  const cost = nextSlotCost.value
  if (!cost || isRunLocked.value) return
  if (player.gold < cost) {
    showToast('ゴールドが足りません', 'error')
    return
  }

  player.gold -= cost
  player.weaponSlots += 1
  showToast(`武器スロットを解放しました (${player.weaponSlots}枠目)`, 'info')
}

// ゲームハンドラー
const {
  handleStartBattle,
  handleNextBattle,
  toggleAuto,
  handleAbandon
} = useGameHandlers(
  selectedDungeon,
  isDungeonUnlocked,
  isDungeonRunning,
  hasPendingChest,
  infoMessages,
  combat,
  isAutoRunning,
  startDungeonRun,
  proceedNextBattle,
  abandonDungeon,
  startDebugBattle,
  stopAuto,
  startAuto,
  showToast
)

const lastLootSourceLabel = computed(() => {
  const map: Record<string, string> = { boss: 'ボス', named: 'ネームド', elite: 'エリート', normal: '通常' }
  if (!lastLootSource.value) return '不明'
  return map[lastLootSource.value] ?? lastLootSource.value
})

// 武器フィルタ・ソート
const {
  rarityFilter,
  typeFilter,
  selectedTags,
  selectedEffects,
  sortBy,
  availableTags,
  availableEffects,
  filteredWeapons
} = useWeaponFilters(availableWeapons)

// セーブシステム
const {
  saveEntries,
  buildSaveData,
  buildEnvelope,
  validateSaveData,
  applySaveData,
  saveToLocal,
  loadFromLocal,
  refreshManualSlots,
  encryptAndCompress,
  decryptAndDecompress
} = useSaveSystem(
  player,
  availableWeapons,
  selectedDungeonId,
  currentLevel,
  combatLogs,
  explorationCombatLogs,
  dungeonLogs,
  dungeonOptions,
  showToast
)

// セーブロードハンドラー
const {
  showSettings,
  showSaveMenu,
  handleSaveEntry,
  handleLoadEntry,
  handleDownloadEntry,
  handleDeleteEntry,
  uploadSaveData,
  handleHardReset,
  formatTime
} = useSaveLoadHandlers(
  buildSaveData,
  buildEnvelope,
  applySaveData,
  validateSaveData,
  saveToLocal,
  refreshManualSlots,
  encryptAndCompress,
  decryptAndDecompress,
  showToast
)

// ログエクスポート
const { exportCombatLog, exportExplorationCombatLog, exportDungeonLog } = useLogExport(
  player,
  selectedDungeon,
  combatLogs,
  explorationCombatLogs,
  dungeonLogs,
  showToast
)

const currentEventLabel = computed(() => {
  if (!isDungeonRunning.value) return '待機'
  if (hasPendingChest.value) return '宝箱'
  if (currentEvent.value === 'chest') return '宝箱'
  if (combat.value?.isGameOver()) return '決着'
  return '戦闘'
})

const explorationTimeline = computed(() => {
  const maxItems = 15
  return explorationCombatLogs.value
    .slice(-maxItems)
    .map((entry, idx) => ({ ...entry, id: `${entry.dungeonName}-${entry.stage}-${entry.enemyName}-${idx}` }))
    .reverse()
})

const handleOpenChestsWrapper = (count?: number) => {
  handleOpenChests(count, showToast)
}

function equipWeapon(weapon: Weapon) {
  equipWeaponFromComposable(weapon, removeWeapon)
}

function replaceWeapon(oldIndex: number) {
  replaceWeaponFromComposable(oldIndex, showToast)
}

function addWeaponToEmptySlot() {
  addWeaponToEmptySlotFromComposable(showToast)
}

function updatePlayerName(newName: string) {
  player.name = newName
}

onMounted(() => {
  loadFromLocal()
  refreshManualSlots()
})

</script>

<style src="~/assets/css/game.css"></style>

