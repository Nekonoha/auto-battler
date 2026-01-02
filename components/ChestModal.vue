<template>
  <div v-if="show" class="loot-modal">
    <div class="loot-content chest-open-content">
      <div class="confetti" :class="{ active: isChestOpening }"></div>
      <div class="modal-header">
        <h2>🎁 宝箱を開封</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <div class="chest-visual" :class="{ opening: isChestOpening }">
        <div class="chest-lid"></div>
        <div class="chest-box"></div>
        <div class="chest-count-chip">保留中 {{ chestCount }} 個</div>
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
        <div class="chest-hint">最新のドロップ元: {{ lastLootSourceLabel }} / まとめて最大10個まで開封できます</div>
      </div>

      <div class="chest-drop-cards" v-if="chestDropCards.length">
        <div
          v-for="card in chestDropCards"
          :key="card.id"
          class="chest-reward-card"
          :style="{ borderColor: getRarityColor(card.rarity) }"
        >
          <div class="chest-reward-header">
            <div class="chest-reward-name">{{ card.name }}</div>
            <div class="header-badges">
              <span class="weapon-rarity" :style="{ backgroundColor: getRarityColor(card.rarity) }">
                {{ card.rarity.toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="chest-reward-status">{{ card.status }}</div>
          <div class="chest-reward-meta">Tier: {{ card.tier.toUpperCase() }} / Lv: {{ card.level }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { WeaponSystem } from '~/systems/WeaponSystem'

interface ChestDropCard {
  id: string
  name: string
  rarity: string
  status: string
  level: number
  tier: string
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
/* 既存のスタイルはindex.vueから移動 */
</style>
