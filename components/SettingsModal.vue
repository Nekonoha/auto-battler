<template>
  <div v-if="show" class="loot-modal">
    <div class="loot-content">
      <div class="modal-header">
        <h2>📋 メニュー</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <div class="settings-scrollable">
        <div class="settings-section">
          <h3 class="settings-title">💾 セーブ / ロード</h3>
          <div class="settings-buttons">
            <button 
              class="btn btn-primary" 
              @click="$emit('open-save-load')"
              style="width: 100%;"
            >
              💾 セーブ / ロード
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h3 class="settings-title">📊 ログエクスポート</h3>
          <div class="settings-buttons">
            <button 
              class="btn btn-info" 
              @click="$emit('export-combat')" 
              :disabled="combatLogsLength === 0"
              style="width: 100%;"
            >
              📝 現在の戦闘ログをエクスポート ({{ combatLogsLength }}件)
            </button>
            <button 
              class="btn btn-info" 
              @click="$emit('export-exploration')" 
              :disabled="explorationLogsLength === 0"
              style="width: 100%;"
            >
              🧭 探索戦闘ログをエクスポート ({{ explorationLogsLength }}件)
            </button>
            <button 
              class="btn btn-info" 
              @click="$emit('export-dungeon')" 
              :disabled="dungeonLogsLength === 0"
              style="width: 100%;"
            >
              🏰 ダンジョンログをエクスポート ({{ dungeonLogsLength }}件)
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h3 class="settings-title">🐞 デバッグツール</h3>
          <div class="settings-buttons">
            <button 
              class="btn btn-secondary" 
              @click="$emit('open-debug-weapon')"
              style="width: 100%;"
            >
              🐞 デバッグ武器を付与
            </button>
            <button 
              class="btn btn-special" 
              @click="$emit('open-debug-enemy')"
              style="width: 100%;"
            >
              🐞 デバッグ敵とスパーリング
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Emits = {
  (e: 'close'): void
  (e: 'open-save-load'): void
  (e: 'export-combat'): void
  (e: 'export-exploration'): void
  (e: 'export-dungeon'): void
  (e: 'open-debug-weapon'): void
  (e: 'open-debug-enemy'): void
}

defineProps<{
  show: boolean
  combatLogsLength: number
  explorationLogsLength: number
  dungeonLogsLength: number
}>()

defineEmits<Emits>()
</script>

<style scoped>
.settings-scrollable {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
}

.settings-scrollable::-webkit-scrollbar {
  width: 8px;
}

.settings-scrollable::-webkit-scrollbar-track {
  background: #0f1419;
  border-radius: 4px;
}

.settings-scrollable::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.settings-scrollable::-webkit-scrollbar-thumb:hover {
  background: #667085;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-title {
  font-size: 1.1rem;
  margin-bottom: 12px;
  color: #fff;
}

.settings-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
