<template>
  <div v-if="show" class="loot-modal">
    <div class="loot-content">
      <div class="modal-header">
        <h2>🐞 デバッグ敵</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <p class="modal-note">テンプレートを選んでスパーリングを開始します。</p>

      <div class="debug-scrollable">
        <div class="debug-list">
          <div class="debug-card" v-for="enemy in enemies" :key="enemy.id ?? 'none'">
            <div class="debug-card-title">{{ enemy.label }}</div>
            <div class="debug-card-sub">テンプレートID: {{ enemy.id ?? 'なし' }}</div>
            <div class="debug-card-actions">
              <button class="btn btn-special" @click="$emit('select', enemy.id)">開始</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  enemies: { id: string | undefined; label: string }[]
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'select', id?: string): void
}>()
</script>

<style scoped>
.modal-note {
  margin: 0.25rem 0 0.75rem;
  color: #ddd;
  font-size: 0.95rem;
}

.debug-scrollable {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
}

.debug-scrollable::-webkit-scrollbar {
  width: 8px;
}

.debug-scrollable::-webkit-scrollbar-track {
  background: #0f1419;
  border-radius: 4px;
}

.debug-scrollable::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.debug-scrollable::-webkit-scrollbar-thumb:hover {
  background: #667085;
}

.debug-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.debug-card {
  background: #1f1f2b;
  border: 1px solid #33384a;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.debug-card-title {
  font-weight: 600;
}

.debug-card-sub {
  color: #aaa;
  font-size: 0.9rem;
}

.debug-card-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
