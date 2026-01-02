<template>
  <div v-if="show" class="loot-modal">
    <div class="loot-content stat-manager-content">
      <div class="modal-header">
        <h2>🧠 ステータス割り振り</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      <p class="loot-subtitle">残りSP: {{ player.statPoints }}</p>
      
      <div class="stat-sliders">
        <div class="stat-slider-item">
          <div class="stat-slider-header">
            <span class="stat-icon">❤️</span>
            <span class="stat-name">最大HP</span>
            <button 
              v-if="allocatedStats.maxHp > 0"
              class="btn btn-mini btn-danger"
              @click="resetStat('maxHp')"
              :disabled="isRunLocked"
              title="このステータスのみリセット"
            >
              ↺
            </button>
          </div>
          <div class="stat-spinner">
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('maxHp', -10)"
              :disabled="isRunLocked || tempStatAlloc.maxHp <= 0"
              title="10ずつ減らす"
            >
              -10
            </button>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('maxHp', -1)"
              :disabled="isRunLocked || tempStatAlloc.maxHp <= 0"
              title="1ずつ減らす"
            >
              −
            </button>
            <div class="stat-spinner-display">
              <div class="spinner-point">+{{ tempStatAlloc.maxHp }} P</div>
              <div class="spinner-value">+{{ tempStatAlloc.maxHp * 25 }}</div>
            </div>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('maxHp', 1)"
              :disabled="isRunLocked || tempStatAlloc.maxHp >= maxHpMax"
              title="1ずつ増やす"
            >
              +
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('maxHp', 10)"
              :disabled="isRunLocked || tempStatAlloc.maxHp >= maxHpMax"
              title="10ずつ増やす"
            >
              +10
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('maxHp', 100)"
              :disabled="isRunLocked || tempStatAlloc.maxHp >= maxHpMax"
              title="100ずつ増やす"
            >
              +100
            </button>
          </div>
          <div class="stat-slider-info">
            <div class="stat-current">現在: <strong>{{ player.maxHp }}</strong></div>
            <div class="stat-after">→ <strong>{{ player.maxHp + tempStatAlloc.maxHp * 25 }}</strong></div>
          </div>
          <div class="stat-allocated">割り振り済み: <strong>+{{ allocatedStats.maxHp }}P</strong></div>
        </div>
        
        <div class="stat-slider-item">
          <div class="stat-slider-header">
            <span class="stat-icon">🔮</span>
            <span class="stat-name">状態異常威力</span>
            <button 
              v-if="allocatedStats.statusPower > 0"
              class="btn btn-mini btn-danger"
              @click="resetStat('statusPower')"
              :disabled="isRunLocked"
              title="このステータスのみリセット"
            >
              ↺
            </button>
          </div>
          <div class="stat-spinner">
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('statusPower', -10)"
              :disabled="isRunLocked || tempStatAlloc.statusPower <= 0"
              title="10ずつ減らす"
            >
              -10
            </button>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('statusPower', -1)"
              :disabled="isRunLocked || tempStatAlloc.statusPower <= 0"
              title="1ずつ減らす"
            >
              −
            </button>
            <div class="stat-spinner-display">
              <div class="spinner-point">+{{ tempStatAlloc.statusPower }} P</div>
              <div class="spinner-value">+{{ tempStatAlloc.statusPower * 4 }}</div>
            </div>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('statusPower', 1)"
              :disabled="isRunLocked || tempStatAlloc.statusPower >= statusPowerMax"
              title="1ずつ増やす"
            >
              +
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('statusPower', 10)"
              :disabled="isRunLocked || tempStatAlloc.statusPower >= statusPowerMax"
              title="10ずつ増やす"
            >
              +10
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('statusPower', 100)"
              :disabled="isRunLocked || tempStatAlloc.statusPower >= statusPowerMax"
              title="100ずつ増やす"
            >
              +100
            </button>
          </div>
          <div class="stat-slider-info">
            <div class="stat-current">現在: <strong>{{ player.stats.statusPower }}</strong></div>
            <div class="stat-after">→ <strong>{{ player.stats.statusPower + tempStatAlloc.statusPower * 4 }}</strong></div>
          </div>
          <div class="stat-allocated">割り振り済み: <strong>+{{ allocatedStats.statusPower }}P</strong></div>
        </div>

        <div class="stat-slider-item">
          <div class="stat-slider-header">
            <span class="stat-icon">⚔️</span>
            <span class="stat-name">攻撃力</span>
            <button 
              v-if="allocatedStats.attack > 0"
              class="btn btn-mini btn-danger"
              @click="resetStat('attack')"
              :disabled="isRunLocked"
              title="このステータスのみリセット"
            >
              ↺
            </button>
          </div>
          <div class="stat-spinner">
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('attack', -10)"
              :disabled="isRunLocked || tempStatAlloc.attack <= 0"
              title="10ずつ減らす"
            >
              -10
            </button>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('attack', -1)"
              :disabled="isRunLocked || tempStatAlloc.attack <= 0"
              title="1ずつ減らす"
            >
              −
            </button>
            <div class="stat-spinner-display">
              <div class="spinner-point">+{{ tempStatAlloc.attack }} P</div>
              <div class="spinner-value">+{{ tempStatAlloc.attack * 5 }}</div>
            </div>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('attack', 1)"
              :disabled="isRunLocked || tempStatAlloc.attack >= attackMax"
              title="1ずつ増やす"
            >
              +
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('attack', 10)"
              :disabled="isRunLocked || tempStatAlloc.attack >= attackMax"
              title="10ずつ増やす"
            >
              +10
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('attack', 100)"
              :disabled="isRunLocked || tempStatAlloc.attack >= attackMax"
              title="100ずつ増やす"
            >
              +100
            </button>
          </div>
          <div class="stat-slider-info">
            <div class="stat-current">現在: <strong>{{ player.stats.attack }}</strong></div>
            <div class="stat-after">→ <strong>{{ player.stats.attack + tempStatAlloc.attack * 5 }}</strong></div>
          </div>
          <div class="stat-allocated">割り挫り済み: <strong>+{{ allocatedStats.attack }}P</strong></div>
        </div>

        <div class="stat-slider-item">
          <div class="stat-slider-header">
            <span class="stat-icon">🔮</span>
            <span class="stat-name">魔法力</span>
            <button 
              v-if="allocatedStats.magic > 0"
              class="btn btn-mini btn-danger"
              @click="resetStat('magic')"
              :disabled="isRunLocked"
              title="このステータスのみリセット"
            >
              ↺
            </button>
          </div>
          <div class="stat-spinner">
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('magic', -10)"
              :disabled="isRunLocked || tempStatAlloc.magic <= 0"
              title="10ずつ減らす"
            >
              -10
            </button>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('magic', -1)"
              :disabled="isRunLocked || tempStatAlloc.magic <= 0"
              title="1ずつ減らす"
            >
              −
            </button>
            <div class="stat-spinner-display">
              <div class="spinner-point">+{{ tempStatAlloc.magic }} P</div>
              <div class="spinner-value">+{{ tempStatAlloc.magic * 5 }}</div>
            </div>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('magic', 1)"
              :disabled="isRunLocked || tempStatAlloc.magic >= magicMax"
              title="1ずつ増やす"
            >
              +
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('magic', 10)"
              :disabled="isRunLocked || tempStatAlloc.magic >= magicMax"
              title="10ずつ増やす"
            >
              +10
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('magic', 100)"
              :disabled="isRunLocked || tempStatAlloc.magic >= magicMax"
              title="100ずつ増やす"
            >
              +100
            </button>
          </div>
          <div class="stat-slider-info">
            <div class="stat-current">現在: <strong>{{ player.stats.magic }}</strong></div>
            <div class="stat-after">→ <strong>{{ player.stats.magic + tempStatAlloc.magic * 5 }}</strong></div>
          </div>
          <div class="stat-allocated">割り挫り済み: <strong>+{{ allocatedStats.magic }}P</strong></div>
        </div>

        <div class="stat-slider-item">
          <div class="stat-slider-header">
            <span class="stat-icon">🛡️</span>
            <span class="stat-name">防御力</span>
            <button 
              v-if="allocatedStats.defense > 0"
              class="btn btn-mini btn-danger"
              @click="resetStat('defense')"
              :disabled="isRunLocked"
              title="このステータスのみリセット"
            >
              ↺
            </button>
          </div>
          <div class="stat-spinner">
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('defense', -10)"
              :disabled="isRunLocked || tempStatAlloc.defense <= 0"
              title="10ずつ減らす"
            >
              -10
            </button>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('defense', -1)"
              :disabled="isRunLocked || tempStatAlloc.defense <= 0"
              title="1ずつ減らす"
            >
              −
            </button>
            <div class="stat-spinner-display">
              <div class="spinner-point">+{{ tempStatAlloc.defense }} P</div>
              <div class="spinner-value">+{{ tempStatAlloc.defense * 3 }}</div>
            </div>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('defense', 1)"
              :disabled="isRunLocked || tempStatAlloc.defense >= defenseMax"
              title="1ずつ増やす"
            >
              +
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('defense', 10)"
              :disabled="isRunLocked || tempStatAlloc.defense >= defenseMax"
              title="10ずつ増やす"
            >
              +10
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('defense', 100)"
              :disabled="isRunLocked || tempStatAlloc.defense >= defenseMax"
              title="100ずつ増やす"
            >
              +100
            </button>
          </div>
          <div class="stat-slider-info">
            <div class="stat-current">現在: <strong>{{ player.stats.defense }}</strong></div>
            <div class="stat-after">→ <strong>{{ player.stats.defense + tempStatAlloc.defense * 3 }}</strong></div>
          </div>
          <div class="stat-allocated">割り挫り済み: <strong>+{{ allocatedStats.defense }}P</strong></div>
        </div>

        <div class="stat-slider-item">
          <div class="stat-slider-header">
            <span class="stat-icon">✨</span>
            <span class="stat-name">魔法防御</span>
            <button 
              v-if="allocatedStats.magicDefense > 0"
              class="btn btn-mini btn-danger"
              @click="resetStat('magicDefense')"
              :disabled="isRunLocked"
              title="このステータスのみリセット"
            >
              ↺
            </button>
          </div>
          <div class="stat-spinner">
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('magicDefense', -10)"
              :disabled="isRunLocked || tempStatAlloc.magicDefense <= 0"
              title="10ずつ減らす"
            >
              -10
            </button>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('magicDefense', -1)"
              :disabled="isRunLocked || tempStatAlloc.magicDefense <= 0"
              title="1ずつ減らす"
            >
              −
            </button>
            <div class="stat-spinner-display">
              <div class="spinner-point">+{{ tempStatAlloc.magicDefense }} P</div>
              <div class="spinner-value">+{{ tempStatAlloc.magicDefense * 3 }}</div>
            </div>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('magicDefense', 1)"
              :disabled="isRunLocked || tempStatAlloc.magicDefense >= magicDefenseMax"
              title="1ずつ増やす"
            >
              +
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('magicDefense', 10)"
              :disabled="isRunLocked || tempStatAlloc.magicDefense >= magicDefenseMax"
              title="10ずつ増やす"
            >
              +10
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('magicDefense', 100)"
              :disabled="isRunLocked || tempStatAlloc.magicDefense >= magicDefenseMax"
              title="100ずつ増やす"
            >
              +100
            </button>
          </div>
          <div class="stat-slider-info">
            <div class="stat-current">現在: <strong>{{ player.stats.magicDefense }}</strong></div>
            <div class="stat-after">→ <strong>{{ player.stats.magicDefense + tempStatAlloc.magicDefense * 3 }}</strong></div>
          </div>
          <div class="stat-allocated">割り挫り済み: <strong>+{{ allocatedStats.magicDefense }}P</strong></div>
        </div>

        <div class="stat-slider-item">
          <div class="stat-slider-header">
            <span class="stat-icon">⚡</span>
            <span class="stat-name">速度</span>
            <button 
              v-if="allocatedStats.speed > 0"
              class="btn btn-mini btn-danger"
              @click="resetStat('speed')"
              :disabled="isRunLocked"
              title="このステータスのみリセット"
            >
              ↺
            </button>
          </div>
          <div class="stat-spinner">
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('speed', -10)"
              :disabled="isRunLocked || tempStatAlloc.speed <= 0"
              title="10ずつ減らす"
            >
              -10
            </button>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('speed', -1)"
              :disabled="isRunLocked || tempStatAlloc.speed <= 0"
              title="1ずつ減らす"
            >
              −
            </button>
            <div class="stat-spinner-display">
              <div class="spinner-point">+{{ tempStatAlloc.speed }} P</div>
              <div class="spinner-value">+{{ tempStatAlloc.speed * 2 }}</div>
            </div>
            <button 
              class="btn btn-spinner"
              @click="adjustStat('speed', 1)"
              :disabled="isRunLocked || tempStatAlloc.speed >= speedMax"
              title="1ずつ増やす"
            >
              +
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('speed', 10)"
              :disabled="isRunLocked || tempStatAlloc.speed >= speedMax"
              title="10ずつ増やす"
            >
              +10
            </button>
            <button 
              class="btn btn-spinner btn-spinner-small"
              @click="adjustStat('speed', 100)"
              :disabled="isRunLocked || tempStatAlloc.speed >= speedMax"
              title="100ずつ増やす"
            >
              +100
            </button>
          </div>
          <div class="stat-slider-info">
            <div class="stat-current">現在: <strong>{{ player.stats.speed }}</strong></div>
            <div class="stat-after">→ <strong>{{ player.stats.speed + tempStatAlloc.speed * 2 }}</strong></div>
          </div>
          <div class="stat-allocated">割り挫り済み: <strong>+{{ allocatedStats.speed }}P</strong></div>
        </div>
      </div>

      <div class="stat-manager-actions">
        <button class="btn btn-primary" :disabled="totalTempAlloc === 0 || isRunLocked" @click="$emit('apply')">
          適用 ({{ totalTempAlloc }}SP使用)
        </button>
        <button class="btn btn-danger" :disabled="isRunLocked" @click="handleReset">
          リセット
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/types'
import { computed } from 'vue'

interface TempAlloc {
  maxHp: number
  attack: number
  magic: number
  defense: number
  magicDefense: number
  speed: number
  statusPower: number
}

type Emits = {
  (e: 'close'): void
  (e: 'apply'): void
  (e: 'reset'): void
  (e: 'reset-single-stat', stat: keyof TempAlloc): void
  (e: 'update:tempStatAlloc', value: TempAlloc): void
}

const props = defineProps<{
  show: boolean
  player: Player
  tempStatAlloc: TempAlloc
  allocatedStats: TempAlloc
  totalTempAlloc: number
  isRunLocked: boolean
}>()

const emit = defineEmits<Emits>()

const adjustStat = (field: keyof TempAlloc, delta: number) => {
  const newValue = Math.max(0, props.tempStatAlloc[field] + delta)
  const getMaxForStat = (stat: keyof TempAlloc) => {
    const otherStats = (Object.keys(props.tempStatAlloc) as Array<keyof TempAlloc>)
      .filter(s => s !== stat)
      .reduce((sum, s) => sum + props.tempStatAlloc[s], 0)
    return Math.max(0, props.player.statPoints - otherStats)
  }
  const maxVal = getMaxForStat(field)
  const clampedValue = Math.min(newValue, maxVal)
  emit('update:tempStatAlloc', { ...props.tempStatAlloc, [field]: clampedValue })
}

const resetStat = (stat: keyof TempAlloc) => {
  emit('reset-single-stat', stat)
}

// 各ステータスの残りSPを計算（合計がplayer.statPointsを超えない）
const getMaxForStat = (stat: keyof TempAlloc) => {
  const otherStats = (Object.keys(props.tempStatAlloc) as Array<keyof TempAlloc>)
    .filter(s => s !== stat)
    .reduce((sum, s) => sum + props.tempStatAlloc[s], 0)
  
  return Math.max(0, props.player.statPoints - otherStats)
}

const handleReset = () => {
  // UI 上の一時割り振りをクリア
  emit('update:tempStatAlloc', {
    maxHp: 0,
    attack: 0,
    magic: 0,
    defense: 0,
    magicDefense: 0,
    speed: 0,
    statusPower: 0,
  })
  // 実際のステータスリセット
  emit('reset')
}

const maxHpMax = computed(() => getMaxForStat('maxHp'))
const attackMax = computed(() => getMaxForStat('attack'))
const magicMax = computed(() => getMaxForStat('magic'))
const defenseMax = computed(() => getMaxForStat('defense'))
const magicDefenseMax = computed(() => getMaxForStat('magicDefense'))
const speedMax = computed(() => getMaxForStat('speed'))
const statusPowerMax = computed(() => getMaxForStat('statusPower'))
</script>
