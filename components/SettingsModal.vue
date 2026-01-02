<template>
  <div v-if="show" class="loot-modal">
    <div class="loot-content">
      <div class="modal-header">
        <h2>⚙️ 設定</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
type Emits = {
  (e: 'close'): void
  (e: 'export-combat'): void
  (e: 'export-exploration'): void
  (e: 'export-dungeon'): void
}

defineProps<{
  show: boolean
  combatLogsLength: number
  explorationLogsLength: number
  dungeonLogsLength: number
}>()

defineEmits<Emits>()
</script>
