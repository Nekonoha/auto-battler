<template>
  <div class="panel dungeon-panel">
    <div class="panel-header">
      <h2>ダンジョン</h2>
      <div class="chips">
        <span class="chip">ステージ {{ currentStage }}/{{ totalStages }}</span>
        <span class="chip">状態 {{ currentEventLabel }}</span>
        <span class="chip">未開封カード {{ chestCount }}</span>
        <span v-if="hasPendingChest" class="chip warning">パック保留中</span>
        <span v-if="isDebugMode" class="chip debug">DEBUG</span>
      </div>
    </div>

    <div class="dungeon-picker">
      <div class="dungeon-info">
        <label for="dungeon-select">ダンジョン</label>
        <select id="dungeon-select" :value="selectedDungeonId" :disabled="isRunLocked" @change="onSelect">
          <option
            v-for="dungeon in dungeonOptions"
            :key="dungeon.id"
            :value="dungeon.id"
            :disabled="!isDungeonUnlocked(dungeon.id)"
          >
            {{ dungeon.name }} (Lv{{ dungeon.levelRange[0] }}-{{ dungeon.levelRange[1] }}) {{ isDungeonUnlocked(dungeon.id) ? '' : '🔒' }}
          </option>
        </select>
      </div>
      <div class="dungeon-desc" v-if="selectedDungeon">
        <div class="dungeon-name">{{ selectedDungeon.name }}</div>
        <div class="dungeon-text">{{ selectedDungeon.description }}</div>
        <div class="dungeon-meta">
          敵レベル: {{ selectedDungeon.levelRange[0] }}-{{ selectedDungeon.levelRange[1] }} / パック出現率: {{ Math.round((selectedDungeon.chestChance ?? 0.1) * 100) }}%<br />
          レアリティ傾向: {{ rarityDisplay }}
        </div>
      </div>
    </div>

    <div class="button-row">
      <button class="btn btn-action" @click="$emit('start')" :disabled="isRunLocked">
        探索開始 (10ステージ)
      </button>
      <button
        class="btn btn-success"
        @click="$emit('next')"
        :disabled="!canProceedNext"
      >
        次のステージへ
      </button>
      <button class="btn btn-danger" @click="$emit('abandon')" :disabled="!isDungeonRunning">
        探索中止
      </button>
    </div>

    <div class="chest-action">
      <button class="btn btn-special" @click="$emit('open-chest')">
        🎁 パックを開封 ({{ chestCount }}枚保留中)
      </button>
    </div>

    <div class="auto-row">
      <div class="speed-label">AUTO</div>
      <button
        class="btn btn-secondary btn-compact"
        @click="$emit('toggle-auto')"
        :disabled="autoDisabled"
      >
        {{ isAutoRunning ? '一時停止' : '再開' }}
      </button>
      <div class="speed-buttons">
        <button
          class="btn btn-secondary btn-compact"
          :class="{ active: battleSpeed === 1 }"
          @click="$emit('change-speed', 1)"
        >
          x1
        </button>
        <button
          class="btn btn-secondary btn-compact"
          :class="{ active: battleSpeed === 2 }"
          @click="$emit('change-speed', 2)"
        >
          x2
        </button>
        <button
          class="btn btn-secondary btn-compact"
          :class="{ active: battleSpeed === 4 }"
          @click="$emit('change-speed', 4)"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dungeon } from '~/types'

type DungeonUnlockChecker = (id: string) => boolean

type Emits = {
  (e: 'update:selectedDungeonId', value: string): void
  (e: 'start'): void
  (e: 'next'): void
  (e: 'abandon'): void
  (e: 'open-chest'): void
  (e: 'toggle-auto'): void
  (e: 'change-speed', value: number): void
}

const props = defineProps<{
  selectedDungeonId: string
  dungeonOptions: Dungeon[]
  selectedDungeon?: Dungeon
  currentStage: number
  totalStages: number
  currentEventLabel: string
  chestCount: number
  hasPendingChest: boolean
  isDebugMode: boolean
  isRunLocked: boolean
  isDungeonRunning: boolean
  isAutoRunning: boolean
  battleSpeed: number
  infoMessages: string[]
  canProceedNext: boolean
  autoDisabled: boolean
  isDungeonUnlocked: DungeonUnlockChecker
}>()

const emit = defineEmits<Emits>()

const rarityDisplay = computed(() => {
  const weights = props.selectedDungeon?.lootWeights
  if (!weights) return ''

  const baseOrder = ['common', 'rare', 'epic', 'legendary', 'mythic']
  const mythicPlusOrder = Object.keys(weights)
    .filter(key => key.startsWith('mythic') && !baseOrder.includes(key))
    .sort()
  const otherOrder = Object.keys(weights)
    .filter(key => !baseOrder.includes(key) && !mythicPlusOrder.includes(key))
    .sort()
  const orderedKeys = [...baseOrder, ...mythicPlusOrder, ...otherOrder]

  const labelFor = (key: string) => {
    if (key === 'legendary') return 'Legend'
    if (key === 'mythic') return 'Mythic'
    if (key.startsWith('mythic')) return `Mythic${key.slice('mythic'.length)}`
    return key.charAt(0).toUpperCase() + key.slice(1)
  }

  return orderedKeys
    .filter(key => weights[key] > 0)
    .map(key => {
      const percent = Math.round(weights[key] * 1000) / 10
      const formatted = percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(1)
      return `${labelFor(key)} ${formatted}%`
    })
    .join('・')
})

const onSelect = (event: Event) => {
  const value = (event.target as HTMLSelectElement)?.value
  emit('update:selectedDungeonId', value)
}
</script>
