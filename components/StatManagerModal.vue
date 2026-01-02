<template>
  <div v-if="show" class="stat-modal">
    <div class="stat-content stat-manager-content">
      <div class="modal-header">
        <h2>🧠 ステータス割り振り</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      <p class="stat-subtitle">残りSP: {{ player.statPoints }}</p>
      
      <div class="stat-sliders">
        <StatSpinner
          icon="❤️"
          label="最大HP"
          :current-value="tempStatAlloc.maxHp"
          :max-value="maxHpMax"
          :multiplier="25"
          :allocated-value="allocatedStats.maxHp"
          :current-stat="player.maxHp"
          :is-run-locked="isRunLocked"
          @adjust="(delta) => adjustStat('maxHp', delta)"
          @reset="resetStat('maxHp')"
        />

        <StatSpinner
          icon="🔮"
          label="状態異常威力"
          :current-value="tempStatAlloc.statusPower"
          :max-value="statusPowerMax"
          :multiplier="4"
          :allocated-value="allocatedStats.statusPower"
          :current-stat="player.stats.statusPower"
          :is-run-locked="isRunLocked"
          @adjust="(delta) => adjustStat('statusPower', delta)"
          @reset="resetStat('statusPower')"
        />

        <StatSpinner
          icon="⚔️"
          label="攻撃力"
          :current-value="tempStatAlloc.attack"
          :max-value="attackMax"
          :multiplier="5"
          :allocated-value="allocatedStats.attack"
          :current-stat="player.stats.attack"
          :is-run-locked="isRunLocked"
          @adjust="(delta) => adjustStat('attack', delta)"
          @reset="resetStat('attack')"
        />

        <StatSpinner
          icon="🔮"
          label="魔法力"
          :current-value="tempStatAlloc.magic"
          :max-value="magicMax"
          :multiplier="5"
          :allocated-value="allocatedStats.magic"
          :current-stat="player.stats.magic"
          :is-run-locked="isRunLocked"
          @adjust="(delta) => adjustStat('magic', delta)"
          @reset="resetStat('magic')"
        />

        <StatSpinner
          icon="🛡️"
          label="防御力"
          :current-value="tempStatAlloc.defense"
          :max-value="defenseMax"
          :multiplier="3"
          :allocated-value="allocatedStats.defense"
          :current-stat="player.stats.defense"
          :is-run-locked="isRunLocked"
          @adjust="(delta) => adjustStat('defense', delta)"
          @reset="resetStat('defense')"
        />

        <StatSpinner
          icon="✨"
          label="魔法防御"
          :current-value="tempStatAlloc.magicDefense"
          :max-value="magicDefenseMax"
          :multiplier="3"
          :allocated-value="allocatedStats.magicDefense"
          :current-stat="player.stats.magicDefense"
          :is-run-locked="isRunLocked"
          @adjust="(delta) => adjustStat('magicDefense', delta)"
          @reset="resetStat('magicDefense')"
        />

        <StatSpinner
          icon="⚡"
          label="速度"
          :current-value="tempStatAlloc.speed"
          :max-value="speedMax"
          :multiplier="2"
          :allocated-value="allocatedStats.speed"
          :current-stat="player.stats.speed"
          :is-run-locked="isRunLocked"
          @adjust="(delta) => adjustStat('speed', delta)"
          @reset="resetStat('speed')"
        />
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
import StatSpinner from './StatSpinner.vue'

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

<style scoped>
.stat-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.stat-content {
  background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(40, 35, 50, 0.95));
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 20px;
  max-width: 900px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5em;
  color: #fff;
}

.btn-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5em;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-close:hover {
  opacity: 1;
}

.stat-subtitle {
  margin: 0 0 16px 0;
  color: #4ecdc4;
  font-weight: 600;
}

.stat-sliders {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-manager-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5dd9d1, #50b89a);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #ec7063, #d93e2f);
  transform: translateY(-2px);
}

.btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
