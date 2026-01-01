<template>
  <div id="app">
    <header class="app-header">
      <h1>⚔️ オートバトラー</h1>
      <button class="btn btn-settings" @click="showSettings = true">⚙️ 設定</button>
    </header>

    <div class="game-container">
      <div class="control-grid">
        <div class="panel dungeon-panel">
          <div class="panel-header">
            <h2>ダンジョン</h2>
            <div class="chips">
              <span class="chip">ステージ {{ currentStage }}/{{ totalStages }}</span>
              <span class="chip">状態 {{ currentEventLabel }}</span>
              <span class="chip">宝箱 {{ chestCount }}</span>
              <span v-if="hasPendingChest" class="chip warning">宝箱保留中</span>
            </div>
          </div>

          <div class="dungeon-picker">
            <div class="dungeon-info">
              <label for="dungeon-select">ダンジョン</label>
              <select id="dungeon-select" v-model="selectedDungeonId" :disabled="isRunLocked">
                <option v-for="dungeon in dungeons" :key="dungeon.id" :value="dungeon.id">
                  {{ dungeon.name }} (Lv{{ dungeon.levelRange[0] }}-{{ dungeon.levelRange[1] }})
                </option>
              </select>
            </div>
            <div class="dungeon-desc" v-if="selectedDungeon">
              <div class="dungeon-name">{{ selectedDungeon.name }}</div>
              <div class="dungeon-text">{{ selectedDungeon.description }}</div>
              <div class="dungeon-meta">
                敵レベル: {{ selectedDungeon.levelRange[0] }}-{{ selectedDungeon.levelRange[1] }} / 宝箱確率: {{ Math.round((selectedDungeon.chestChance ?? 0.1) * 100) }}%<br />
                レアリティ傾向: Common {{ Math.round(selectedDungeon.lootWeights.common * 100) }}%・Rare {{ Math.round(selectedDungeon.lootWeights.rare * 100) }}%・Epic {{ Math.round(selectedDungeon.lootWeights.epic * 100) }}%・Legend {{ Math.round(selectedDungeon.lootWeights.legendary * 100) }}%
              </div>
            </div>
          </div>

          <div class="button-row">
            <button class="btn btn-action" @click="handleStartBattle" :disabled="isRunLocked">
              探索開始 (10ステージ)
            </button>
            <button
              class="btn btn-success"
              @click="handleNextBattle"
              :disabled="!combat || !combat.isGameOver() || isRunLocked"
            >
              次のステージへ
            </button>
            <button class="btn btn-danger" @click="handleAbandon" :disabled="!isDungeonRunning">
              探索中止
            </button>
          </div>

          <div v-if="hasPendingChest" class="chest-action">
            <button class="btn btn-special" @click="openPendingChest">
              🎁 宝箱を開く ({{ chestCount }}個保留中)
            </button>
          </div>

          <div class="auto-row">
            <div class="speed-label">AUTO</div>
            <button
              class="btn btn-secondary btn-compact"
              @click="toggleAuto"
              :disabled="!combat || combat.isGameOver()"
            >
              {{ isAutoRunning ? '一時停止' : '再開' }}
            </button>
            <div class="speed-buttons">
              <button
                class="btn btn-secondary btn-compact"
                :class="{ active: battleSpeed === 1 }"
                @click="changeSpeed(1)"
              >
                x1
              </button>
              <button
                class="btn btn-secondary btn-compact"
                :class="{ active: battleSpeed === 2 }"
                @click="changeSpeed(2)"
              >
                x2
              </button>
              <button
                class="btn btn-secondary btn-compact"
                :class="{ active: battleSpeed === 4 }"
                @click="changeSpeed(4)"
              >
                x4
              </button>
            </div>
          </div>

          <div v-if="infoMessages.length" class="info-messages">
            <div v-for="(msg, idx) in infoMessages" :key="idx" class="info-message">
              {{ msg }}
            </div>
          </div>
        </div>
      </div>

      <div class="battle-area">
        <PlayerInfo 
          :player="player" 
          :isRunLocked="isRunLocked"
          @openWeaponManager="showWeaponSelection = true"
          @openStatManager="showStatManager = true"
        />

        <div>
          <CombatLog :logs="combatLogs" />
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

    <div v-if="showWeaponSelection" class="weapon-selection-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>⚙️ 武器の付け替え</h2>
          <button @click="showWeaponSelection = false" class="btn-close">×</button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showWeaponSelection = false">バトルに戻る</button>
        </div>

        <!-- 装備中の武器 -->
        <div class="current-weapons">
          <h3>装備中の武器 ({{ player.weapons.length }}/3)</h3>
          <div v-if="player.weapons.length === 0" class="empty-slot">
            装備武器がありません
          </div>
          <div v-else class="weapon-list">
            <div 
              v-for="weapon in player.weapons"
              :key="weapon.id"
              class="weapon-list-item"
              :style="{ borderColor: getWeaponRarityColor(weapon.rarity) }"
            >
              <div class="weapon-list-info">
                <div class="weapon-list-name">
                  {{ weapon.name }}
                  <span class="weapon-rarity-badge" :style="{ background: getWeaponRarityColor(weapon.rarity) }">{{ weapon.rarity }}</span>
                  <span v-if="weapon.limitBreak && weapon.limitBreak > 0" class="limit-break-badge">⭐+{{ weapon.limitBreak }}</span>
                </div>
                <div class="weapon-list-type">{{ weapon.type }}</div>
                <div class="weapon-description">{{ weapon.description }}</div>
                <!-- 全ステータス表示 -->
                <div class="weapon-list-stats">
                  <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                    <span>⚔️{{ weapon.stats.attack }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                    <span>✨{{ weapon.stats.magic }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                    <span>⚡{{ weapon.stats.speed }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                    <span>🎯{{ weapon.stats.critChance }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                    <span>💥{{ weapon.stats.critDamage }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                    <span>🔮{{ weapon.stats.statusPower }}</span>
                  </Tooltip>
                </div>
                <!-- タグと効果（Tooltipつき） -->
                <div class="weapon-list-tags-effects">
                  <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                    <span class="mini-tag">{{ tag }}</span>
                  </Tooltip>
                  <Tooltip v-for="effect in weapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                    <span class="mini-effect">{{ effect.type }}</span>
                  </Tooltip>
                </div>
              </div>
              <button 
                class="btn btn-danger btn-compact"
                @click.stop="removeWeapon(weapon)"
                :disabled="isRunLocked"
              >
                外す
              </button>
            </div>
          </div>
        </div>

        <!-- 利用可能な武器 -->
        <div class="available-weapons">
          <div class="weapons-header">
            <h3>利用可能な武器 ({{ filteredWeapons.length }})</h3>
            <div class="filter-controls">
              <!-- レア度フィルタ -->
              <select v-model="rarityFilter" class="filter-select">
                <option value="all">全レア度</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
              <!-- タイプフィルタ -->
              <select v-model="typeFilter" class="filter-select">
                <option value="all">全タイプ</option>
                <option value="melee">melee</option>
                <option value="ranged">ranged</option>
                <option value="magic">magic</option>
                <option value="hybrid">hybrid</option>
              </select>
              <!-- タグフィルタ -->
              <div class="tag-filters">
                <label v-for="tag in availableTags" :key="tag" class="tag-filter-label">
                  <input type="checkbox" :value="tag" v-model="selectedTags" />
                  <span>{{ tag }}</span>
                </label>
              </div>
              <!-- ソート -->
              <select v-model="sortBy" class="filter-select">
                <option value="name">名前順</option>
                <option value="rarity">レア度順</option>
                <option value="attack">攻撃力順</option>
                <option value="magic">魔法力順</option>
                <option value="speed">速度順</option>
              </select>
            </div>
          </div>
          <div v-if="filteredWeapons.length === 0" class="empty-slot">
            条件に一致する武器がありません
          </div>
          <div v-else class="weapon-list">
            <div 
              v-for="weapon in filteredWeapons"
              :key="weapon.id"
              class="weapon-list-item"
              :style="{ borderColor: getWeaponRarityColor(weapon.rarity) }"
            >
              <div class="weapon-list-info">
                <div class="weapon-list-name">
                  {{ weapon.name }}
                  <span class="weapon-rarity-badge" :style="{ background: getWeaponRarityColor(weapon.rarity) }">{{ weapon.rarity }}</span>
                  <span v-if="weapon.limitBreak && weapon.limitBreak > 0" class="limit-break-badge">⭐+{{ weapon.limitBreak }}</span>
                </div>
                <div class="weapon-list-type">{{ weapon.type }}</div>
                <div class="weapon-description">{{ weapon.description }}</div>
                <!-- 全ステータス表示 -->
                <div class="weapon-list-stats">
                  <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                    <span>⚔️{{ weapon.stats.attack }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                    <span>✨{{ weapon.stats.magic }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                    <span>⚡{{ weapon.stats.speed }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                    <span>🎯{{ weapon.stats.critChance }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                    <span>💥{{ weapon.stats.critDamage }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                    <span>🔮{{ weapon.stats.statusPower }}</span>
                  </Tooltip>
                </div>
                <!-- タグと効果（Tooltipつき） -->
                <div class="weapon-list-tags-effects">
                  <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                    <span class="mini-tag">{{ tag }}</span>
                  </Tooltip>
                  <Tooltip v-for="effect in weapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                    <span class="mini-effect">{{ effect.type }}</span>
                  </Tooltip>
                </div>
              </div>
              <button 
                class="btn btn-primary btn-compact"
                @click.stop="equipWeapon(weapon)"
                :disabled="isRunLocked || player.weapons.length >= 3"
              >
                装備
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showStatManager" class="loot-modal">
      <div class="loot-content stat-manager-content">
        <div class="modal-header">
          <h2>🧠 ステータス割り振り</h2>
          <button @click="showStatManager = false" class="btn-close">×</button>
        </div>
        <p class="loot-subtitle">残りSP: {{ player.statPoints }}</p>
        
        <div class="stat-sliders">
          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">❤️</span>
              <span class="stat-name">最大HP</span>
              <span class="stat-value">+{{ tempStatAlloc.maxHp * 25 }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              :max="player.statPoints + tempStatAlloc.maxHp"
              v-model.number="tempStatAlloc.maxHp"
              class="stat-slider"
              :disabled="isRunLocked"
            />
            <div class="stat-slider-info">
              現在: {{ player.maxHp }} → {{ player.maxHp + tempStatAlloc.maxHp * 25 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">⚔️</span>
              <span class="stat-name">攻撃力</span>
              <span class="stat-value">+{{ tempStatAlloc.attack * 5 }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              :max="player.statPoints + tempStatAlloc.attack"
              v-model.number="tempStatAlloc.attack"
              class="stat-slider"
              :disabled="isRunLocked"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.attack }} → {{ player.stats.attack + tempStatAlloc.attack * 5 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">🔮</span>
              <span class="stat-name">魔法力</span>
              <span class="stat-value">+{{ tempStatAlloc.magic * 5 }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              :max="player.statPoints + tempStatAlloc.magic"
              v-model.number="tempStatAlloc.magic"
              class="stat-slider"
              :disabled="isRunLocked"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.magic }} → {{ player.stats.magic + tempStatAlloc.magic * 5 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">🛡️</span>
              <span class="stat-name">防御力</span>
              <span class="stat-value">+{{ tempStatAlloc.defense * 3 }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              :max="player.statPoints + tempStatAlloc.defense"
              v-model.number="tempStatAlloc.defense"
              class="stat-slider"
              :disabled="isRunLocked"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.defense }} → {{ player.stats.defense + tempStatAlloc.defense * 3 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">✨</span>
              <span class="stat-name">魔法防御</span>
              <span class="stat-value">+{{ tempStatAlloc.magicDefense * 3 }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              :max="player.statPoints + tempStatAlloc.magicDefense"
              v-model.number="tempStatAlloc.magicDefense"
              class="stat-slider"
              :disabled="isRunLocked"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.magicDefense }} → {{ player.stats.magicDefense + tempStatAlloc.magicDefense * 3 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">⚡</span>
              <span class="stat-name">速度</span>
              <span class="stat-value">+{{ tempStatAlloc.speed * 2 }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              :max="player.statPoints + tempStatAlloc.speed"
              v-model.number="tempStatAlloc.speed"
              class="stat-slider"
              :disabled="isRunLocked"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.speed }} → {{ player.stats.speed + tempStatAlloc.speed * 2 }}
            </div>
          </div>
        </div>

        <div class="stat-manager-actions">
          <button class="btn btn-primary" :disabled="totalTempAlloc === 0 || isRunLocked" @click="applyStatAllocation">
            適用 ({{ totalTempAlloc }}SP使用)
          </button>
          <button class="btn btn-secondary" @click="resetTempAllocation">
            リセット
          </button>
          <button class="btn btn-danger" :disabled="isRunLocked" @click="handleResetStats">
            全リセット ({{ resetCost }}G)
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSettings" class="loot-modal">
      <div class="loot-content">
        <div class="modal-header">
          <h2>⚙️ 設定</h2>
          <button @click="showSettings = false" class="btn-close">×</button>
        </div>

        <div class="save-input-area" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 6px; font-weight: bold;">セーブ名</label>
          <div style="display: flex; gap: 8px;">
            <input v-model="newSaveName" type="text" placeholder="Save" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;" />
            <button class="btn btn-primary" @click="saveState" :disabled="isLoading">💾 セーブ</button>
          </div>
        </div>

        <div class="save-list-area">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">セーブデータ</label>
          <div v-if="saveList.length === 0" style="text-align: center; opacity: 0.6; padding: 20px;">
            セーブデータはまだありません
          </div>
          <div v-else style="display: flex; flex-direction: column; gap: 8px;">
            <div v-for="save in saveList" :key="save.id" style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 8px;">
              <div style="flex: 1;">
                <div style="font-weight: bold;">{{ save.name }}</div>
                <div style="font-size: 12px; opacity: 0.7;">{{ new Date(save.updatedAt).toLocaleString() }}</div>
              </div>
              <button class="btn btn-primary" @click="loadState(save.id)" :disabled="isLoading">ロード</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showChestModal && chestOptions" class="loot-modal">
      <div class="loot-content">
        <div class="confetti"></div>
        <div class="modal-header">
          <h2>🧰 宝箱がドロップ！</h2>
        </div>
        <p class="loot-subtitle">
          {{ lastLootSource === 'named' ? 'ネームドからの豪華報酬' : 'エリートからの報酬' }} - 好きな武器を選択してください
        </p>
        <div class="weapons-grid">
          <div v-for="weapon in chestOptions" :key="weapon.id" class="loot-option">
            <WeaponCard :weapon="weapon" />
            <button class="btn btn-primary" @click="chooseChestWeapon(weapon)">この武器を拾う</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { Player, Weapon, Dungeon } from '~/types'
import { weaponDatabase } from '~/data/weapons'
import { dungeons } from '~/data/dungeons'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'
import Tooltip from '~/components/Tooltip.vue'
import { useGameOrchestrator } from '~/composables/useGameOrchestrator'
import PlayerInfo from '~/components/PlayerInfo.vue'
import EnemyInfo from '~/components/EnemyInfo.vue'
import CombatLog from '~/components/CombatLog.vue'
import WeaponCard from '~/components/WeaponCard.vue'

const player = reactive<Player>({
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
  gold: 0,
  weapons: [
    weaponDatabase[0] // デフォルトは1つのみ
  ],
  statusEffects: [],
  stats: {
    attack: 15,
    magic: 10,
    defense: 5,
    magicDefense: 4,
    speed: 10
  }
})

// デバッグ用: 全武器を所持
const availableWeapons = ref(weaponDatabase.filter(
  w => !player.weapons.find(pw => pw.id === w.id)
))

// 武器フィルタ・ソート
const rarityFilter = ref<string>('all')
const typeFilter = ref<string>('all')
const selectedTags = ref<string[]>([])
const sortBy = ref<string>('name')

const availableTags = computed(() => {
  const allTags = new Set<string>()
  availableWeapons.value.forEach(w => {
    w.tags.forEach(t => allTags.add(t))
  })
  return Array.from(allTags).sort()
})

const filteredWeapons = computed(() => {
  let filtered = availableWeapons.value

  // レア度フィルタ
  if (rarityFilter.value !== 'all') {
    filtered = filtered.filter(w => w.rarity === rarityFilter.value)
  }

  // タイプフィルタ
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(w => w.type === typeFilter.value)
  }

  // タグフィルタ
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(w => 
      selectedTags.value.some(tag => w.tags.includes(tag as any))
    )
  }

  // ソート
  filtered = [...filtered]
  if (sortBy.value === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  } else if (sortBy.value === 'rarity') {
    const rarityOrder: Record<string, number> = { common: 1, rare: 2, epic: 3, legendary: 4 }
    filtered.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])
  } else if (sortBy.value === 'attack') {
    filtered.sort((a, b) => b.stats.attack - a.stats.attack)
  } else if (sortBy.value === 'magic') {
    filtered.sort((a, b) => b.stats.magic - a.stats.magic)
  } else if (sortBy.value === 'speed') {
    filtered.sort((a, b) => b.stats.speed - a.stats.speed)
  }

  return filtered
})

const currentLevel = ref(1)
const selectedDungeonId = ref<string>(dungeons[0]?.id || '')
const selectedDungeon = computed<Dungeon | undefined>(() =>
  dungeons.find(d => d.id === selectedDungeonId.value)
)

const showWeaponSelection = ref(false)
const showStatManager = ref(false)
const showSettings = ref(false)
const isLoading = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'error' | 'loot' | ''>('')

// ステータス割り振り用の一時変数
const tempStatAlloc = reactive({
  maxHp: 0,
  attack: 0,
  magic: 0,
  defense: 0,
  magicDefense: 0,
  speed: 0
})

const totalTempAlloc = computed(() => {
  return tempStatAlloc.maxHp + tempStatAlloc.attack + tempStatAlloc.magic + 
         tempStatAlloc.defense + tempStatAlloc.magicDefense + tempStatAlloc.speed
})

const resetTempAllocation = () => {
  tempStatAlloc.maxHp = 0
  tempStatAlloc.attack = 0
  tempStatAlloc.magic = 0
  tempStatAlloc.defense = 0
  tempStatAlloc.magicDefense = 0
  tempStatAlloc.speed = 0
}

const applyStatAllocation = () => {
  if (isRunLocked.value) {
    showToast('探索中はステータスを操作できません', 'error')
    return
  }
  
  const total = totalTempAlloc.value
  if (total > player.statPoints) {
    showToast('ポイントが不足しています', 'error')
    return
  }

  // HP割り振り
  for (let i = 0; i < tempStatAlloc.maxHp; i++) {
    allocateMaxHp()
  }
  
  // その他ステータス割り振り
  const stats: Array<'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed'> = 
    ['attack', 'magic', 'defense', 'magicDefense', 'speed']
  
  stats.forEach(stat => {
    for (let i = 0; i < tempStatAlloc[stat]; i++) {
      allocateStat(stat)
    }
  })

  resetTempAllocation()
  showToast(`${total}ポイント割り振りました`, 'info')
}

const {
  enemy,
  combat,
  combatLogs,
  showChestModal,
  chestOptions,
  // chestQueue, // 未使用
  lastLootSource,
  hasPendingChest,
  chestCount,
  isDungeonRunning,
  currentStage,
  totalStages,
  currentEvent,
  infoMessages,
  battleSpeed,
  isAutoRunning,
  startDungeonRun,
  proceedNextBattle,
  chooseChestWeapon,
  openPendingChest,
  addToAvailableIfNeeded,
  pruneAvailableWeapons,
  changeSpeed,
  stopAuto,
  startAuto,
  allocateStat,
  allocateMaxHp,
  resetAllocatedStats,
  abandonDungeon
} = useGameOrchestrator(player, availableWeapons, selectedDungeon, currentLevel)

const isRunLocked = computed(() => isDungeonRunning.value && !(combat.value?.isGameOver()))

const saveList = ref<Array<{ id: string; name: string; updatedAt: number }>>([])
const newSaveName = ref('Save')

// オートセーブ機能
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
const triggerAutoSave = () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(async () => {
    await autoSaveData()
  }, 1000) // 1秒後にオートセーブ
}

const autoSaveData = async () => {
  try {
    const saveData = {
      player: player,
      availableWeapons: availableWeapons.value,
      selectedDungeonId: selectedDungeonId.value
    }
    const res = await $fetch('/api/save', {
      method: 'POST',
      body: { id: 'autosave', name: 'AutoSave', data: saveData }
    })
    console.log('オートセーブ完了:', res)
  } catch (e) {
    console.error('オートセーブエラー:', e)
  }
}

// プレイヤーのステータス変更を監視
watch(() => player.stats, () => {
  triggerAutoSave()
}, { deep: true })

// 装備している武器の変更を監視
watch(() => player.weapons, () => {
  triggerAutoSave()
}, { deep: true })

watch(selectedDungeonId, (next) => {
  const dungeon = dungeons.find(d => d.id === next)
  if (dungeon) {
    currentLevel.value = dungeon.levelRange[0]
  }
})

const currentEventLabel = computed(() => {
  if (!isDungeonRunning.value) return '待機'
  if (hasPendingChest.value) return '宝箱'
  if (currentEvent.value === 'chest') return '宝箱'
  if (combat.value?.isGameOver()) return '決着'
  return '戦闘'
})

const resetCost = 100

const addInfoOnce = (msg: string) => {
  if (!infoMessages.value.includes(msg)) {
    infoMessages.value.push(msg)
  }
}

const remindPendingChest = () => {
  if (chestOptions.value?.length) {
    addInfoOnce('宝箱から1つ選んでください')
    return true
  }
  return false
}

const handleStartBattle = () => {
  remindPendingChest()
  startDungeonRun()
}

const handleNextBattle = () => {
  if (remindPendingChest()) return
  proceedNextBattle()
}

const toggleAuto = () => {
  if (!combat.value || combat.value.isGameOver()) return
  isAutoRunning.value ? stopAuto() : startAuto()
}

const handleAbandon = () => {
  if (!isDungeonRunning.value) return
  abandonDungeon()
}

const spendStatPoint = (stat: 'maxHp' | 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed') => {
  if (isRunLocked.value) {
    showToast('探索中はステータスを操作できません', 'error')
    return
  }
  let res
  if (stat === 'maxHp') {
    res = allocateMaxHp()
  } else {
    res = allocateStat(stat)
  }

  if (!res?.ok) {
    if (res?.reason === 'no-points') showToast('ポイントが不足しています', 'error')
    else showToast('割り振りに失敗しました', 'error')
    return
  }
}

const handleResetStats = () => {
  if (isRunLocked.value) {
    showToast('探索中はリセットできません', 'error')
    return
  }
  const res = resetAllocatedStats(resetCost)
  if (!res.ok) {
    if (res.reason === 'no-allocation') showToast('リセットする割り振りがありません', 'error')
    else if (res.reason === 'no-gold') showToast('ゴールドが不足しています', 'error')
    else showToast('リセットに失敗しました', 'error')
    return
  }
  showToast('ステータスをリセットしました', 'info')
}

function equipWeapon(weapon: Weapon) {
  if (isRunLocked.value) return
  if (player.weapons.length >= 3) {
    alert('武器は最大3つまで装備できます')
    return
  }

  player.weapons.push(weapon)
  pruneAvailableWeapons()
}

function removeWeapon(weapon: Weapon) {
  if (isRunLocked.value) return
  const index = player.weapons.findIndex(w => w.id === weapon.id)
  if (index !== -1) {
    player.weapons.splice(index, 1)
    addToAvailableIfNeeded(weapon)
    pruneAvailableWeapons()
  }
}

function getWeaponRarityColor(rarity: string) {
  const colors: Record<string, string> = {
    common: '#95a5a6',
    rare: '#3a86ff',
    epic: '#8338ec',
    legendary: '#ffb800'
  }
  return colors[rarity] || '#95a5a6'
}

function getTagDescription(tag: string) {
  const descriptions: Record<string, string> = {
    fast: '攻撃速度が速い',
    heavy: '高ダメージだが遅い',
    precise: 'クリティカル率が高い',
    elemental: '属性攻撃を行う',
    cursed: '状態異常を付与する',
    bleeding: '出血効果を付与する'
  }
  return descriptions[tag] || ''
}

function getStatusDescription(type: string) {
  return StatusEffectSystem.getStatusDescription(type as any)
}

async function saveState() {
  try {
    isLoading.value = true
    const payload = serializeState()
    const profileId = `save_${Date.now()}`
    await $fetch('/api/save', {
      method: 'POST',
      body: {
        profileId,
        profileName: newSaveName.value,
        state: payload
      }
    })
    await fetchSaveList()
    newSaveName.value = 'Save'
    showToast('セーブしました', 'info')
  } catch (e: any) {
    console.error(e)
    showToast('セーブに失敗しました', 'error')
  } finally {
    isLoading.value = false
  }
}

async function fetchSaveList() {
  try {
    const res = await $fetch<{ profiles: Array<{ id: string; name: string; updatedAt: number }> }>('/api/saves')
    saveList.value = res.profiles || []
  } catch (e) {
    console.error('Failed to fetch save list', e)
  }
}

async function loadState(profileId?: string) {
  try {
    isLoading.value = true
    const id = profileId || saveList.value[0]?.id || 'default'
    const res = await $fetch<{ state: any }>('/api/load', { query: { profileId: id } })
    deserializeState(res.state)
    stopAuto()
    showToast('ロードしました', 'info')
    showSettings.value = false
  } catch (e) {
    showToast('ロードに失敗しました', 'error')
  } finally {
    isLoading.value = false
  }
}

function serializeState() {
  return {
    selectedDungeonId: selectedDungeonId.value,
    currentLevel: currentLevel.value,
    player: {
      name: player.name,
      level: player.level,
      exp: player.exp,
      nextLevelExp: player.nextLevelExp,
      maxHp: player.maxHp,
      currentHp: player.currentHp,
      statPoints: player.statPoints,
      allocatedStats: player.allocatedStats,
      gold: player.gold,
      statusEffects: player.statusEffects,
      stats: player.stats,
      weapons: player.weapons.map(w => w.id)
    },
    availableWeapons: availableWeapons.value.map(w => w.id)
  }
}

function deserializeState(state: any) {
  if (!state) return
  selectedDungeonId.value = state.selectedDungeonId ?? selectedDungeonId.value
  currentLevel.value = state.currentLevel ?? 1

  player.name = state.player?.name ?? 'プレイヤー'
  player.level = state.player?.level ?? 1
  player.exp = state.player?.exp ?? 0
  player.nextLevelExp = state.player?.nextLevelExp ?? 100
  player.maxHp = state.player?.maxHp ?? 200
  player.currentHp = state.player?.currentHp ?? player.maxHp
  player.statPoints = state.player?.statPoints ?? 0
  player.allocatedStats = state.player?.allocatedStats ?? {
    maxHp: 0,
    attack: 0,
    magic: 0,
    defense: 0,
    magicDefense: 0,
    speed: 0
  }
  player.gold = state.player?.gold ?? 0
  player.statusEffects = state.player?.statusEffects ?? []
  player.stats = state.player?.stats ?? {
    attack: 15,
    magic: 10,
    defense: 5,
    magicDefense: 4,
    speed: 10
  }

  const toWeapon = (id: string) => weaponDatabase.find(w => w.id === id)
  player.weapons = (state.player?.weapons ?? [])
    .map((id: string) => toWeapon(id))
    .filter(Boolean) as Weapon[]

  availableWeapons.value = (state.availableWeapons ?? [])
    .map((id: string) => toWeapon(id))
    .filter(Boolean) as Weapon[]

  const dungeon = selectedDungeon.value
  if (dungeon) {
    currentLevel.value = Math.min(
      dungeon.levelRange[1],
      Math.max(dungeon.levelRange[0], currentLevel.value)
    )
  }

  pruneAvailableWeapons()
}

function showToast(message: string, type: 'info' | 'error' | 'loot') {
  toastMessage.value = message
  toastType.value = type
}

</script>

<style scoped>
#app {
  max-width: 1400px;
  margin: 0 auto;
  background: #0f0f1e;
  min-height: 100vh;
  padding: 20px;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.app-header h1 {
  flex: 1;
  text-align: center;
  margin: 0;
}

.btn-settings {
  padding: 8px 16px;
  font-size: 14px;
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-settings:hover:not(:disabled) {
  background: #363942;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.subtitle {
  font-size: 18px;
  opacity: 0.85;
  color: #a0a0a0;
}

.game-container {
  background: rgba(15, 20, 50, 0.6);
  border-radius: 20px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(79, 172, 254, 0.2);
}

.dungeon-picker {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.dungeon-info label {
  display: block;
  color: #ecf0f1;
  font-weight: bold;
  margin-bottom: 6px;
}

.dungeon-info select {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.dungeon-desc {
  background: rgba(0, 0, 0, 0.4);
  padding: 12px 14px;
  border-radius: 12px;
  color: #d0d0d0;
  line-height: 1.5;
  border: 1px solid rgba(79, 172, 254, 0.15);
}

.dungeon-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.dungeon-meta {
  font-size: 13px;
  opacity: 0.8;
}

.battle-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.speed-row {
  margin-top: -4px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.speed-label {
  color: #ecf0f1;
  font-weight: bold;
  letter-spacing: 1px;
}

.speed-buttons {
  display: flex;
  gap: 8px;
}

.run-status {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.run-chip {
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #ecf0f1;
  font-weight: bold;
  border: 1px solid rgba(79, 172, 254, 0.2);
}

.stat-alloc {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(79, 172, 254, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.stat-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #ecf0f1;
}

.stat-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-manager-content {
  max-width: 600px;
  width: 100%;
}

.stat-sliders {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
}

.stat-slider-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-slider-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.stat-icon {
  font-size: 20px;
}

.stat-name {
  flex: 1;
  font-weight: bold;
  font-size: 16px;
}

.stat-value {
  color: #4facfe;
  font-weight: bold;
  font-size: 16px;
}

.stat-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.stat-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.stat-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.6);
}

.stat-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.stat-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.6);
}

.stat-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stat-slider-info {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
}

.stat-manager-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-compact {
  padding: 6px 12px;
  font-size: 13px;
}

.btn.active {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3a8eef;
}

.btn-action {
  background: var(--color-accent-primary);
  color: white;
}

.btn-action:hover:not(:disabled) {
  background: #3a8eef;
}

.btn-success {
  background: var(--color-success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #00b548;
}

.btn-secondary {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: #363942;
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e63028;
}

.battle-area {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
}

.control-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 900px) {
  .control-grid {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-divider);
}

.panel-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  background: var(--color-bg-tertiary);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.chip.warning {
  background: rgba(255, 184, 0, 0.1);
  color: var(--color-highlight);
  border-color: rgba(255, 184, 0, 0.3);
}

.chip.warning {
  background: rgba(255, 184, 0, 0.2);
  border-color: rgba(255, 184, 0, 0.5);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}

.auto-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chest-action {
  margin: 12px 0;
}

.btn-special {
  background: var(--color-highlight);
  color: var(--color-bg-primary);
  font-weight: 600;
}

.btn-special:hover:not(:disabled) {
  background: #ffc520;
  transform: translateY(-1px);
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.battle-result {
  margin-top: 20px;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.victory {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.defeat {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.victory h2, .defeat h2 {
  font-size: 32px;
  margin-bottom: 10px;
}

.weapon-selection-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 40px 20px;
  overflow-y: auto;
}

.weapon-card.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.modal-content {
  background: #2c3e50;
  border-radius: 20px;
  padding: 30px;
  max-width: 1200px;
  width: 100%;
  max-height: none;
  overflow: visible;
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  background: transparent;
  padding-bottom: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  gap: 8px;
}

.modal-header h2 {
  font-size: 28px;
}

.btn-close {
  background: #e74c3c;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #c0392b;
  transform: rotate(90deg);
}

.current-weapons, .available-weapons {
  margin-bottom: 30px;
}

.current-weapons h3, .available-weapons h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #ecf0f1;
}

.empty-slot {
  padding: 40px 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  opacity: 0.7;
  font-size: 14px;
}

.weapons-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.weapons-header h3 {
  margin: 0;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-select {
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  background: rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 255, 255, 0.5);
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-filter-label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-filter-label:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.4);
}

.tag-filter-label input[type="checkbox"] {
  cursor: pointer;
}

.weapon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.weapon-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.4);
  border-left: 4px solid;
  border-radius: 8px;
  transition: all 0.2s;
}

.weapon-list-item:hover {
  background: rgba(0, 0, 0, 0.6);
}

.weapon-list-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.weapon-list-name {
  font-weight: bold;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.weapon-rarity-badge {
  font-size: 9px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
}

.weapon-description {
  font-size: 11px;
  opacity: 0.6;
  font-style: italic;
}

.limit-break-badge {
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1a1a2e;
  white-space: nowrap;
}

.weapon-list-type {
  font-size: 11px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: bold;
}

.weapon-list-stats {
  display: flex;
  gap: 8px;
  font-size: 11px;
  opacity: 0.9;
  flex-wrap: wrap;
}

.weapon-list-stats span {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.weapon-list-tags-effects {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.mini-tag {
  padding: 2px 6px;
  background: rgba(100, 150, 255, 0.3);
  border: 1px solid rgba(100, 150, 255, 0.6);
  border-radius: 4px;
  font-size: 10px;
  color: #6b9dff;
  cursor: help;
  transition: all 0.2s;
}

.mini-tag:hover {
  background: rgba(100, 150, 255, 0.5);
}

.mini-effect {
  padding: 2px 6px;
  background: rgba(255, 183, 94, 0.3);
  border: 1px solid rgba(255, 183, 94, 0.6);
  border-radius: 4px;
  font-size: 10px;
  color: #ffb75a;
  cursor: help;
  transition: all 0.2s;
}

.mini-effect:hover {
  background: rgba(255, 183, 94, 0.5);
}

.weapons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.loot-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  padding: 20px;
  overflow-y: auto;
}

.loot-content {
  background: #1f2937;
  color: white;
  padding: 30px;
  border-radius: 18px;
  width: 100%;
  max-width: 1200px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
}

.confetti {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.7) 2px, transparent 0),
    radial-gradient(circle at 80% 10%, rgba(255, 231, 150, 0.9) 3px, transparent 0),
    radial-gradient(circle at 30% 80%, rgba(178, 235, 242, 0.9) 3px, transparent 0),
    radial-gradient(circle at 60% 50%, rgba(236, 179, 255, 0.9) 3px, transparent 0),
    radial-gradient(circle at 90% 70%, rgba(255, 183, 94, 0.9) 3px, transparent 0);
  opacity: 0.5;
  animation: drift 6s linear infinite;
  pointer-events: none;
}

@keyframes drift {
  0% { transform: translateY(-10px) rotate(0deg); }
  50% { transform: translateY(10px) rotate(180deg); }
  100% { transform: translateY(-10px) rotate(360deg); }
}

.loot-subtitle {
  margin-bottom: 16px;
  opacity: 0.85;
}

.loot-option {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loot-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #2c3e50;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.loot-title {
  font-weight: bold;
  font-size: 16px;
}

.loot-desc {
  font-size: 14px;
  opacity: 0.9;
}

.chest-banner {
  background: linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%);
  margin-top: 12px;
}

.toast {
  position: fixed;
  top: 16px;
  right: 20px;
  max-width: 360px;
  padding: 14px 18px;
  border-radius: 12px;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
  z-index: 1500;
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  animation: toast-pop 0.25s ease;
}

.toast.error {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.toast.loot {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 12px 24px rgba(250, 183, 94, 0.35);
}

.info-messages {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(79, 172, 254, 0.2);
  border-radius: 10px;
  max-height: 180px;
  overflow-y: auto;
}

.info-message {
  background: rgba(255, 255, 255, 0.08);
  padding: 8px 10px;
  border-radius: 8px;
  font-weight: bold;
}

@keyframes toast-pop {
  0% { transform: translateY(10px) scale(0.96); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes toast-fade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
