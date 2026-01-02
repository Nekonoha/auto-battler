<template>
  <div class="stat-slider-item">
    <div class="stat-slider-header">
      <span class="stat-icon">{{ icon }}</span>
      <span class="stat-name">{{ label }}</span>
      <button 
        v-if="allocatedValue > 0"
        class="btn btn-mini btn-danger"
        @click="$emit('reset')"
        :disabled="isRunLocked"
        title="このステータスのみリセット"
      >
        ↺
      </button>
    </div>
    <div class="stat-spinner">
      <button 
        class="btn btn-spinner btn-spinner-small"
        @click="$emit('adjust', -100)"
        :disabled="isRunLocked || currentValue < 100"
        title="100ずつ減らす"
      >
        -100
      </button>
      <button 
        class="btn btn-spinner btn-spinner-small"
        @click="$emit('adjust', -10)"
        :disabled="isRunLocked || currentValue <= 0"
        title="10ずつ減らす"
      >
        -10
      </button>
      <button 
        class="btn btn-spinner"
        @click="$emit('adjust', -1)"
        :disabled="isRunLocked || currentValue <= 0"
        title="1ずつ減らす"
      >
        −
      </button>
      <div class="stat-spinner-display">
        <div class="spinner-point">+{{ currentValue }} P</div>
        <div class="spinner-value">+{{ currentValue * multiplier }}</div>
      </div>
      <button 
        class="btn btn-spinner"
        @click="$emit('adjust', 1)"
        :disabled="isRunLocked || currentValue >= maxValue"
        title="1ずつ増やす"
      >
        +
      </button>
      <button 
        class="btn btn-spinner btn-spinner-small"
        @click="$emit('adjust', 10)"
        :disabled="isRunLocked || currentValue >= maxValue"
        title="10ずつ増やす"
      >
        +10
      </button>
      <button 
        class="btn btn-spinner btn-spinner-small"
        @click="$emit('adjust', 100)"
        :disabled="isRunLocked || currentValue >= maxValue"
        title="100ずつ増やす"
      >
        +100
      </button>
    </div>
    <div class="stat-slider-info">
      <div class="stat-current">現在: <strong>{{ currentStat }}</strong></div>
      <div class="stat-after">→ <strong>{{ currentStat + currentValue * multiplier }}</strong></div>
    </div>
    <div class="stat-allocated">割り振り済み: <strong>+{{ allocatedValue }}P</strong></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  currentValue: number
  maxValue: number
  multiplier: number
  allocatedValue: number
  currentStat: number
  isRunLocked: boolean
}>()

defineEmits<{
  (e: 'adjust', delta: number): void
  (e: 'reset'): void
}>()
</script>

<style scoped>
.stat-slider-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-slider-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.stat-icon {
  font-size: 1.2em;
}

.stat-name {
  font-weight: 600;
  flex: 1;
}

.btn-mini {
  padding: 2px 6px;
  font-size: 0.85em;
  border-radius: 4px;
}

.stat-spinner {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.btn-spinner {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: #fff;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-spinner:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-spinner:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-spinner-small {
  padding: 4px 8px;
  font-size: 0.8em;
}

.stat-spinner-display {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
  padding: 0 8px;
  min-width: 70px;
}

.spinner-point {
  font-size: 0.85em;
  color: #4ecdc4;
  font-weight: 600;
}

.spinner-value {
  font-size: 0.9em;
  color: #fff;
  font-weight: 600;
}

.stat-slider-info {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
}

.stat-current,
.stat-after {
  display: flex;
  gap: 4px;
}

.stat-allocated {
  text-align: center;
  font-size: 0.85em;
  opacity: 0.8;
}

.btn {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-danger {
  background: rgba(231, 76, 60, 0.6);
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(231, 76, 60, 0.8);
}

.btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
