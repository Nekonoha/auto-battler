<template>
  <div v-if="show" class="weapon-selection-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>🎁 宝箱を開封</h2>
        <div class="modal-header-buttons">
          <button @click="$emit('close')" class="btn-close">×</button>
        </div>
      </div>

      <div class="chest-controls">
        <div class="chest-control-row">
          <label>開封する数 (最大10個)</label>
          <input
            type="number"
            class="chest-count-input"
            v-model.number="localChestOpenCount"
            :min="1"
            :max="Math.min(10, chestCount)"
            :disabled="chestCount === 0"
          />
          <button class="btn btn-primary" @click="$emit('open-chests', localChestOpenCount)" :disabled="chestCount === 0 || isChestOpening">
            開封する
          </button>
          <button class="btn btn-secondary" @click="$emit('open-chests', Math.min(10, chestCount))" :disabled="chestCount === 0 || isChestOpening">
            最大開封
          </button>
        </div>
        <div class="chest-hint">最新のドロップ元: {{ lastLootSourceLabel }} / 保留中 {{ chestCount }} 個</div>
      </div>

      <!-- 開封済み武器リスト -->
      <div v-if="chestDropCards.length > 0" class="available-weapons">
        <h3>📦 開封結果 ({{ chestDropCards.length }})</h3>
        <div v-if="chestDropCards.length === 0" class="empty-slot">
          まだ開封されていません
        </div>
        <div v-else class="weapon-grid">
          <div
            v-for="card in chestDropCards"
            :key="card.id"
            class="weapon-card-wrapper"
            :style="{ '--card-delay': card.delay + 'ms' }"
          >
            <WeaponDetails :weapon="card.weapon" :showRarityBadge="true" :compact="true" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { WeaponSystem } from '~/systems/WeaponSystem'
import WeaponDetails from './WeaponDetails.vue'
import type { Weapon } from '~/types'

interface ChestDropCard {
  id: string
  weapon: Weapon
  delay: number
}

interface ChestLootEntry {
  id: string
  name: string
  rarity: string
  status: string
  level: number
  tier: string
  timestamp: number
}

interface Props {
  show: boolean
  chestCount: number
  chestOpenCount: number
  isChestOpening: boolean
  lastLootSourceLabel: string
  chestLootHistory: ChestLootEntry[]
  chestDropCards: ChestDropCard[]
  formatTime: (timestamp: number) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'open-chests': [count: number]
}>()

const localChestOpenCount = ref(props.chestOpenCount)

watch(() => props.chestOpenCount, (val) => {
  localChestOpenCount.value = val
})

const getRarityColor = (rarity: string) => {
  return WeaponSystem.getRarityColor(rarity)
}
</script>

<style scoped>
@keyframes chestBounce {
  0% {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes chestGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(255, 215, 0, 0.2);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
  }
}

.weapon-selection-modal {
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  max-height: 90vh;
  max-width: 90vw;
  overflow-y: auto;
  padding: 20px;
  color: #e0e0e0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.modal-header-buttons {
  display: flex;
  gap: 10px;
}

.btn-close {
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.chest-controls {
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.chest-control-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.chest-control-row label {
  font-size: 14px;
}

.chest-count-input {
  width: 60px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #2c3446 0%, #202735 100%);
  color: #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3c4456 0%, #303745 100%);
}

.chest-hint {
  font-size: 12px;
  opacity: 0.7;
}

h3 {
  margin: 15px 0 10px 0;
  font-size: 16px;
}

.available-weapons {
  margin-top: 20px;
}

.weapon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

@media (min-width: 1100px) {
  .weapon-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.weapon-card-wrapper {
  animation: chestBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-delay: var(--card-delay, 0ms);
}

.empty-slot {
  text-align: center;
  padding: 16px;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.25);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
</style>
