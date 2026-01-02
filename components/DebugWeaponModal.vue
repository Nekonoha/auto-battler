<template>
  <div v-if="show" class="loot-modal">
    <div class="loot-content">
      <div class="modal-header">
        <h2>🐞 デバッグ武器</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <p class="modal-note">プリセットをクリックして付与できます。カスタム入力も利用可能です。</p>

      <div class="debug-scrollable">
        <div class="debug-list">
          <div class="debug-card" v-for="preset in presets" :key="preset.id">
            <div class="debug-card-title">{{ preset.label }}</div>
            <div class="debug-card-sub">ID: {{ preset.id }}</div>
            <div class="debug-card-actions">
              <button class="btn btn-secondary" @click="$emit('select', preset.id)">付与</button>
            </div>
          </div>

          <div class="debug-card custom-card">
            <div class="debug-card-title">カスタム入力</div>
            <div class="debug-card-sub">自由にステータス・効果を指定</div>
            <div class="debug-card-actions">
              <button class="btn btn-primary" @click="$emit('custom')">カスタム武器を作成</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Weapon } from '~/types'

defineProps<{
  show: boolean
  presets: { id: string; label: string; weapon: Weapon }[]
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'select', id: string): void
  (e: 'custom'): void
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

.custom-card {
  border-style: dashed;
  border-color: #4e72ff;
}
</style>
