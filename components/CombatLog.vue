<template>
  <div class="combat-log">
    <h3>📜 戦闘ログ</h3>
    <div class="log-container" ref="logContainer">
      <div 
        v-for="(entry, index) in logs" 
        :key="index"
        class="log-entry"
        :class="[
          `log-${entry.type}`,
          entry.actor && `log-actor-${entry.actor}`,
          entry.actionCategory && `log-action-${entry.actionCategory}`
        ]"
      >
        <div class="log-content">
          <span class="log-turn">[{{ formatTurn(entry) }}]</span>
          <span class="log-message">{{ entry.message }}</span>
        </div>
      </div>
      <div v-if="logs.length === 0" class="log-empty">
        戦闘を開始してください
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { CombatLogEntry } from '~/types'

const props = defineProps<{
  logs: CombatLogEntry[]
}>()

const formatTurn = (entry: CombatLogEntry) => {
  if (!entry.turn || entry.turn <= 0 || entry.type === 'loot') return '--'
  return `T${entry.turn}`
}

const logContainer = ref<HTMLElement | null>(null)

// ログが追加されたら自動スクロール
watch(() => props.logs.length, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})
</script>

<style scoped>
.combat-log {
  background: #2c3e50;
  padding: 15px;
  border-radius: 12px;
  color: white;
  height: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #ecf0f1;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.log-entry {
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 8px;
  animation: slideIn 0.2s ease;
}

/* 配置スタイル */
.log-align-left {
  justify-content: flex-start;
}

.log-align-right {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

.log-align-center {
  justify-content: center;
  text-align: center;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.log-content {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
}

/* プレイヤー行動：青い枠 */
.log-actor-player {
  border-left: 3px solid #3498db;
  background: rgba(52, 152, 219, 0.05);
}

/* 敵の行動：赤い枠 */
.log-actor-enemy {
  border-left: 3px solid #e74c3c;
  background: rgba(231, 76, 60, 0.05);
}

/* システムメッセージ：グレー枠 */
.log-entry:not([class*="log-actor"]) {
  border-left: 3px solid #95a5a6;
  background: rgba(149, 165, 166, 0.05);
}

.log-turn {
  color: #95a5a6;
  font-weight: bold;
  min-width: 40px;
  flex-shrink: 0;
}

.log-message {
  flex: 1;
}

.log-damage {
  border-left: 3px solid #e74c3c;
  border-color: rgba(231, 76, 60, 0.4);
  background: rgba(231, 76, 60, 0.08);
}

.log-status {
  border-left: 3px solid #9b59b6;
  border-color: rgba(155, 89, 182, 0.4);
  background: rgba(155, 89, 182, 0.08);
}

.log-info {
  border-left: 3px solid #3498db;
  border-color: rgba(52, 152, 219, 0.45);
  background: rgba(52, 152, 219, 0.08);
}

.log-critical {
  border-left: 3px solid #f39c12;
  border-color: rgba(243, 156, 18, 0.8);
  background: linear-gradient(90deg, rgba(243, 156, 18, 0.18), rgba(243, 156, 18, 0.1));
  box-shadow: 0 0 0 1px rgba(243, 156, 18, 0.35), 0 6px 18px rgba(243, 156, 18, 0.18);
  font-weight: bold;
}

.log-loot {
  border-left: 3px solid #2ecc71;
  border-color: rgba(46, 204, 113, 0.65);
  background: rgba(46, 204, 113, 0.18);
  box-shadow: 0 0 0 1px rgba(46, 204, 113, 0.3);
  font-weight: bold;
  color: #2ecc71;
}

.log-empty {
  text-align: center;
  padding: 40px 20px;
  color: #95a5a6;
  font-style: italic;
}
</style>
